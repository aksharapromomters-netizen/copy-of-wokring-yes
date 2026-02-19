
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envConfig.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY; // Might not be in .env.local on client

console.log('Testing Supabase Connection...');
console.log('URL:', SUPABASE_URL);

async function test() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('1. Attempting Anon Read of Profiles...');
    const { data, error } = await supabase.from('profiles').select('*').limit(5);
    if (error) console.error('Anon Read Error:', error);
    else console.log('Anon Read Data:', data);

    // If we have a user token, we could test auth read, but let's assume anon read fails/succeeds gives a hint.
}

test();
