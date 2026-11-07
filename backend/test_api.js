const http = require('http');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

// Simple fetch wrapper using native http
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(url, { method, headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('  LIFETAG BACKEND API COMPREHENSIVE TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(name, condition, extra = '') {
        if (condition) {
            console.log(`  [PASS] ${name} ${extra}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${name} ${extra}`);
            failed++;
        }
    }

    try {
        // 1. Health check
        const health = await request('GET', '/api/health');
        assert('Health Check Endpoint', health.status === 200 && health.body.status === 'UP');

        // 2. Login as seed user (Sudarsan)
        const login = await request('POST', '/api/auth/login', {
            email: 'sudarsan@lifetag.in',
            password: 'Password@123'
        });
        assert('User Login', login.status === 200 && login.body.token, `(User: ${login.body.user?.full_name})`);
        const token = login.body.token;

        // 3. Current user details (Me)
        const me = await request('GET', '/api/auth/me', null, token);
        assert('Current User Profile (Me)', me.status === 200 && me.body.user.email === 'sudarsan@lifetag.in');

        // 4. Medical Dossier & Catalog
        const med = await request('GET', '/api/medical', null, token);
        assert('Medical Dossier & Clinical Risk', med.status === 200 && med.body.medical.blood_group === 'A+', `(Risk: ${med.body.clinical_risk_tier})`);

        const cat = await request('GET', '/api/medical/catalogs', null, token);
        assert('Master Catalogs Available', cat.status === 200 && cat.body.catalogs.conditions.length > 0);

        // 5. Emergency Contacts
        const contacts = await request('GET', '/api/contacts', null, token);
        assert('Emergency Contacts Listed', contacts.status === 200 && contacts.body.contacts.length >= 2, `(Count: ${contacts.body.contacts.length})`);

        // 6. Privacy Settings
        const priv = await request('GET', '/api/privacy', null, token);
        assert('Privacy Settings Accessible', priv.status === 200 && priv.body.settings.show_blood_group === 1);

        // 7. Active QR Tag
        const qr = await request('GET', '/api/qr/active', null, token);
        assert('Active QR Tag & Image Generated', qr.status === 200 && qr.body.tag && qr.body.tag.qr_image.startsWith('data:image/png'));

        // 8. Public Emergency Scan (NO LOGIN)
        const emergencyToken = 'LT-SUDHA-A1B2C3D4E5';
        const emergency = await request('GET', `/api/emergency/${emergencyToken}`);
        assert('Public Emergency Profile (No Login)', emergency.status === 200 && emergency.body.profile.full_name === 'Sudarsan V', `(Blood: ${emergency.body.profile.blood_group})`);

        // 9. Blocked Scan on Revoked Tag
        const revokedToken = 'LT-MEENA-OLD-TAG-99';
        const blockedScan = await request('GET', `/api/emergency/${revokedToken}`);
        assert('Revoked Tag Blocked by Trigger/Status', blockedScan.status === 403 && blockedScan.body.status === 'REVOKED_TAG');

        // 10. Dashboard Analytics
        const analytics = await request('GET', '/api/analytics/dashboard', null, token);
        assert('Dashboard Analytics Feed', analytics.status === 200 && analytics.body.analytics.readiness_score > 0, `(Score: ${analytics.body.analytics.readiness_score}%)`);

        console.log('\n====================================================');
        console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log('====================================================');

        process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
        console.error('Test Execution Error:', err);
        process.exit(1);
    }
}

// Start server in background then run tests
const app = require('./server');
setTimeout(runTests, 1000);
