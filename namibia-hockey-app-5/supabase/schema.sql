-- Create a table for public profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT,
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
-- This is important for security in Supabase
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to set updated_at when a profile is updated
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the metadata for debugging
  RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;
  
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'https://via.placeholder.com/150/1565C0/FFFFFF?text=' || SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), 1, 2),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user') -- Default to 'user' if role is not provided
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a view for profiles
CREATE VIEW public.profiles_view AS
SELECT
  profiles.id,
  profiles.full_name,
  profiles.email,
  profiles.avatar_url,
  profiles.role,
  profiles.team,
  profiles.created_at,
  profiles.updated_at
FROM
  profiles;

-- =============================================
-- NEWS SYSTEM TABLES
-- =============================================

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  snippet TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  author VARCHAR(100) NOT NULL,
  author_avatar VARCHAR(255),
  author_title VARCHAR(100),
  published_date TIMESTAMPTZ DEFAULT NOW(),
  read_time VARCHAR(20),
  category_id UUID REFERENCES news_categories(id),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create news_tags table
CREATE TABLE IF NOT EXISTS news_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create news_article_tags junction table
CREATE TABLE IF NOT EXISTS news_article_tags (
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES news_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create news_related_articles junction table
CREATE TABLE IF NOT EXISTS news_related_articles (
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  related_article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, related_article_id),
  CONSTRAINT different_articles CHECK (article_id != related_article_id)
);

-- Create RLS policies for news tables
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_related_articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to news_categories
CREATE POLICY "Public can view news categories" 
  ON news_categories FOR SELECT 
  USING (true);

-- Create policy for public read access to news_articles
CREATE POLICY "Public can view news articles" 
  ON news_articles FOR SELECT 
  USING (true);

-- Create policy for public read access to news_tags
CREATE POLICY "Public can view news tags" 
  ON news_tags FOR SELECT 
  USING (true);

-- Create policy for public read access to news_article_tags
CREATE POLICY "Public can view news article tags" 
  ON news_article_tags FOR SELECT 
  USING (true);

-- Create policy for public read access to news_related_articles
CREATE POLICY "Public can view news related articles" 
  ON news_related_articles FOR SELECT 
  USING (true);

-- Create policy for admin write access to news_categories
CREATE POLICY "Admins can manage news categories" 
  ON news_categories FOR ALL 
  USING (auth.role() = 'admin');

-- Create policy for admin write access to news_articles
CREATE POLICY "Admins can manage news articles" 
  ON news_articles FOR ALL 
  USING (auth.role() = 'admin');

-- Create policy for admin write access to news_tags
CREATE POLICY "Admins can manage news tags" 
  ON news_tags FOR ALL 
  USING (auth.role() = 'admin');

-- Create policy for authenticated users to insert tags
CREATE POLICY "Authenticated users can insert tags" 
  ON news_tags FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for admin write access to news_article_tags
CREATE POLICY "Admins can manage news article tags" 
  ON news_article_tags FOR ALL 
  USING (auth.role() = 'admin');

-- Create policy for authenticated users to insert news article tags
CREATE POLICY "Authenticated users can insert article tags" 
  ON news_article_tags FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for admin write access to news_related_articles
CREATE POLICY "Admins can manage news related articles" 
  ON news_related_articles FOR ALL 
  USING (auth.role() = 'admin');

-- Create a view for news articles with category name
CREATE OR REPLACE VIEW news_articles_view AS
SELECT 
  na.id,
  na.title,
  na.snippet,
  na.content,
  na.image_url,
  na.author,
  na.author_avatar,
  na.author_title,
  na.published_date,
  na.read_time,
  na.is_featured,
  na.created_at,
  na.updated_at,
  nc.id AS category_id,
  nc.name AS category_name,
  nc.icon AS category_icon
FROM news_articles na
LEFT JOIN news_categories nc ON na.category_id = nc.id;

