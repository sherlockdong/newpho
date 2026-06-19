// seed.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load your local environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Ensure we are still using the Service Role Key to bypass RLS!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Smart Helper Function: Forces any input into a clean PostgreSQL text array.
 * If a section doesn't have a difficulty listed, it defaults to applying to all tiers.
 */
function formatArray(inputData, defaultFallback = ["Regular", "AP", "Olympiad"]) {
  if (!inputData) return defaultFallback; // Missing? Default to all.
  if (Array.isArray(inputData)) return inputData; // Already an array? Perfect.
  if (typeof inputData === 'string') {
    // If it's a string like "AP, Olympiad", split it by commas and trim spaces
    return inputData.split(',').map(item => item.trim());
  }
  return defaultFallback;
}

async function seedData() {
  console.log("🚀 Starting database seed...");

  // 1. Read your local JSON file
  const rawData = fs.readFileSync('./src/physicstopics/kinematics.json', 'utf-8');
  const sections = JSON.parse(rawData);

  // 2. Insert or Fetch the Parent Topic
  // (Using an upsert or checking if it exists prevents duplicate topics if you run this twice)
  let parentTopicId;
  const { data: existingTopic } = await supabase
    .from('topics')
    .select('id')
    .eq('slug', 'kinematics')
    .single();

  if (existingTopic) {
    parentTopicId = existingTopic.id;
    console.log(`📌 Found existing Topic ID: ${parentTopicId}`);
  } else {
    const { data: newTopic, error: topicError } = await supabase
      .from('topics')
      .insert([{ slug: 'kinematics', title: '1D & 2D Kinematics' }])
      .select()
      .single();

    if (topicError) {
      console.error("❌ Error creating topic:", topicError);
      return;
    }
    parentTopicId = newTopic.id;
    console.log(`✅ Created Topic (ID: ${parentTopicId})`);
  }

  // 3. Map and Sanitize your JSON data
  const formattedSections = sections.map((sec, index) => ({
    topic_id: parentTopicId,
    title: sec.title || "Untitled Section",
    content: sec.content || sec.text || "", 
    tags: formatArray(sec.tags, []), // Default to empty array if no tags exist
    difficulty: formatArray(sec.difficulty, ["Regular", "AP", "Olympiad"]), // Sanitizes difficulty
    sort_order: index 
  }));

  // 4. Insert all sections into the database
  const { error: sectionsError } = await supabase
    .from('topic_sections')
    .insert(formattedSections);

  if (sectionsError) {
    console.error("❌ Error inserting sections:", sectionsError);
  } else {
    console.log(`✅ Successfully inserted ${formattedSections.length} sections into the database!`);
  }
}

seedData();