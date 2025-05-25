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

-- Create policy for admin write access to news_article_tags
CREATE POLICY "Admins can manage news article tags" 
  ON news_article_tags FOR ALL 
  USING (auth.role() = 'admin');

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
