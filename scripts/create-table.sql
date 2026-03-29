-- Create analyzed_demand table
-- Run this SQL script against your PostgreSQL database to create the table

CREATE TABLE IF NOT EXISTS analyzed_demand (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyzed_demand_post_id ON analyzed_demand(post_id);
CREATE INDEX IF NOT EXISTS idx_analyzed_demand_category ON analyzed_demand(category);
CREATE INDEX IF NOT EXISTS idx_analyzed_demand_created_at ON analyzed_demand(created_at DESC);

-- Display the table structure
\d analyzed_demand;
