const CONFIG = {
    GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/AKfycby-BeIa9P8-XoutWpBKRq3SnxG-EcWH9MoEDep1C3Gs9_6lJqA6ZFc5cO44mryIg4qOoQ/exec',
    MAKE_WEBHOOK_URL: 'https://hook.eu1.make.com/n46s2vx5oil7ptwdhhgsnn9rpm6ck5j0',
    BACKEND_LOCAL: 'http://localhost:5000/api/save-lead',
    BACKEND_LIVE: 'https://avani-loan-services.vercel.app/api/save-lead'
};

const dummyLead = {
    name: "Automode Verification Test",
    phone: "7249108474",
    email: "test@avanifinserv.com",
    loanType: "Personal Loan",
    amount: "500000",
    message: "Verifying all tools in auto mode cycle.",
    source: "AutoMode_Test_Cycle",
    timestamp: new Date().toISOString()
};

async function runTestCycle() {
    console.log('🚀 --- STARTING FULL SYSTEM VERIFICATION ---');

    const test = async (name, url) => {
        try {
            console.log(`Testing ${name}...`);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dummyLead)
            });
            console.log(`✅ ${name}: ${res.status} ${res.statusText}`);
            return res.status;
        } catch (e) {
            console.error(`❌ ${name} Failed: ${e.message}`);
            return 'ERROR';
        }
    };

    await test('Google Sheets', CONFIG.GOOGLE_SHEETS_URL);
    await test('Make.com Webhook', CONFIG.MAKE_WEBHOOK_URL);
    await test('Local Backend', CONFIG.BACKEND_LOCAL);
    await test('Live Backend (Vercel)', CONFIG.BACKEND_LIVE);

    console.log('🏁 --- VERIFICATION COMPLETE ---');
}

runTestCycle();
