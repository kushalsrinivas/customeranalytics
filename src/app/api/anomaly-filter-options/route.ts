import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    // Connect to SQLite database
    const dbPath = path.join(process.cwd(), 'src', 'lib', 'customers.db');
    const db = new Database(dbPath, { readonly: true });

    // Get actual market segments (what the code calls "regions")
    const marketsQuery = `
      SELECT DISTINCT c."Market Desc" as market
      FROM dbo_D_Customer c
      WHERE c."Sales Activity Flag" = 1 
        AND c."Market Desc" IS NOT NULL
      ORDER BY market
    `;
    
    const marketStmt = db.prepare(marketsQuery);
    const marketRows = marketStmt.all() as Array<{market: string}>;
    
    const regions = marketRows.map(row => ({
      value: row.market,
      label: row.market
    }));

    // Get actual countries
    const countriesQuery = `
      SELECT DISTINCT c."Customer Country" as country
      FROM dbo_D_Customer c
      WHERE c."Sales Activity Flag" = 1 
        AND c."Customer Country" IS NOT NULL
      ORDER BY country
    `;
    
    const countryStmt = db.prepare(countriesQuery);
    const countryRows = countryStmt.all() as Array<{country: string}>;
    
    const countries = countryRows.map(row => ({
      value: row.country,
      label: row.country
    }));

    // Get actual customer segments
    const segmentsQuery = `
      SELECT DISTINCT c."Monetary Band" as segment
      FROM dbo_D_Customer c
      WHERE c."Sales Activity Flag" = 1 
        AND c."Monetary Band" IS NOT NULL
      ORDER BY segment
    `;
    
    const segmentStmt = db.prepare(segmentsQuery);
    const segmentRows = segmentStmt.all() as Array<{segment: string}>;
    
    const segments = segmentRows.map(row => ({
      value: row.segment,
      label: row.segment
    }));

    // Get top states/provinces (limit to avoid too many options)
    const statesQuery = `
      SELECT c."Customer State/Prov" as state, COUNT(*) as customer_count
      FROM dbo_D_Customer c
      WHERE c."Sales Activity Flag" = 1 
        AND c."Customer State/Prov" IS NOT NULL
      GROUP BY c."Customer State/Prov"
      ORDER BY customer_count DESC
      LIMIT 20
    `;
    
    const stateStmt = db.prepare(statesQuery);
    const stateRows = stateStmt.all() as Array<{state: string, customer_count: number}>;
    
    const states = stateRows.map(row => ({
      value: row.state,
      label: `${row.state} (${row.customer_count} customers)`
    }));

    // Close database connection
    db.close();

    return NextResponse.json({
      regions, // These are actually market segments
      countries,
      segments,
      states
    });

  } catch (error) {
    console.error('Error fetching anomaly filter options:', error);
    
    return NextResponse.json(
      { 
        regions: [],
        countries: [],
        segments: [],
        states: [],
        error: 'Failed to load filter options'
      },
      { status: 500 }
    );
  }
}
