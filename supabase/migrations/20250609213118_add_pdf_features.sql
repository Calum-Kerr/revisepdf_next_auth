/**
 * PDF PROCESSING FEATURES
 * This migration adds tables and functions for PDF processing, file storage tracking,
 * and subscription-based limits for RevisePDF.
 */

-- User storage tracking table
CREATE TABLE user_storage (
  id uuid references auth.users not null primary key,
  total_storage_used bigint default 0,
  max_file_size_limit bigint default 10485760, -- 10MB default (Basic tier)
  total_storage_limit bigint default 104857600, -- 100MB default (Basic tier)
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_storage
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_storage
CREATE POLICY "Users can view own storage data" ON user_storage
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own storage data" ON user_storage
  FOR UPDATE USING (auth.uid() = id);

-- PDF processing history table
CREATE TABLE pdf_processing_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  file_name text not null,
  file_size bigint not null,
  processing_type text not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for pdf_processing_history
ALTER TABLE pdf_processing_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for pdf_processing_history
CREATE POLICY "Users can view own processing history" ON pdf_processing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processing history" ON pdf_processing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user_storage record when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_storage() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_storage (id)
  VALUES (new.id);
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create user_storage record for new users
CREATE TRIGGER on_auth_user_created_storage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_storage();

-- Function to update storage limits based on subscription
CREATE OR REPLACE FUNCTION public.update_storage_limits_for_subscription(
  user_uuid uuid,
  product_name text
) RETURNS void AS $$
BEGIN
  -- Update storage limits based on subscription tier
  IF product_name = 'Basic' THEN
    UPDATE user_storage 
    SET 
      max_file_size_limit = 10485760,  -- 10MB
      total_storage_limit = 104857600  -- 100MB
    WHERE id = user_uuid;
  ELSIF product_name = 'Pro' THEN
    UPDATE user_storage 
    SET 
      max_file_size_limit = 52428800,   -- 50MB
      total_storage_limit = 1073741824 -- 1GB
    WHERE id = user_uuid;
  ELSIF product_name = 'Enterprise' THEN
    UPDATE user_storage 
    SET 
      max_file_size_limit = 104857600,   -- 100MB
      total_storage_limit = 10737418240 -- 10GB
    WHERE id = user_uuid;
  END IF;
  
  UPDATE user_storage 
  SET updated_at = timezone('utc'::text, now())
  WHERE id = user_uuid;
END;
$$ language plpgsql security definer;

-- Function to check if user can upload file
CREATE OR REPLACE FUNCTION public.can_user_upload_file(
  user_uuid uuid,
  file_size bigint
) RETURNS boolean AS $$
DECLARE
  storage_record user_storage%ROWTYPE;
BEGIN
  SELECT * INTO storage_record 
  FROM user_storage 
  WHERE id = user_uuid;
  
  -- Check if user exists in storage table
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check file size limit
  IF file_size > storage_record.max_file_size_limit THEN
    RETURN false;
  END IF;
  
  -- Check total storage limit
  IF (storage_record.total_storage_used + file_size) > storage_record.total_storage_limit THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ language plpgsql security definer;

-- Function to update storage usage
CREATE OR REPLACE FUNCTION public.update_storage_usage(
  user_uuid uuid,
  file_size bigint
) RETURNS void AS $$
BEGIN
  UPDATE user_storage 
  SET 
    total_storage_used = total_storage_used + file_size,
    updated_at = timezone('utc'::text, now())
  WHERE id = user_uuid;
END;
$$ language plpgsql security definer;

-- Add realtime subscriptions for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_storage;
ALTER PUBLICATION supabase_realtime ADD TABLE pdf_processing_history;
