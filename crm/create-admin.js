import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error("קובץ .env לא נמצא בתיקיית crm!");
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
        }
        env[key] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const adminEmail = env.VITE_ADMIN_EMAIL || 'admin@atri.co.il';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("שגיאה: VITE_SUPABASE_URL או VITE_SUPABASE_ANON_KEY אינם מוגדרים בקובץ .env!");
    process.exit(1);
}

const password = process.argv[2];
if (!password) {
    console.error("שגיאה: נא לספק סיסמה כארגומנט!");
    console.log("לדוגמה: node create-admin.js mySecretPassword123");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    console.log(`מנסה ליצור משתמש מנהל (${adminEmail}) ב-Supabase...`);
    const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: password
    });

    if (error) {
        console.error("שגיאה ביצירת המשתמש:", error.message);
    } else {
        console.log("==================================================");
        console.log("🎉 משתמש המנהל נוצר בהצלחה!");
        console.log(`אימייל: ${adminEmail}`);
        console.log(`סיסמה: ${password}`);
        console.log("==================================================");
        console.log("שים לב: כברירת מחדל ב-Supabase, ייתכן שנדרש אישור אימייל (Confirm email).");
        console.log("אם אינך מצליח להתחבר מיד, היכנס ל-Supabase Dashboard תחת:");
        console.log("Authentication -> Users");
        console.log(`ולחץ על המשתמש ${adminEmail} ➔ Confirm User (או כבה את Confirm Email בהגדרות).`);
    }
}

createAdmin();
