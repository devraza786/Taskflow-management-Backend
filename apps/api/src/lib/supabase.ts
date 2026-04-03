import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing for backend storage operations.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadToSupabase = async (
  file: Express.Multer.File,
  path: string
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return publicUrl;
};
