-- =============================================
-- Supabase Migration: MySQL → PostgreSQL
-- Project: Uma Rhythm Derby
-- =============================================

-- =============================================
-- 1. Custom ENUM types
-- =============================================
CREATE TYPE uma_style AS ENUM ('Front', 'Mid', 'Back');
CREATE TYPE session_type AS ENUM ('SPEED', 'STAMINA', 'TECHNIQUE', 'MIXED');
CREATE TYPE distance_type AS ENUM ('SHORT', 'MID', 'LONG');
CREATE TYPE reward_type AS ENUM ('UMA', 'ITEM');
CREATE TYPE gacha_rarity AS ENUM ('N', 'R', 'SR', 'SSR');
CREATE TYPE item_type AS ENUM ('CONSUMABLE', 'TICKET', 'MATERIAL');

-- =============================================
-- 2. Users profile table (synced with auth.users)
-- =============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  currency_balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create public.users row when auth.users signs up
-- The raw_user_meta_data must contain "username" (set during signUp)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, currency_balance, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    0,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 3. Traits (reference data)
-- =============================================
CREATE TABLE public.traits (
  code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO public.traits (code, name, description) VALUES
  ('speed_boost', 'Speed Boost', 'Focuses on explosive speed training'),
  ('stamina_regen', 'Stamina Regen', 'Enhances stamina recovery and endurance'),
  ('technique_master', 'Technique Master', 'Improves technical skills and precision'),
  ('all_rounder', 'All Rounder', 'Balanced development across all stats');

-- =============================================
-- 4. Uma Characters
-- =============================================
CREATE TABLE public.uma_characters (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  style uma_style NOT NULL,
  temperament VARCHAR(50),
  trait_code VARCHAR(32) REFERENCES public.traits(code),
  level INT NOT NULL DEFAULT 1,
  exp INT NOT NULL DEFAULT 0,
  speed INT NOT NULL DEFAULT 50,
  stamina INT NOT NULL DEFAULT 50,
  technique INT NOT NULL DEFAULT 50,
  max_energy INT NOT NULL DEFAULT 100,
  energy INT NOT NULL DEFAULT 100,
  last_energy_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_retired BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uma_characters_user_id ON public.uma_characters(user_id);

-- =============================================
-- 5. Training Sessions
-- =============================================
CREATE TABLE public.training_sessions (
  id SERIAL PRIMARY KEY,
  uma_id INT NOT NULL REFERENCES public.uma_characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  quality_pct DECIMAL(5,2) NOT NULL,
  speed_delta INT NOT NULL DEFAULT 0,
  stamina_delta INT NOT NULL DEFAULT 0,
  technique_delta INT NOT NULL DEFAULT 0,
  energy_before INT NOT NULL,
  energy_after INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_sessions_user_id ON public.training_sessions(user_id);
CREATE INDEX idx_training_sessions_uma_id ON public.training_sessions(uma_id);

-- =============================================
-- 6. Items (reference data)
-- =============================================
CREATE TABLE public.items (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  type item_type NOT NULL
);

INSERT INTO public.items (code, name, description, type) VALUES
  ('energy_drink', 'Energy Drink', 'Restores 50 energy points', 'CONSUMABLE'),
  ('mega_energy_drink', 'Mega Energy Drink', 'Fully restores energy', 'CONSUMABLE'),
  ('training_charm', 'Training Charm', '+10% training quality for next session', 'CONSUMABLE'),
  ('golden_charm', 'Golden Training Charm', '+25% training quality for next session', 'CONSUMABLE'),
  ('race_ticket', 'Race Ticket', 'Entry ticket for special races', 'TICKET');

-- =============================================
-- 7. User Items (inventory)
-- =============================================
CREATE TABLE public.user_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id INT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_user_items_user_id ON public.user_items(user_id);

-- =============================================
-- 8. Gacha Pool (reference data)
-- =============================================
CREATE TABLE public.gacha_pool (
  id SERIAL PRIMARY KEY,
  reward_type reward_type NOT NULL,
  reward_ref_id INT NOT NULL,
  rarity gacha_rarity NOT NULL,
  weight INT NOT NULL
);

INSERT INTO public.gacha_pool (reward_type, reward_ref_id, rarity, weight) VALUES
  ('UMA', 1, 'N', 40),
  ('UMA', 2, 'N', 40),
  ('UMA', 3, 'R', 15),
  ('UMA', 4, 'R', 15),
  ('UMA', 5, 'SR', 5),
  ('UMA', 6, 'SR', 5),
  ('UMA', 7, 'SSR', 2),
  ('ITEM', 1, 'N', 30),
  ('ITEM', 2, 'R', 10),
  ('ITEM', 3, 'SR', 3);

-- =============================================
-- 9. Gacha History
-- =============================================
CREATE TABLE public.gacha_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pool_id INT NOT NULL REFERENCES public.gacha_pool(id),
  reward_type reward_type NOT NULL,
  reward_ref_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gacha_history_user_id ON public.gacha_history(user_id);

-- =============================================
-- 10. Races
-- =============================================
CREATE TABLE public.races (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  uma_id INT NOT NULL REFERENCES public.uma_characters(id) ON DELETE CASCADE,
  distance_type distance_type NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  start_quality DECIMAL(5,2),
  mid_quality DECIMAL(5,2),
  final_quality DECIMAL(5,2),
  overall_quality DECIMAL(5,2),
  race_score INT,
  placement INT
);

CREATE INDEX idx_races_user_id ON public.races(user_id);
CREATE INDEX idx_races_uma_id ON public.races(uma_id);

-- =============================================
-- 11. Race Participants
-- =============================================
CREATE TABLE public.race_participants (
  id SERIAL PRIMARY KEY,
  race_id INT NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  is_player BOOLEAN NOT NULL DEFAULT FALSE,
  name VARCHAR(100) NOT NULL,
  speed INT NOT NULL,
  stamina INT NOT NULL,
  technique INT NOT NULL,
  lane_path TEXT,
  final_pos INT
);

CREATE INDEX idx_race_participants_race_id ON public.race_participants(race_id);

-- =============================================
-- 12. Row Level Security (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uma_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gacha_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Uma Characters: full CRUD on own characters
CREATE POLICY "Users can view own umas"
  ON public.uma_characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own umas"
  ON public.uma_characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own umas"
  ON public.uma_characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own umas"
  ON public.uma_characters FOR DELETE
  USING (auth.uid() = user_id);

-- Training Sessions: read/insert own
CREATE POLICY "Users can view own training"
  ON public.training_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training"
  ON public.training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Items: read/insert/update own
CREATE POLICY "Users can view own items"
  ON public.user_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON public.user_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON public.user_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Gacha History: read/insert own
CREATE POLICY "Users can view own gacha history"
  ON public.gacha_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gacha history"
  ON public.gacha_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Races: read/insert own
CREATE POLICY "Users can view own races"
  ON public.races FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own races"
  ON public.races FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Race Participants: read own (via race join) and insert
CREATE POLICY "Users can view race participants"
  ON public.race_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_participants.race_id
        AND races.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert race participants"
  ON public.race_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_participants.race_id
        AND races.user_id = auth.uid()
    )
  );

-- Reference tables: readable by all authenticated users
ALTER TABLE public.traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gacha_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read traits"
  ON public.traits FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read items"
  ON public.items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read gacha pool"
  ON public.gacha_pool FOR SELECT
  USING (auth.role() = 'authenticated');
