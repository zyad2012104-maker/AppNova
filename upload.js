// upload.js - نسخة معدلة بالكامل

let editAppId = null;
let urlParams = new URLSearchParams(window.location.search);
let editId = urlParams.get('edit');

if (editId) {
    editAppId = parseInt(editId);
    console.log('✏️ وضع التعديل - ID:', editAppId);
}

// تحقق تسجيل الدخول
function checkLoginAndRedirect() {
    if (!currentUser) {
        showAlert('⚠️ يجب تسجيل الدخول أولاً', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

// تحميل التصنيفات
function loadCategoriesForSelect() {
    let select = document.getElementById('appCategory');
    if (!select) return;

    select.innerHTML = '<option value="">اختر التصنيف</option>';

    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.key}">${cat.icon} ${cat.name}</option>`;
    });
}

// جلب صور المعرض
function getGalleryImages() {
    let images = [];

    ['galleryImage1', 'galleryImage2', 'galleryImage3'].forEach(id => {
        let el = document.getElementById(id);
        if (el && el.value.trim()) {
            images.push(el.value.trim());
        }
    });

    return images;
}

// تعيين صور المعرض
function setGalleryImages(gallery) {
    if (!gallery) return;

    gallery.forEach((img, i) => {
        let input = document.getElementById(`galleryImage${i + 1}`);
        let preview = document.getElementById(`preview${i + 1}`);

        if (input) input.value = img;
        if (preview) {
            preview.innerHTML = `
                <div class="preview-item">
                    <img src="${img}">
                    <button onclick="clearImage('galleryImage${i + 1}','preview${i + 1}')">×</button>
                </div>`;
        }
    });
}

// تحميل بيانات التعديل
(async function loadEditData() {
    while (!jsonbinReady) {
        await new Promise(r => setTimeout(r, 100));
    }

    if (!checkLoginAndRedirect()) return;

    loadCategoriesForSelect();

    if (editAppId) {
        let app = apps.find(a => a.id === editAppId);

        if (app) {
            console.log('📦 تحميل بيانات التطبيق');

            document.getElementById('pageTitle').innerText = '✏️ تعديل التطبيق';
            document.getElementById('submitBtn').innerText = '💾 حفظ التغييرات';

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

            if (app.image) {
                document.getElementById('mainImagePreview').innerHTML = `
                    <div class="preview-item">
                        <img src="${app.image}">
                    </div>`;
            }
        }
    }
})();

// حفظ التطبيق
async function saveApp() {
    console.log('🚀 بدء الحفظ');

    if (!currentUser) {
        showAlert('يجب تسجيل الدخول', 'error');
        return;
    }

    let appId = document.getElementById('appId').value;
    let isEdit = appId && appId !== '';

    // البيانات
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
        developer: document.getElementById('appDeveloper').value.trim() || currentUser.username,
        userId: currentUser.id,
        userName: currentUser.username,
        date: new Date().toISOString(),

        // القيم الافتراضية
        downloads: 0,
        rating: 0,
        ratings: [],
        comments: []
    };

    // تحقق
    if (!appData.name || !appData.description || !appData.downloadLink) {
        showAlert('❌ أكمل البيانات', 'error');
        return;
    }

    if (isEdit) {
        console.log('✏️ تعديل...');

        let oldApp = apps.find(a => a.id === appData.id);

        if (oldApp) {
            // الاحتفاظ بالبيانات المهمة
            appData.downloads = oldApp.downloads || 0;
            appData.rating = oldApp.rating || 0;
            appData.ratings = oldApp.ratings || [];
            appData.comments = oldApp.comments || [];
        }

        // حذف القديم
        apps = apps.filter(a => a.id !== appData.id);

        // إضافة الجديد
        apps.push(appData);

        await saveApps();

        showAlert('✅ تم تحديث التطبيق', 'success');
        window.location.href = 'admin.html';

    } else {
        console.log('📤 إضافة جديدة');

        apps.push(appData);
        await saveApps();

        showAlert('✅ تم رفع التطبيق', 'success');
        window.location.href = `app-detail.html?id=${appData.id}`;
    }
}

// زر الإرسال
document.getElementById('submitBtn')?.addEventListener('click', function (e) {
    e.preventDefault();
    saveApp();
});

// النموذج
document.getElementById('uploadForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    saveApp();
});

// مسح صورة
window.clearImage = function (inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
};