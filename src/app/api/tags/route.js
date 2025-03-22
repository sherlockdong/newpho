import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
    console.log("Looking for tags in directory:", dirPath);

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

    let allTags = new Set();

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

      // Handle both array and single object cases
      const items = Array.isArray(data) ? data : [data];
      items.forEach((item, index) => {
        if (item.tags && Array.isArray(item.tags)) {
          console.log(`Tags in ${file}[${index}]:`, item.tags);
          item.tags.forEach(tag => allTags.add(tag));
        } else {
          console.warn(`No valid tags found in ${file}[${index}]`);
        }
      });
    }

    const tags = Array.from(allTags);
    console.log("Available tags:", tags);

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
/* Option	Cost	Persistent?	Easy?	Notes
WCS Sandbox	Free	❌ (14 days)	✅	Perfect for quick testing
Railway/Render	Free	⚠️ Limited	⚠️	Need to squeeze storage usage
AWS EC2 Free	Free	✅ (12 mo)	⚠️	Full control, DIY setup
Oracle Cloud	Free	✅ (Forever)	⚠️	Best long-term free host
Ngrok + Local	Free	❌ (local)	✅	Great for demos & dev only
 */