-- Create a function to get article tags
CREATE OR REPLACE FUNCTION get_article_tags(article_id UUID)
RETURNS TABLE (tag_id UUID, tag_name VARCHAR) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name
  FROM news_tags t
  JOIN news_article_tags at ON t.id = at.tag_id
  WHERE at.article_id = $1;
END;
$$;

-- Create a function to get related articles
CREATE OR REPLACE FUNCTION get_related_articles(article_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  image_url VARCHAR,
  published_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.image_url,
    a.published_date
  FROM news_articles a
  JOIN news_related_articles ra ON a.id = ra.related_article_id
  WHERE ra.article_id = $1;
END;
$$;

-- Create trigger to update updated_at timestamp for news tables
CREATE TRIGGER update_news_articles_timestamp
BEFORE UPDATE ON news_articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_categories_timestamp
BEFORE UPDATE ON news_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) VALUES ('news_images', 'news_images', true);

-- Set up storage policy for news images
CREATE POLICY "Public can view news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news_images');

CREATE POLICY "Authenticated users can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news_images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage news images"
ON storage.objects FOR ALL
USING (bucket_id = 'news_images' AND auth.role() = 'admin');

-- Insert default categories
INSERT INTO news_categories (name, icon) VALUES
('All', 'newspaper'),
('Latest', 'clock-outline'),
('Teams', 'account-group'),
('Players', 'hockey-sticks'),
('Events', 'calendar');


-- =============================================
-- TEAMS SYSTEM TABLES
-- =============================================

-- Teams table to store basic team information
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  city VARCHAR(100),
  division VARCHAR(50),
  conference VARCHAR(50),
  category VARCHAR(50) DEFAULT 'Professional',
  standing VARCHAR(20),
  record VARCHAR(20),
  points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Team stats table (one-to-one relationship with teams)
CREATE TABLE public.team_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  power_play_percentage VARCHAR(10),
  penalty_kill_percentage VARCHAR(10),
  shots_per_game DECIMAL(5,1),
  faceoff_percentage VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id)
);

-- Coaches table
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  image_url TEXT,
  experience VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Players table (roster)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  jersey_number VARCHAR(10),
  name VARCHAR(100) NOT NULL,
  position VARCHAR(10),
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Games table (for schedule and results)
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE,
  venue VARCHAR(100),
  home_score INTEGER,
  away_score INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a view for team details that combines all the information
