# Haraj Demand Analysis Dashboard

A Next.js dashboard for analyzing demand listings from the Haraj marketplace. This application identifies "wanted" posts, categorizes them using an LLM, and visualizes the results.

## Project Overview

This dashboard helps identify and analyze marketplace demand by:
- Extracting listings where users are looking to buy or hire (posts with "wanted" in the title)
- Categorizing these demand listings using an LLM
- Visualizing demand patterns by category
- Providing detailed search and filtering capabilities

## Project Structure

```
haraj_demand_analysis/
├── app/
│   ├── api/                    # API routes
│   │   ├── categories/         # Get category statistics
│   │   ├── listings/           # Get and filter listings
│   │   ├── search/             # Global search
│   │   └── post/[id]/          # Get full post details
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard page
├── components/
│   ├── BarChart.tsx            # Horizontal bar chart for categories
│   ├── SearchBar.tsx           # Global search component
│   ├── SidePanel.tsx           # Category detail drawer
│   └── ListingCard.tsx         # Individual listing card
├── lib/
│   └── db.ts                   # PostgreSQL connection utility
├── scripts/
│   ├── analyze-existing.js     # One-time analysis script
│   ├── poll-new.js             # Continuous polling job
│   └── create-table.sql        # Database schema
└── .env.local                  # Environment variables
```

## Database Schema

### Existing Table: `posts`
Contains all scraped marketplace listings with fields including:
- `id` - Unique post identifier (bigint)
- `title` - Listing title
- `author_username` - Post author username
- `body` - Post body/description
- `post_date` - Unix timestamp when post was created
- `update_date` - Unix timestamp when post was updated
- `city` - City location
- `price` - Price information
- `images_list` - JSON array of image URLs
- Other listing details (tags, comment_count, etc.)

### New Table: `analyzed_demand`
Created by this project to store categorized demand listings:
```sql
CREATE TABLE analyzed_demand (
  id SERIAL PRIMARY KEY,
  post_id VARCHAR(255) NOT NULL UNIQUE,
  author_name VARCHAR(255),
  title TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  sub_category VARCHAR(255),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  reasoning TEXT,
  is_new_category BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Edit `.env.local` with your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/haraj
```

Format: `postgresql://username:password@host:port/database_name`

### 3. Create the Database Table

**Run the setup script to create the table automatically:**

```bash
npm run setup
```

This will create the `analyzed_demand` table with all necessary indexes.

Alternative: You can also manually run the SQL script:
```bash
psql -U your_username -d haraj -f scripts/create-table.sql
```

### 4. Add Gemini API Key

**Add your Gemini API key to `.env.local`:**

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

The LLM integration is already implemented using Gemini 2.5 Flash. The scripts will:
- Pull existing categories before each categorization
- Use a specialized system prompt for marketplace demand analysis
- Return category, confidence score, reasoning, and whether it's a new category
- Automatically prefer existing categories when appropriate

## Running the Application

### 1. Analyze Existing Posts (One-Time)

Run this to analyze demand posts (posts with "مطلوب" in the title):

**For testing (limit to 50 posts):**
```bash
node scripts/analyze-existing.js --limit 50
```

**To process all remaining unanalyzed posts:**
```bash
npm run analyze
```

This will:
- Find all posts with "مطلوب" in the title
- Skip posts already in `analyzed_demand`
- Pull existing categories before each categorization
- Categorize each using Gemini LLM
- Store results including category, confidence, reasoning, and is_new_category flag
- You can run it multiple times - it will only process unanalyzed posts

### 2. Start Continuous Polling (Optional)

To continuously monitor for new posts every 20 minutes:

```bash
npm run poll
```

This runs in the background and automatically analyzes new demand posts (with "مطلوب" in title) as they appear.

### 3. Start the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Dashboard Features

### Header
- Application title
- Total count of analyzed demand listings

### Global Search
- Search by post ID or title keyword
- Shows matching results with category and confidence score
- Real-time search as you type

### Bar Chart
- Horizontal blue bars showing demand by category
- Sorted by volume (highest to lowest)
- Click any bar to open the category detail panel

### Category Detail Panel
- Slides in from the right when clicking a category
- Shows category name and total listings
- Search within category
- Sort by date or confidence score
- Expandable listing cards

### Listing Cards
- Compact view: title, author, date, confidence score
- Expanded view: full post details from the `posts` table including images

## Development Notes

### API Routes

- `GET /api/categories` - Returns all categories with counts and total
- `GET /api/listings?category=X&sortBy=date&search=X` - Get filtered listings
- `GET /api/search?q=X` - Global search by post_id or title
- `GET /api/post/[id]` - Get full post details

### Database Connection

The `lib/db.ts` file provides a PostgreSQL connection pool with helper functions:
- `query(text, params)` - Execute a query
- `getClient()` - Get a client for transactions

### Styling

- Tailwind CSS with neutral colors throughout
- Only bar chart bars use blue (Tailwind teal-500)
- Responsive design with mobile support

## Troubleshooting

### Database Connection Issues
- Verify credentials in `.env.local`
- Ensure PostgreSQL is running
- Check that the database exists

### No Data Showing
- Run `npm run setup` to create the table if you haven't already
- Run `npm run analyze` (or with `--limit 50` for testing) to populate the database
- Check that the `posts` table has entries with "مطلوب" in the title
- Verify the `analyzed_demand` table was created successfully

### LLM Integration Not Working
- Ensure `GEMINI_API_KEY` is correctly set in `.env.local`
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check for error messages in the console output
- Test with `--limit 5` to debug issues with a small sample

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run setup` | Create the analyzed_demand table in the database |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run analyze` | Run one-time analysis of all unanalyzed posts |
| `node scripts/analyze-existing.js --limit N` | Analyze only N posts (for testing) |
| `npm run poll` | Start continuous polling job (20min intervals) |

## Technology Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with pg client
- **LLM:** Google Gemini 2.5 Flash
- **Styling:** Tailwind CSS 4
- **Runtime:** Node.js

## License

This project is private and proprietary.
