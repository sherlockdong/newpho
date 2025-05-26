import fs from 'fs/promises';
import path from 'path';

async function getContentByTagAndDifficulty(topic, tag, difficulty) {
  const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
  const filePath = path.join(dirPath, `${topic}.json`);
  let content = '';

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const items = Array.isArray(data) ? data : [data];

    items.forEach(item => {
      if (
        item.tags &&
        item.tags.some(t => t.toLowerCase() === tag.toLowerCase()) &&
        item.difficulty
      ) {
        const itemDifficulty = Array.isArray(item.difficulty) ? item.difficulty[0] : item.difficulty;
        if (itemDifficulty && itemDifficulty.toLowerCase() === difficulty.toLowerCase()) {
          content += item.content + '\n';
          console.log(`Matched content for tag "${tag}" and difficulty "${difficulty}" in ${topic}.json:`, item.content);
        }
      }
    });

    return content.trim() || `No content found for tag "${tag}" and difficulty "${difficulty}" in ${topic}.json`;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    throw new Error(`Failed to fetch content from ${topic}.json`);
  }
}

export async function POST(request) {
  try {
    const { topic, tag, difficulty } = await request.json();
    if (!topic || !tag || !difficulty) {
      return Response.json({ error: "Topic, tag, and difficulty are required" }, { status: 400 });
    }
    const content = await getContentByTagAndDifficulty(topic, tag, difficulty);
    return Response.json({ content });
  } catch (error) {
    console.error("Content route error:", error);
    return Response.json({ error: `Failed to fetch content: ${error.message}` }, { status: 500 });
  }
}