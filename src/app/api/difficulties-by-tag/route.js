import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { topic, tag } = await request.json();
    if (!topic || !tag) {
      return new Response(JSON.stringify({ error: "Topic and tag are required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
    const filePath = path.join(dirPath, `${topic}.json`);
    console.log("Reading file for topic:", filePath);

    let content = await fs.readFile(filePath, 'utf-8');
    let data = JSON.parse(content);
    const items = Array.isArray(data) ? data : [data];
    let allDifficulties = new Set();

    items.forEach((item, index) => {
      if (
        item.tags &&
        item.tags.some(t => t.toLowerCase() === tag.toLowerCase()) && // Case-insensitive match
        item.difficulty &&
        Array.isArray(item.difficulty) &&
        item.difficulty.length > 0
      ) {
        const difficulty = item.difficulty[0];
        if (typeof difficulty === 'string') {
          console.log(`Difficulty in ${topic}.json[${index}] for tag ${tag}:`, difficulty);
          allDifficulties.add(difficulty.toLowerCase());
        }
      }
    });

    const difficulties = Array.from(allDifficulties).map(diff => ({
      value: diff,
      label: diff === "international baccalaureate" ? "International Baccalaureate" : diff.charAt(0).toUpperCase() + diff.slice(1),
    }));
    console.log(`Available difficulties for tag ${tag} in ${topic}.json:`, difficulties);

    return new Response(JSON.stringify({ difficulties }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Error fetching difficulties by tag:", err.stack);
    return new Response(
      JSON.stringify({ error: `Failed to fetch difficulties: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}