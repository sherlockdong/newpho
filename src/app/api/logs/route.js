
import { verifyFirebaseToken } from "../../../middleware/auth"; 

let quizLogs = [];

export async function GET(req) {
  try {
    console.log("GET /api/logs called with URL:", req.url); 
    const authResponse = await verifyFirebaseToken(req);
    if (authResponse) {
      console.log("Authentication failed, status:", authResponse.status); 
      return authResponse;
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      console.log("Missing userId in query parameters"); 
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Fetching logs for userId:", userId); 
    const userLogs = quizLogs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log("Logs fetched, count:", userLogs.length); 
    return new Response(JSON.stringify(userLogs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/logs error:", err.message, err.stack); 
    return new Response(JSON.stringify({ error: "Internal server error: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    console.log("POST /api/logs called"); 
    const authResponse = await verifyFirebaseToken(req);
    if (authResponse) {
      console.log("Authentication failed, status:", authResponse.status); 
      return authResponse;
    }

    const body = await req.json();
    console.log("POST body received:", body); 
    if (!body.userId) {
      console.log("Missing userId in request body");
      return new Response(JSON.stringify({ error: "Missing userId in body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const log = {
      ...body,
      timestamp: new Date().toISOString(),
      logId: quizLogs.length + 1, 
    };
    quizLogs.push(log);
    console.log("Log saved for userId:", body.userId); 
    return new Response(JSON.stringify({ logId: log.logId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/logs error:", err.message, err.stack); 
    return new Response(JSON.stringify({ error: "Internal server error: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req) {
  try {
    console.log("DELETE /api/logs called with URL:", req.url);
    const authResponse = await verifyFirebaseToken(req);
    if (authResponse) {
      console.log("Authentication failed, status:", authResponse.status); 
      return authResponse;
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      console.log("Missing userId in query parameters"); 
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    quizLogs = quizLogs.filter(log => log.userId !== userId);
    console.log("Logs deleted for userId:", userId);
    return new Response(JSON.stringify({ message: "Logs deleted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DELETE /api/logs error:", err.message, err.stack);
    return new Response(JSON.stringify({ error: "Internal server error: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}