CREATE VIEW public.team_details_view AS
SELECT
  t.id,
  t.name,
  t.logo_url,
  t.cover_image_url,
  t.city,
  t.division,
  t.conference,
  t.standing,
  t.record,
  t.points,
  
  -- Stats as JSON
  jsonb_build_object(
    'goalsFor', ts.goals_for,
    'goalsAgainst', ts.goals_against,
    'powerPlayPercentage', ts.power_play_percentage,
    'penaltyKillPercentage', ts.penalty_kill_percentage,
    'shotsPerGame', ts.shots_per_game,
    'faceoffPercentage', ts.faceoff_percentage
  ) as stats,
  
  -- Coach as JSON
  jsonb_build_object(
    'name', c.name,
    'image', c.image_url,
    'experience', c.experience
  ) as coach,
  
  -- Roster as JSON array
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'number', p.jersey_number,
        'name', p.name,
        'position', p.position,
        'goals', p.goals,
        'assists', p.assists,
        'points', p.points
      )
    )
    FROM public.players p
    WHERE p.team_id = t.id
  ) as roster,
  
  -- Next game as JSON (first upcoming game)
  (
    SELECT jsonb_build_object(
      'opponent', CASE WHEN ng.home_team_id = t.id THEN ng.away_team_name ELSE ng.home_team_name END,
      'opponentLogo', CASE WHEN ng.home_team_id = t.id THEN ng.away_team_logo ELSE ng.home_team_logo END,
      'date', to_char(ng.game_date, 'Mon DD, YYYY'),
      'time', to_char(ng.game_date, 'HH:MI AM'),
      'location', CASE WHEN ng.home_team_id = t.id THEN 'Home' ELSE 'Away' END,
      'venue', ng.venue
    )
    FROM (
      SELECT 
        g.id,
        g.home_team_id,
        g.away_team_id,
        g.date as game_date,
        g.venue,
        home_team.name as home_team_name,
        away_team.name as away_team_name,
        home_team.logo_url as home_team_logo,
        away_team.logo_url as away_team_logo,
        ROW_NUMBER() OVER (ORDER BY g.date ASC) as rn
      FROM public.games g
      JOIN public.teams home_team ON g.home_team_id = home_team.id
      JOIN public.teams away_team ON g.away_team_id = away_team.id
      WHERE (g.home_team_id = t.id OR g.away_team_id = t.id)
      AND g.date > now()
      AND g.status = 'scheduled'
      ORDER BY g.date ASC
      LIMIT 1
    ) ng
    WHERE ng.rn = 1
  ) as next_game,
  
  -- Last game as JSON (most recent completed game)
  (
    SELECT jsonb_build_object(
      'opponent', CASE WHEN lg.home_team_id = t.id THEN lg.away_team_name ELSE lg.home_team_name END,
      'opponentLogo', CASE WHEN lg.home_team_id = t.id THEN lg.away_team_logo ELSE lg.home_team_logo END,
      'result', CASE 
        WHEN lg.home_team_id = t.id AND lg.home_score > lg.away_score THEN 'W ' || lg.home_score || '-' || lg.away_score
        WHEN lg.away_team_id = t.id AND lg.away_score > lg.home_score THEN 'W ' || lg.away_score || '-' || lg.home_score
        WHEN lg.home_team_id = t.id THEN 'L ' || lg.home_score || '-' || lg.away_score
        ELSE 'L ' || lg.away_score || '-' || lg.home_score
      END,
      'date', to_char(lg.game_date, 'Mon DD, YYYY')
    )
    FROM (
      SELECT 
        g.id,
        g.home_team_id,
        g.away_team_id,
        g.date as game_date,
        g.home_score,
        g.away_score,
        home_team.name as home_team_name,
        away_team.name as away_team_name,
        home_team.logo_url as home_team_logo,
        away_team.logo_url as away_team_logo,
        ROW_NUMBER() OVER (ORDER BY g.date DESC) as rn
      FROM public.games g
      JOIN public.teams home_team ON g.home_team_id = home_team.id
      JOIN public.teams away_team ON g.away_team_id = away_team.id
      WHERE (g.home_team_id = t.id OR g.away_team_id = t.id)
      AND g.date < now()
      AND g.status = 'completed'
      ORDER BY g.date DESC
      LIMIT 1
    ) lg
    WHERE lg.rn = 1
  ) as last_game,
  
  -- Schedule as JSON array (upcoming games)
  (
    WITH upcoming_games AS (
      SELECT 
        g.id,
        g.home_team_id,
        g.away_team_id,
        g.date as game_date,
        home_team.name as home_team_name,
        away_team.name as away_team_name,
        home_team.logo_url as home_team_logo,
        away_team.logo_url as away_team_logo
      FROM public.games g
      JOIN public.teams home_team ON g.home_team_id = home_team.id
      JOIN public.teams away_team ON g.away_team_id = away_team.id
      WHERE (g.home_team_id = t.id OR g.away_team_id = t.id)
      AND g.date > now()
      AND g.status = 'scheduled'
      ORDER BY g.date ASC
      LIMIT 5
    )
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', ug.id,
        'opponent', CASE WHEN ug.home_team_id = t.id THEN ug.away_team_name ELSE ug.home_team_name END,
        'opponentLogo', CASE WHEN ug.home_team_id = t.id THEN ug.away_team_logo ELSE ug.home_team_logo END,
        'date', to_char(ug.game_date, 'Mon DD, YYYY'),
        'time', to_char(ug.game_date, 'HH:MI AM'),
        'location', CASE WHEN ug.home_team_id = t.id THEN 'Home' ELSE 'Away' END
      )
    )
    FROM upcoming_games ug
  ) as schedule
  
