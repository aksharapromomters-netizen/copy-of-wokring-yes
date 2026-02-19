
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
// Use Service Key if available to bypass RLS for this test, or Anon (might fail due to RLS)
// The user likely has RLS enabled. AdminDashboard normally relies on the logged-in user's token.
// Here we are running a script. We should use SERVICE_ROLE_KEY if possible to test *Constraint* not *Policy*.
const SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error("No SUPABASE_SERVICE_ROLE_KEY found in .env.local. Constraint check might fail due to RLS.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY || envConfig.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Attempting to insert profile with random UUID...");

    // Random UUID
    const randomId = crypto.randomUUID();
    const testEmail = `test_${randomId}@example.com`;

    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: randomId,
            email: testEmail,
            name: 'Schema Test User',
            role: 'employee',
            department: 'Test Dept'
        })
        .select();

    if (error) {
        console.error("Insert Failed:", error);
        if (error.code === '23503') { // Foreign Key Violation code
            console.log("CONCLUSION: STRICT FOREIGN KEY DETECTED. Cannot pre-seed profiles.");
        } else {
            console.log("CONCLUSION: Insert failed but maybe not due to FK. Check error details.");
        }
    } else {
        console.log("Insert Successful:", data);
        console.log("CONCLUSION: NO STRICT FOREIGN KEY on profiles.id. Pre-seeding IS possible.");

        // Cleanup
        await supabase.from('profiles').delete().eq('id', randomId);
    }
}

checkSchema();
