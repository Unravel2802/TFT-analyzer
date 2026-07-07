-- Journal tags: structured labels alongside the free-text note so placement
-- can be aggregated per recurring mistake ("misplayed econ" avg vs overall).
-- Run in the Supabase SQL editor before deploying the tags feature.
ALTER TABLE match_notes ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
