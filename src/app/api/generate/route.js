import { exec } from "child_process";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
    }

    console.log(`Received prompt: "${prompt}"`);

    return new Promise((resolve) => {
      const scriptPath = "./scripts/generate_text.py";
      exec(`python3 ${scriptPath} "${prompt}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          resolve(new Response(JSON.stringify({ error: error.message }), { status: 500 }));
          return;
        }

        if (stderr) {
          console.error(`Python script stderr: ${stderr}`);
          resolve(new Response(JSON.stringify({ error: stderr }), { status: 500 }));
          return;
        }

        const generatedText = stdout.trim();
        console.log(`Generated Text: "${generatedText}"`);
        resolve(new Response(JSON.stringify({ generatedText }), { status: 200 }));
      });
    });
  } catch (err) {
    console.error(`Unexpected error: ${err.message}`);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