FROM public.teams t
LEFT JOIN public.team_stats ts ON t.id = ts.team_id
LEFT JOIN public.coaches c ON t.id = c.team_id;

-- Add RLS (Row Level Security) policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Allow public read access to teams" 
ON public.teams FOR SELECT USING (true);

CREATE POLICY "Allow public read access to team_stats" 
ON public.team_stats FOR SELECT USING (true);

CREATE POLICY "Allow public read access to coaches" 
ON public.coaches FOR SELECT USING (true);

CREATE POLICY "Allow public read access to players" 
ON public.players FOR SELECT USING (true);

CREATE POLICY "Allow public read access to games" 
ON public.games FOR SELECT USING (true);

-- Create policies for authenticated users to manage data
CREATE POLICY "Allow authenticated users to manage teams" 
ON public.teams FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage team_stats" 
ON public.team_stats FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage coaches" 
ON public.coaches FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage players" 
ON public.players FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage games" 
ON public.games FOR ALL USING (auth.role() = 'authenticated');

-- Create a bucket for team images
INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', true);

-- Create policies for the team_images bucket
-- Allow public read access to team images
CREATE POLICY "Public can view team images"
ON storage.objects FOR SELECT
USING (bucket_id = 'team_images');

-- Allow authenticated users to upload team images
CREATE POLICY "Authenticated users can upload team images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team_images' AND auth.role() = 'authenticated');

-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  full_address TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'Draft',
  status_color VARCHAR(20) DEFAULT '#666666',
  image_url TEXT,
  teams_count INTEGER DEFAULT 0,
  max_teams INTEGER,
  prize_pool VARCHAR(50),
  entry_fee VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Tournament categories junction table
CREATE TABLE public.tournament_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  category_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, category_name)
);

-- Tournament schedule table
CREATE TABLE public.tournament_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_name VARCHAR(50),
  schedule_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, day_number)
);

-- Tournament schedule events table
CREATE TABLE public.tournament_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES public.tournament_schedule(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_time VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tournament rules table
CREATE TABLE public.tournament_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  rule_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, rule_order)
);

-- Tournament teams junction table
CREATE TABLE public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(50) DEFAULT 'Registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, team_id)
);

-- Create RLS policies for tournaments
CREATE POLICY "Allow public read access to tournaments"
ON public.tournaments FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to create tournaments"
ON public.tournaments FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow organizers to update their tournaments"
ON public.tournaments FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "Allow organizers to delete their tournaments"
ON public.tournaments FOR DELETE
USING (auth.uid() = user_id OR auth.role() = 'admin');

-- Create RLS policies for tournament categories
CREATE POLICY "Allow public read access to tournament categories"
ON public.tournament_categories FOR SELECT
USING (true);

CREATE POLICY "Allow tournament organizers to manage categories"
ON public.tournament_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND (t.user_id = auth.uid() OR auth.role() = 'admin')
  )
);

-- Create RLS policies for tournament schedule
CREATE POLICY "Allow public read access to tournament schedule"
ON public.tournament_schedule FOR SELECT
USING (true);

CREATE POLICY "Allow tournament organizers to manage schedule"
ON public.tournament_schedule FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND (t.user_id = auth.uid() OR auth.role() = 'admin')
  )
);

-- Create RLS policies for tournament events
CREATE POLICY "Allow public read access to tournament events"
ON public.tournament_events FOR SELECT
USING (true);

CREATE POLICY "Allow tournament organizers to manage events"
ON public.tournament_events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournament_schedule s
    JOIN public.tournaments t ON s.tournament_id = t.id
    WHERE s.id = schedule_id AND (t.user_id = auth.uid() OR auth.role() = 'admin')
  )
);

-- Create RLS policies for tournament rules
CREATE POLICY "Allow public read access to tournament rules"
ON public.tournament_rules FOR SELECT
USING (true);

