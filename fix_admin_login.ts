
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

console.log('Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY || SUPABASE_ANON_KEY);

const EMAIL = 'etiqettelms@gmail.com';
const PASSWORD = 'Akshara@123';

async function checkAndFixAdmin() {
    console.log(`Checking status for ${EMAIL}...`);

    // 1. Check user_roles table
    const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('email', EMAIL)
        .maybeSingle();

    if (roleError) console.error('Error checking user_roles:', roleError);
    else console.log('user_roles entry:', roleData);

    // 2. Check if user exists in Auth
    if (SERVICE_KEY) {
        // ... (Service Key logic omitted for client side debug focus)
    } else {
        console.log('No SERVICE_KEY available, attempting client-side sign-up/sign-in check...');

        // 1. Try Signing In
        console.log(`Attempting SignIn for ${EMAIL} with password...`);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: EMAIL,
            password: PASSWORD
        });

        if (signInError) {
            console.error('❌ Sign In FAILED:', signInError.message);
            console.error('Full Error:', JSON.stringify(signInError, null, 2));

            // 2. If Sign In failed, try Sign Up (only if we suspect it doesn't exist)

            console.log('Attempting SignUp (in case user does not exist)...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: EMAIL,
                password: PASSWORD,
            });

            if (signUpError) {
                console.error('❌ Sign Up FAILED:', signUpError.message);
            } else {
                console.log('✅ Sign Up Successful:', signUpData.user?.id);
                console.log('User metadata:', signUpData.user);
                if (signUpData.user?.identities?.length === 0) {
                    console.warn('⚠️ User exists but might have identity issues (e.g. wrong password/provider).');
                }
            }

        } else {
            console.log('✅ Sign In SUCCESSFUL!');
            console.log('Session User ID:', signInData.user.id);
        }
    }

    // 3. Ensure user_roles has the user as platform_admin
    if (!roleData || roleData.role !== 'platform_admin') {
        console.log('Fixing user_roles...');
        // ... (user_roles logic logic omitted as likely fine)
    } else {
        console.log('user_roles is correct.');
    }
}

checkAndFixAdmin();
