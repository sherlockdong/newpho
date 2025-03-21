import fs from 'fs/promises';
import path from 'path';
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const DeepSeekLLM = {
  async call(input) {
    const prompt = typeof input === "string" ? input : input?.value || String(input);
    if (!prompt) throw new Error("No valid prompt string provided to DeepSeekLLM");

    const deepseekUrl = "https://api.deepseek.com/v1";
    try {
      console.log("Calling DeepSeek with prompt:", prompt.substring(0, 50) + "...");
      console.log("Using DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY ? "Set" : "Not set");
      const response = await fetch(deepseekUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const quizText = data.choices?.[0]?.message?.content || "";
      if (!quizText) {
        console.error("DeepSeek returned no valid quiz content:", data);
        return "";
      }

      return quizText
        .split('\n')
        .map(line => {
          const match = line.trim().match(/^\d+\.\s*(.*)$/);
          return match ? `${match[0]}[${match[1]}]` : line;
        })
        .join('\n');
    } catch (error) {
      console.error("DeepSeek fetch error:", {
        message: error.message,
        cause: error.cause, // Includes network-level details
      });
      throw error; // Re-throw to be caught by POST handler
    }
  },
};
async function getContentByTag(tag, userId, quizLogs) {
  const dirPath = path.join(process.cwd(), 'src', 'data', 'physicstopics');
  const files = await fs.readdir(dirPath);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  let content = '';
  let weakTopics = [tag];

  if (quizLogs && quizLogs.length > 0) {
    const lastLog = quizLogs[0];
    weakTopics = lastLog.incorrectTopics.split(',').map(t => t.trim());
    console.log(`User weak topics from logs: ${weakTopics}`);
  } else {
    console.log("No previous logs provided for user:", userId);
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

  return content.trim() || null;
}

export async function POST(request) {
  try {
    const { tag, numQuestions, userId, quizLogs } = await request.json();
    console.log(`Received POST with tag: ${tag}, numQuestions: ${numQuestions}, userId: ${userId}, logsCount: ${quizLogs?.length || 0}`);
    if (!tag || !numQuestions) throw new Error("Tag and number of questions are required");

    const content = await getContentByTag(tag, userId, quizLogs);
    console.log(`Content for tag ${tag}: ${content ? content.substring(0, 50) + '...' : 'None'}`);
    if (!content) throw new Error(`No content found for tag: ${tag}`);

    const promptTemplate = PromptTemplate.fromTemplate(
      `Based on the following physics content: "{context}", generate a quiz with ${numQuestions} questions in this exact format:
      1. [Question]
      2. [Question]
      ...
      Example:
      1. [What is the definition of physics?]
      2. [How does gravity affect objects on Earth?]`
    );

    const chain = RunnableSequence.from([
      async () => ({ context: content }),
      promptTemplate,
      DeepSeekLLM,
    ]);

    const quiz = await chain.invoke({});
    console.log(`Generated quiz: ${quiz || 'Empty'}`);
    return Response.json({ quiz });
  } catch (err) {
    console.error("Error in POST handler:", err.stack);
    return Response.json({ error: `Failed to generate quiz: ${err.message}` }, { status: 500 });
  }
}