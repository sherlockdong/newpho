import dotenv from "dotenv";
import weaviate from "weaviate-ts-client";
import fs from "fs/promises";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

console.log("WEAVIATE_URL:", process.env.WEAVIATE_URL);
console.log("WEAVIATE_ADMIN_KEY:", process.env.WEAVIATE_ADMIN_KEY);

if (!process.env.WEAVIATE_URL || !process.env.WEAVIATE_ADMIN_KEY) {
  throw new Error("Missing WEAVIATE_URL or WEAVIATE_ADMIN_KEY in .env.local");
}

const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_URL.replace("https://", ""),
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_ADMIN_KEY),
});

async function setupWeaviate() {
  console.log("Testing client connection...");
  try {
    const schema = await client.schema.getter().do();
    console.log("Connection successful!");
  } catch (err) {
    throw new Error("Connection test failed: " + err.message);
  }

  const schemaDefinition = {
    class: "PhysicsContent",
    properties: [
      { name: "title", dataType: ["string"] },
      { name: "content", dataType: ["text"] },
      { name: "tags", dataType: ["string[]"] },
      { name: "authorNote", dataType: ["text"] },
    ],
  };

  console.log("Creating schema...");
  try {
    await client.schema.classCreator().withClass(schemaDefinition).do();
    console.log("Schema created successfully.");
  } catch (err) {
    if (err.message.includes("already exists")) {
      console.log("Schema exists, proceeding...");
    } else {
      throw err;
    }
  }

  console.log("Accessing collection...");
  const dir = path.join(process.cwd(), "src/data/physicstopics");
  const files = await fs.readdir(dir);
  for (const file of files.filter((f) => f.endsWith(".json"))) {
    const content = JSON.parse(await fs.readFile(path.join(dir, file), "utf-8"));
    const items = Array.isArray(content) ? content : [content];
    for (const item of items) {
      console.log(`Inserting: ${item.title || file}`);
      await client.data
        .creator()
        .withClassName("PhysicsContent")
        .withProperties({
          title: item.title || file.replace(".json", ""),
          content: item.content,
          tags: item.tags,
          authorNote: "My take: " + (item.content.slice(0, 50) + "..."),
        })
        .do();
    }
  }
  console.log("Setup complete! Data imported.");
}

setupWeaviate().catch((err) => console.error("Error setting up Weaviate:", err));