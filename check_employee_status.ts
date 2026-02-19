
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envConfig: Record<string, string> = {};

envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        const val = values.join('=').trim();
        envConfig[key.trim()] = val.replace(/^["']|["']$/g, '');
    }
});

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envConfig.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY || SUPABASE_ANON_KEY);

const EMAIL = 'itschiragg2006@gmail.com';

async function checkEmployee() {
    console.log(`Checking status for ${EMAIL}...`);

    // 1. Check user_roles table
    const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('email', EMAIL)
        .maybeSingle();

    if (roleError) console.error('Error checking user_roles:', roleError);
    else console.log('user_roles entry:', roleData);

    // 2. Check profiles table (if it exists)
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', EMAIL)
        .maybeSingle();

    if (profileError) console.error('Error checking profiles:', profileError);
    else console.log('profiles entry:', profileData);
}

checkEmployee();