CREATE POLICY "Allow tournament organizers to manage rules"
ON public.tournament_rules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND (t.user_id = auth.uid() OR auth.role() = 'admin')
  )
);

-- Create RLS policies for tournament teams
CREATE POLICY "Allow public read access to tournament teams"
ON public.tournament_teams FOR SELECT
USING (true);

CREATE POLICY "Allow team owners to register for tournaments"
ON public.tournament_teams FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow team owners to manage tournament registrations"
ON public.tournament_teams FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow tournament organizers to manage team registrations"
ON public.tournament_teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND (t.user_id = auth.uid() OR auth.role() = 'admin')
  )
);

-- Create a view for tournament details
CREATE OR REPLACE VIEW public.tournament_details_view AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.location,
  t.full_address,
  t.start_date,
  t.end_date,
  t.registration_deadline,
  t.status,
  t.status_color,
  t.image_url,
  t.teams_count,
  t.max_teams,
  t.prize_pool,
  t.entry_fee,
  t.created_at,
  t.updated_at,
  t.organizer_id,
  p.full_name AS organizer_name,
  p.avatar_url AS organizer_logo,
  p.email AS organizer_contact,
  array_agg(DISTINCT tc.category_name) AS categories,
  (
    SELECT json_agg(json_build_object(
      'day_number', s.day_number,
      'day_name', s.day_name,
      'date', s.schedule_date,
      'events', (
        SELECT json_agg(json_build_object(
          'name', e.event_name,
          'time', e.event_time
        ))
        FROM public.tournament_events e
        WHERE e.schedule_id = s.id
      )
    ))
    FROM public.tournament_schedule s
    WHERE s.tournament_id = t.id
  ) AS schedule,
  (
    SELECT json_agg(r.rule_text ORDER BY r.rule_order)
    FROM public.tournament_rules r
    WHERE r.tournament_id = t.id
  ) AS rules,
  (
    SELECT json_agg(json_build_object(
      'id', tm.id,
      'team_id', tm.team_id,
      'name', tm2.name,
      'logo', tm2.logo_url,
      'players', (
        SELECT COUNT(*)
        FROM public.players p
        WHERE p.team_id = tm.team_id
      )
    ))
    FROM public.tournament_teams tm
    JOIN public.teams tm2 ON tm.team_id = tm2.id
    WHERE tm.tournament_id = t.id
  ) AS registered_teams
FROM public.tournaments t
LEFT JOIN public.profiles p ON t.organizer_id = p.id
LEFT JOIN public.tournament_categories tc ON t.id = tc.tournament_id
GROUP BY t.id, p.id;

-- Create a trigger to update teams_count when teams register or unregister
CREATE OR REPLACE FUNCTION public.update_tournament_teams_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tournaments
    SET teams_count = teams_count + 1
    WHERE id = NEW.tournament_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tournaments
    SET teams_count = teams_count - 1
    WHERE id = OLD.tournament_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tournament_teams_count_trigger
AFTER INSERT OR DELETE ON public.tournament_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_tournament_teams_count();

-- Create a storage bucket for tournament images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament_images', 'tournament_images', true);

-- Allow public access to tournament images
CREATE POLICY "Give public access to tournament_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament_images');

-- Allow authenticated users to upload tournament images
CREATE POLICY "Allow authenticated users to upload tournament images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tournament_images');

-- Allow authenticated users to update their own tournament images
CREATE POLICY "Allow authenticated users to update their own tournament images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tournament_images' AND owner = auth.uid());

-- Allow authenticated users to delete their own tournament images
CREATE POLICY "Allow authenticated users to delete their own tournament images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tournament_images' AND owner = auth.uid());

-- Allow authenticated users to upload team images
CREATE POLICY "Authenticated users can upload team images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team_images');

-- Allow authenticated users to update their own team images
CREATE POLICY "Authenticated users can update their own team images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team_images' AND owner = auth.uid());

-- Allow authenticated users to delete their own team images
CREATE POLICY "Authenticated users can delete their own team images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team_images' AND owner = auth.uid());