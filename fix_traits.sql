-- Migration script to fix trait_code column size and insert trait definitions
-- Database: uma_rhythm_derby

-- Step 1: Alter the traits table to allow longer codes
ALTER TABLE traits
  MODIFY code VARCHAR(32) NOT NULL;

-- Step 2: Insert all trait definitions
INSERT INTO traits (code, name, description)
VALUES 
  ('speed_boost', 'Speed Boost', 'Focuses on explosive speed training'),
  ('stamina_regen', 'Stamina Regen', 'Enhances stamina recovery and endurance'),
  ('technique_master', 'Technique Master', 'Improves technical skills and precision'),
  ('all_rounder', 'All Rounder', 'Balanced development across all stats')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  description = VALUES(description);
