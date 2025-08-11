export async function POST(req: Request) {
  try {
    const { message, agent }: { message?: string; agent?: string } = await req.json();

    if (!message) {
      return Response.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    // Placeholder logic for agent-specific responses
    const normalizedAgent = (agent || "").toLowerCase();
    let agentPrefix = "Assistant";
    if (normalizedAgent.includes("customer")) agentPrefix = "Customer Agent";
    else if (normalizedAgent.includes("sales")) agentPrefix = "Sales Agent";
    else if (normalizedAgent.includes("behaviour") || normalizedAgent.includes("behavior")) agentPrefix = "Behaviour Agent";

    const reply = `${agentPrefix}: Here's a placeholder response to "${message}".`;

    // Simulate minimal processing latency for demo feel
    await new Promise((r) => setTimeout(r, 250));

    return Response.json({ reply, agent: agentPrefix });
  } catch (error) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


