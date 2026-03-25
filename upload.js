// ================== الإعدادات ==================
const CONFIG = {
    JSONBIN: {
        BIN_ID: '69c13f81b7ec241ddc956318',
        MASTER_KEY: '$2a$10$5X1fbgOhCiGV23rKGUkLLuhD/a1eIHNuKwvtNzKwu3W7KT8CGpaG.',
        BASE_URL: 'https://api.jsonbin.io/v3/b/'
    }
};

let apps = [];
let jsonbinReady = false;
let editAppId = null;

// ================== تحميل البيانات ==================
async function loadApps() {
    try {
        console.log('📥 تحميل البيانات...');

        const response = await fetch(
            CONFIG.JSONBIN.BASE_URL + CONFIG.JSONBIN.BIN_ID,
            {
                headers: {
                    'X-Master-Key': CONFIG.JSONBIN.MASTER_KEY
                }
            }
        );

        const data = await response.json();

        apps = data.record.apps || [];
        jsonbinReady = true;

        console.log('✅ تم تحميل التطبيقات:', apps);

    } catch (error) {
        console.error('❌ خطأ تحميل:', error);
    }
}

// ================== حفظ البيانات ==================
async function saveApps() {
    try {
        console.log('📡 جاري الحفظ...');

        const response = await fetch(
            CONFIG.JSONBIN.BASE_URL + CONFIG.JSONBIN.BIN_ID,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': CONFIG.JSONBIN.MASTER_KEY,
                    'X-Bin-Versioning': 'false'
                },
                body: JSON.stringify({ apps: apps })
            }
        );

        const data = await response.json();

        console.log('📥 رد السيرفر:', data);

        if (!response.ok) throw new Error('فشل الحفظ');

        return true;

    } catch (error) {
        console.error('❌ خطأ حفظ:', error);
        alert('فشل حفظ البيانات');
        return false;
    }
}

// ================== تحميل التصنيفات ==================
function loadCategoriesForSelect() {
    let select = document.getElementById('appCategory');
    if (!select) return;

    select.innerHTML = '<option value="">اختر التصنيف</option>';

    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.key}">${cat.icon} ${cat.name}</option>`;
    });
}

// ================== صور المعرض ==================
function getGalleryImages() {
    let images = [];

    ['galleryImage1','galleryImage2','galleryImage3'].forEach(id => {
        let el = document.getElementById(id);
        if (el && el.value.trim()) {
            images.push(el.value.trim());
        }
    });

    return images;
}

function setGalleryImages(gallery) {
    if (!gallery) return;

    gallery.forEach((img, i) => {
        let input = document.getElementById(`galleryImage${i+1}`);
        if (input) input.value = img;
    });
}

// ================== فتح التعديل ==================
async function initPage() {
    await loadApps();

    loadCategoriesForSelect();

    let urlParams = new URLSearchParams(window.location.search);
    let editId = urlParams.get('edit');

    if (editId) {
        editAppId = parseInt(editId);

        let app = apps.find(a => a.id === editAppId);

        if (app) {
            console.log('✏️ تحميل بيانات التعديل');

            document.getElementById('appId').value = app.id;
            document.getElementById('appName').value = app.name;
            document.getElementById('appDescription').value = app.description;
            document.getElementById('appVersion').value = app.version;
            document.getElementById('appCategory').value = app.category;
            document.getElementById('appDeviceType').value = app.deviceType;
            document.getElementById('appSize').value = app.size;
            document.getElementById('appImage').value = app.image;
            document.getElementById('appDownloadLink').value = app.downloadLink;
            document.getElementById('appDeveloper').value = app.developer || '';

            setGalleryImages(app.gallery);

            document.getElementById('submitBtn').innerText = '💾 حفظ التغييرات';
        }
    }
}

// ================== حفظ / رفع ==================
async function saveApp() {

    let appId = document.getElementById('appId').value;
    let isEdit = appId && appId !== '';

    let appData = {
        id: isEdit ? parseInt(appId) : Date.now(),
        name: document.getElementById('appName').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
        version: document.getElementById('appVersion').value.trim(),
        category: document.getElementById('appCategory').value,
        deviceType: document.getElementById('appDeviceType').value,
        size: document.getElementById('appSize').value.trim(),
        image: document.getElementById('appImage').value.trim(),
        gallery: getGalleryImages(),
        downloadLink: document.getElementById('appDownloadLink').value.trim(),
        developer: document.getElementById('appDeveloper').value.trim(),
        date: new Date().toISOString(),

        downloads: 0,
        rating: 0,
        ratings: [],
        comments: []
    };

    if (!appData.name) return alert('اكتب اسم التطبيق');

    if (isEdit) {
        console.log('✏️ تعديل التطبيق');

        let oldApp = apps.find(a => a.id === appData.id);

        if (oldApp) {
            appData.downloads = oldApp.downloads;
            appData.rating = oldApp.rating;
            appData.ratings = oldApp.ratings;
            appData.comments = oldApp.comments;
        }

        // حذف القديم
        apps = apps.filter(a => a.id !== appData.id);

        // إضافة الجديد
        apps.push(appData);

        await saveApps();

        alert('تم التحديث');
        window.location.href = 'admin.html';

    } else {
        console.log('📤 رفع جديد');

        apps.push(appData);

        await saveApps();

        alert('تم الرفع');
        window.location.href = 'admin.html';
    }
}

// ================== أحداث ==================
document.getElementById('submitBtn')?.addEventListener('click', function(e){
    e.preventDefault();
    saveApp();
});

document.getElementById('uploadForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    saveApp();
});

// ================== تشغيل ==================
initPage();