// config.js - إعدادات JSONBin.io
// ⚠️ مهم: احفظ هذا الملف ولا تشاركه!

const CONFIG = {
    JSONBIN: {
        // ضع المعلومات التي نسختها من JSONBin.io هنا
        BIN_ID: '69c13f81b7ec241ddc956318',
        MASTER_KEY: '$2a$10$5X1fbgOhCiGV23rKGUkLLuhD/a1eIHNuKwvtNzKwu3W7KT8CGpaG.',
        BASE_URL: 'https://api.jsonbin.io/v3/b/'
    }
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}