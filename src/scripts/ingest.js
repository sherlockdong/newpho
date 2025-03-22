const weaviate = require("weaviate-client");
const fs = require("fs");
const path = require("path");

const physicsDataTemplate = {
  title: "",
  content: "",
  tags: [],
};

async function ingestData() {
  let client;
  try {
    console.log("Connecting to Weaviate...");
    client = await weaviate.connectToLocal({
      host: "localhost",
      port: 8080,
      grpcPort: 50051,
    });
    console.log("Connected to Weaviate");
  } catch (error) {
    console.error("Failed to connect to Weaviate:", error.message);
    return;
  }

  const classObj = {
    class: "PhysicsText",
    properties: [
      { name: "title", dataType: ["string"] },
      { name: "content", dataType: ["text"] },
      { name: "tags", dataType: ["string[]"] },
    ],
  };

  try {
    console.log("Creating schema...");
    await client.collections.create(classObj);
    console.log("PhysicsText schema created");
  } catch (error) {
    console.warn("Schema might already exist:", error.message);
  }

  const topicsDir = path.join(__dirname, "../data/physicsTopics");
  console.log("Reading directory:", topicsDir);

  try {
    const files = fs.readdirSync(topicsDir);
    console.log("Found files:", files);

    const collection = client.collections.get("PhysicsText");
    for (const file of files) {
      if (path.extname(file) === ".json") {
        const filePath = path.join(topicsDir, file);
        console.log("Processing file:", filePath);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const rawData = JSON.parse(fileContent);

        const physicsData = {
          ...physicsDataTemplate,
          title: rawData.title || "",
          content: rawData.content || "",
          tags: Array.isArray(rawData.tags) ? rawData.tags : [],
        };
        console.log("Data to ingest:", physicsData);

        await collection.data.insert(physicsData);
        console.log(`Ingested ${file}`);
      }
    }
  } catch (error) {
    console.error("Error during ingestion:", error.message);
  } finally {
    client.close();
  }
}

ingestData();