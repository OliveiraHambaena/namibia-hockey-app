import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hzsquqkkdaelcjkaaxaz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6c3F1cWtrZGFlbGNqa2FheGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MDUxNDIsImV4cCI6MjA2MzE4MTE0Mn0._z6xRo0Czn50iB3dOm-PDVTScHXyU_Z_2fbd4ZGjaY0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
