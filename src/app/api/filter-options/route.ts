import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    // Connect to SQLite database
    const dbPath = path.join(process.cwd(), 'src', 'lib', 'customers.db');
    const db = new Database(dbPath, { readonly: true });

    // Get top customers by sales amount
    const customersQuery = `
      SELECT 
        c.[Customer Key] as customer_id,
        c.[Customer Name] as customer_name
      FROM dbo_D_Customer c
      WHERE c.[Customer Key] IN (
        SELECT [Customer Key] 
        FROM dbo_F_Sales_Transaction 
        GROUP BY [Customer Key] 
        ORDER BY SUM([Net Sales Amount]) DESC 
        LIMIT 20
      )
      ORDER BY c.[Customer Name]
    `;
    
    const customerStmt = db.prepare(customersQuery);
    const customerRows = customerStmt.all() as Array<{customer_id: number, customer_name: string}>;
    
    const customers = customerRows.map(row => ({
      value: row.customer_id.toString(),
      label: row.customer_name
    }));

    // Get top product categories by transaction count
    const productsQuery = `
      SELECT 
        [Item Category Hrchy Key] as category_id,
        COUNT(*) as transaction_count
      FROM dbo_F_Sales_Transaction
      WHERE [Item Category Hrchy Key] IS NOT NULL
      GROUP BY [Item Category Hrchy Key]
      ORDER BY transaction_count DESC
      LIMIT 15
    `;
    
    const productStmt = db.prepare(productsQuery);
    const productRows = productStmt.all() as Array<{category_id: number, transaction_count: number}>;
    
    const products = productRows.map(row => ({
      value: row.category_id.toString(),
      label: `Category ${row.category_id}`
    }));

    // Close database connection
    db.close();

    return NextResponse.json({
      customers,
      products
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    
    return NextResponse.json(
      { 
        customers: [],
        products: [],
        error: 'Failed to load filter options'
      },
      { status: 500 }
    );
  }
}
