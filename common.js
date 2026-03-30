// ========== إعدادات JSONBin ==========
const CONFIG = {
    JSONBIN: {
        BASE_URL: "https://api.jsonbin.io/v3/b/",
        BIN_ID: "69c9835736566621a85cb01f",
        MASTER_KEY: "YOUR_REAL_MASTER_KEY"
    }
};
// ========== البيانات ==========
let apps = [];
let jsonbinReady = false;

// ========== تحميل التطبيقات ==========
async function loadApps() {
    try {
        console.log("🔄 جاري تحميل التطبيقات...");

        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}/latest`, {
            headers: {
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            }
        });

        const data = await response.json();

        console.log("📦 البيانات المستلمة:", data);

        // دعم كل الحالات
        if (Array.isArray(data.record)) {
            apps = data.record;
        } else if (data.record && Array.isArray(data.record.apps)) {
            apps = data.record.apps;
        } else {
            apps = [];
        }

        console.log("✅ التطبيقات بعد المعالجة:", apps);

        jsonbinReady = true;

        // إزالة رسالة التحميل لو موجودة
        const loadingEl = document.getElementById("loadingMessage");
        if (loadingEl) loadingEl.style.display = "none";

    } catch (error) {
        console.error("❌ خطأ في تحميل التطبيقات:", error);

        // fallback: حاول من localStorage
        let local = localStorage.getItem("apps");
        if (local) {
            apps = JSON.parse(local);
            console.log("📦 تم تحميل من localStorage");
        }

        jsonbinReady = true;
    }
}

// ========== حفظ التطبيقات ==========
async function saveApps() {
    try {
        console.log("💾 جاري حفظ التطبيقات...");

        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(apps)
        });

        const data = await response.json();

        console.log("✅ تم الحفظ:", data);

        // حفظ نسخة محلية احتياطية
        localStorage.setItem("apps", JSON.stringify(apps));

    } catch (error) {
        console.error("❌ خطأ في الحفظ:", error);
    }
}

// ========== رسائل ==========
function showAlert(message, type = "success") {
    alert(message); // بدون تغيير التصميم
}

// ========== بدء التشغيل ==========
loadApps();

// تحديث تلقائي كل 5 ثواني
setInterval(loadApps, 5000);