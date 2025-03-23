import fs from 'fs/promises';
import path from 'path';

async function getContentByTag(tag, quizLogs) {
  const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
  const files = await fs.readdir(dirPath);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  let content = '';
  let weakTopics = [tag];

  if (quizLogs && quizLogs.length > 0) {
    const lastLog = quizLogs[0];
    weakTopics = lastLog.incorrectTopics.split(',').map(t => t.trim());
    console.log(`User weak topics from logs: ${weakTopics}`);
  }

  for (const file of jsonFiles) {
    const filePath = path.join(dirPath, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const items = Array.isArray(data) ? data : [data];
    items.forEach(item => {
      if (item.tags && item.tags.some(t => weakTopics.includes(t))) {
        content += item.content + '\n';
      }
    });
  }

  return content.trim() || "No content available for this topic.";
}

export async function POST(request) {
  try {
    const { tag, quizLogs } = await request.json();
    if (!tag) {
      return Response.json({ error: "Tag is required" }, { status: 400 });
    }
    const content = await getContentByTag(tag, quizLogs);
    return Response.json({ content });
  } catch (error) {
    console.error("Content route error:", error);
    return Response.json({ error: `Failed to fetch content: ${error.message}` }, { status: 500 });
  }
}