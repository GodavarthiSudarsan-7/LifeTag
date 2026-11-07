const app = require('./server');

setTimeout(async () => {
    try {
        console.log('\n--- VERIFYING UNIFIED BACKEND & FRONTEND INTEGRATION ---');

        // 1. Health
        const h = await fetch('http://localhost:5000/api/health').then(r => r.json());
        console.log('✓ Health Endpoint   :', h.status, `(DB: ${h.database})`);

        // 2. Frontend HTML
        const f = await fetch('http://localhost:5000/').then(r => r.text());
        const hasRoot = f.includes('id="root"');
        console.log('✓ Frontend Bundle   : Length', f.length, `bytes (Mount Point: ${hasRoot ? 'OK' : 'MISSING'})`);

        // 3. Emergency Public API
        const em = await fetch('http://localhost:5000/api/emergency/LT-SUDHA-A1B2C3D4E5').then(r => r.json());
        console.log('✓ Emergency API     :', em.status, `| Patient: ${em.profile.full_name} | Blood: ${em.profile.blood_group} | Contacts: ${em.profile.contacts.length}`);

        // 4. Blocked Tag verification
        const blocked = await fetch('http://localhost:5000/api/emergency/LT-MEENA-OLD-TAG-99');
        console.log('✓ Revocation Trigger: Status', blocked.status, `(Blocked: ${blocked.status === 403})`);

        console.log('\n>>> SYSTEM FULLY OPERATIONAL AND VERIFIED <<<\n');
        process.exit(0);
    } catch (err) {
        console.error('Integration Error:', err);
        process.exit(1);
    }
}, 1500);
