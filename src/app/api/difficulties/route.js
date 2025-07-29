import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
    console.log("Looking for difficulties in directory:", dirPath);

    let files;
    try {
      files = await fs.readdir(dirPath);
    } catch (err) {
      console.error("Directory read error:", err.message);
      throw new Error(`Directory not found or inaccessible: ${dirPath}`);
    }

    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log("Found JSON files:", jsonFiles);
    if (jsonFiles.length === 0) {
      console.warn("No JSON files found in directory");
    }

    let allDifficulties = new Set();

    for (const file of jsonFiles) {
      const filePath = path.join(dirPath, file);
      console.log("Reading file:", filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      let data;
      try {
        data = JSON.parse(content);
      } catch (err) {
        console.error(`Failed to parse JSON in ${file}:`, err.message);
        throw new Error(`Invalid JSON in ${file}: ${err.message}`);
      }

      const items = Array.isArray(data) ? data : [data];
      items.forEach((item, index) => {
        if (item.difficulty && Array.isArray(item.difficulty) && item.difficulty.length > 0) {
          const difficulty = item.difficulty[0];
          if (typeof difficulty === 'string') {
            console.log(`Difficulty in ${file}[${index}]:`, difficulty);
            allDifficulties.add(difficulty.toLowerCase());
          } else {
            console.warn(`Invalid difficulty type in ${file}[${index}]`, difficulty);
          }
        } else {
          console.warn(`No valid difficulty found in ${file}[${index}]`, item.difficulty);
        }
      });
    }

    const difficulties = Array.from(allDifficulties).map(diff => ({
      value: diff,
      label: diff === "international baccalaureate" ? "International Baccalaureate" : diff.charAt(0).toUpperCase() + diff.slice(1),
    }));
    console.log("Available difficulties:", difficulties);

    return new Response(JSON.stringify({ difficulties }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Error fetching difficulties:", err.stack);
    return new Response(
      JSON.stringify({ error: `Failed to fetch difficulties: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}