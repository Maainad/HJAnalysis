/**
 * Polling job to continuously analyze new demand posts
 *
 * This script:
 * 1. Runs every 20 minutes
 * 2. Checks for new posts with "مطلوب" in the title
 * 3. Analyzes posts that aren't yet in analyzed_demand table
 * 4. Stores results in the database
 *
 * Start with: npm run poll
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection using connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Poll interval in milliseconds (20 minutes = 1200000ms)
const POLL_INTERVAL = 20 * 60 * 1000;

// System prompt for the LLM
const SYSTEM_PROMPT = `You are a categorization engine for a marketplace demand analysis tool. Your job is to categorize Arabic and English marketplace listings into clean, reusable, broad-but-accurate categories.

You will receive:
- A listing title and body
- The current list of existing categories

Your job is to assign the listing to the most accurate existing category, or create a new one if none fit well enough.

Rules for categorizing:
- Use both title and body to understand what's being requested
- category must always be the broadest applicable bucket — e.g. electronics, real_estate, vehicles
- sub_category is optional but encouraged when it adds meaningful signal — e.g. gaming_consoles, apartment_rental, used_cars
- Never make category as specific as sub_category — if you find yourself being specific at the category level, move it down to sub_category and broaden the category
- Categories should be reusable across many listings, not tailored to one
- Use snake_case for category and sub_category names, in English, always
- If a listing fits an existing category well enough, always prefer that over creating a new one
- Only create a new category if the listing genuinely doesn't fit anything in the existing list
- Never use overly specific category names — for example, use electronics instead of gaming_consoles, use real_estate instead of hospitality_property_rental
- If a category could be a subcategory of a broader one, always use the broader one
- license_plates is its own category, never group it under vehicles

Rules for creating new categories:
- Keep it broad enough to hold many similar listings
- Keep it specific enough to be meaningfully different from existing ones
- One or two words maximum, snake_case
- In English regardless of listing language

Output — respond only in this JSON format, nothing else:
{
  "category": "broad category, always the widest applicable bucket",
  "sub_category": "more specific type within that category, or null if not needed",
  "is_new_category": true or false,
  "confidence": 0-100,
  "reasoning": "one sentence max"
}`;

/**
 * Get all existing categories from the database
 */
async function getExistingCategories(client) {
  const result = await client.query(`
    SELECT DISTINCT category
    FROM analyzed_demand
    ORDER BY category
  `);

  if (result.rows.length === 0) {
    return 'none yet';
  }

  return result.rows.map(row => row.category).join(', ');
}

/**
 * Categorize a demand listing using Gemini LLM
 */
async function categorizeDemand(post, existingCategories) {
  try {
    // Construct user message
    const userMessage = `Existing categories: ${existingCategories}

Listing title: ${post.title}
Listing body: ${post.body || 'No body content'}

Categorize this listing.`;

    // Call Gemini with system prompt and user message
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will categorize marketplace listings according to these rules and output only JSON in the specified format.' }]
        }
      ]
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return {
      category: parsed.category,
      sub_category: parsed.sub_category || null,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      is_new_category: parsed.is_new_category
    };

  } catch (error) {
    console.error(`Error calling Gemini API:`, error.message);
    throw error;
  }
}

/**
 * Check for and analyze new demand posts
 */
async function pollNewPosts() {
  const client = await pool.connect();

  try {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] Checking for new demand posts...`);

    // Fetch new posts with "مطلوب" in title that haven't been analyzed
    const query = `
      SELECT p.id::text as post_id, p.title, p.body, p.author_username, p.post_date
      FROM posts p
      LEFT JOIN analyzed_demand ad ON p.id::text = ad.post_id
      WHERE p.title ILIKE '%مطلوب%'
        AND ad.post_id IS NULL
      ORDER BY p.post_date DESC
      LIMIT 100
    `;

    const result = await client.query(query);
    const posts = result.rows;

    if (posts.length === 0) {
      console.log('No new posts found.');
      return;
    }

    console.log(`Found ${posts.length} new posts to analyze\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`[${i + 1}/${posts.length}] Processing: ${post.post_id}`);

      try {
        // Get existing categories before each call
        const existingCategories = await getExistingCategories(client);

        // Call Gemini to categorize the demand
        const { category, sub_category, confidence, reasoning, is_new_category } = await categorizeDemand(post, existingCategories);

        // Insert result into analyzed_demand table
        await client.query(
          `INSERT INTO analyzed_demand
           (post_id, author_name, title, category, sub_category, confidence_score, reasoning, is_new_category, created_at, analyzed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9), NOW())
           ON CONFLICT (post_id) DO NOTHING`,
          [
            post.post_id,
            post.author_username,
            post.title,
            category,
            sub_category,
            confidence,
            reasoning,
            is_new_category,
            post.post_date
          ]
        );

        successCount++;
        const newTag = is_new_category ? ' [NEW]' : '';
        const subCatDisplay = sub_category ? ` > ${sub_category}` : '';
        console.log(`✓ ${category}${subCatDisplay}${newTag} (${confidence}%)`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errorCount++;
        console.error(`✗ Error: ${error.message}`);
      }
    }

    console.log(`\nBatch complete - Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error during polling:', error);
  } finally {
    client.release();
  }
}

/**
 * Start the polling loop
 */
async function startPolling() {
  console.log('='.repeat(60));
  console.log('Demand Analysis Polling Job Started');
  console.log(`Polling interval: ${POLL_INTERVAL / 1000 / 60} minutes`);
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(60));

  // Run immediately on start
  await pollNewPosts();

  // Then run every POLL_INTERVAL
  setInterval(async () => {
    try {
      await pollNewPosts();
    } catch (error) {
      console.error('Polling iteration failed:', error);
    }
  }, POLL_INTERVAL);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down polling job...');
  await pool.end();
  console.log('Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\nShutting down polling job...');
  await pool.end();
  process.exit(0);
});

// Run the polling job
if (require.main === module) {
  startPolling().catch((error) => {
    console.error('Failed to start polling:', error);
    process.exit(1);
  });
}

module.exports = { pollNewPosts, categorizeDemand };
