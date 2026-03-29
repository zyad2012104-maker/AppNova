// ========== إعدادات JSONBin ==========
const CONFIG = {
    JSONBIN: {
        BASE_URL: "https://api.jsonbin.io/v3/b/",
        BIN_ID: "69c13f81b7ec241ddc956318",
        MASTER_KEY: "YOUR_MASTER_KEY_HERE"
    }
};

// ========== البيانات ==========
let apps = [];
let jsonbinReady = false;

// ========== تحميل التطبيقات ==========
async function loadApps() {
    try {
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            headers: {
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            }
        });

        const data = await response.json();

        // مهم: JSONBin بيرجع record
        apps = data.record || [];

        console.log("📥 تم تحميل التطبيقات:", apps);

        jsonbinReady = true;

    } catch (error) {
        console.error("❌ خطأ في تحميل التطبيقات:", error);
    }
}

// ========== حفظ التطبيقات ==========
async function saveApps() {
    try {
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(apps)
        });

        const data = await response.json();

        console.log("✅ تم حفظ التطبيقات:", data);

    } catch (error) {
        console.error("❌ خطأ في الحفظ:", error);
    }
}

// ========== رسائل ==========
function showAlert(message, type = "success") {
    alert(message); // بدون تغيير تصميم
}

// ========== بدء التحميل ==========
loadApps();

// تحديث تلقائي (اختياري لكن مهم)
setInterval(loadApps, 5000);