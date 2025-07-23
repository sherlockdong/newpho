import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { topic } = await request.json(); 
    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
    const filePath = path.join(dirPath, `${topic}.json`);
    console.log("Reading file for topic:", filePath);

    let content;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      console.error("File read error:", err.message);
      throw new Error(`File not found for topic: ${topic}`);
    }

    let data;
    try {
      data = JSON.parse(content);
    } catch (err) {
      console.error(`Failed to parse JSON in ${topic}.json:`, err.message);
      throw new Error(`Invalid JSON in ${topic}.json: ${err.message}`);
    }

    const items = Array.isArray(data) ? data : [data];
    let allTags = new Set();

    items.forEach((item, index) => {
      if (item.tags && Array.isArray(item.tags)) {
        console.log(`Tags in ${topic}.json[${index}]:`, item.tags);
        item.tags.forEach(tag => allTags.add(tag));
      } else {
        console.warn(`No valid tags found in ${topic}.json[${index}]`);
      }
    });

    const tags = Array.from(allTags).map(tag => ({
      value: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
    }));
    console.log("Available tags for topic:", tags);

    return new Response(JSON.stringify({ tags }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Error fetching tags:", err.stack);
    return new Response(
      JSON.stringify({ error: `Failed to fetch tags: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}