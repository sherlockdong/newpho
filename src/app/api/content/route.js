import fs from 'fs/promises';
import path from 'path';

async function getContentByTagAndDifficulty(topic, tag, difficulty) {
  const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
  const filePath = path.join(dirPath, `${topic}.json`);
  const matchedContents = [];  // Declare array at the top

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const items = Array.isArray(data) ? data : [data];

    const normalizedTag = tag.toLowerCase().trim();
    const normalizedDifficulty = difficulty.toLowerCase().trim();

    for (const item of items) {
      // Check tag match
      const hasTag = item.tags?.some(t => 
        typeof t === 'string' && t.toLowerCase().trim() === normalizedTag
      );

      if (!hasTag) continue;

      // Check difficulty match (flexible for arrays/single values)
      const itemDifficulties = Array.isArray(item.difficulty) 
        ? item.difficulty 
        : [item.difficulty].filter(Boolean);

      const hasDifficulty = itemDifficulties.some(d => {
        if (typeof d !== 'string') return false;
        return d.toLowerCase().trim() === normalizedDifficulty;
      });

      if (hasDifficulty) {
        // Safe content check & trim
        if (typeof item.content === 'string' && item.content.trim()) {
          matchedContents.push(item.content.trim());
        } else {
          console.warn(`Skipping invalid content in ${filePath}:`, item);
        }
      }
    }

    if (matchedContents.length === 0) {
      console.warn(`No matching content for tag="${tag}" difficulty="${difficulty}" in ${topic}.json`);
      return '';  // Return empty to allow AI to proceed
    }

    return matchedContents.join('\n\n---\n\n').trim();

  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return '';
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, tag, difficulty } = body;

    if (!topic || !tag || !difficulty) {
      return Response.json(
        { error: "Topic, tag, and difficulty are required" }, 
        { status: 400 }
      );
    }

    const content = await getContentByTagAndDifficulty(topic, tag, difficulty);
    
    return Response.json({ content });

  } catch (error) {
    console.error("Content API error:", error);
    return Response.json(
      { error: "Failed to fetch content" }, 
      { status: 500 }
    );
  }
}