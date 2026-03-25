// ================== الإعدادات ==================
let apps = [];
let jsonbinReady = false;
let editAppId = null;

// ================== تحميل التطبيقات من JSONBin ==================
async function loadApps() {
    try {
        console.log('📥 تحميل البيانات...');
        const response = await fetch(
            CONFIG.JSONBIN.BASE_URL + CONFIG.JSONBIN.BIN_ID,
            {
                headers: { 'X-Master-Key': CONFIG.JSONBIN.MASTER_KEY }
            }
        );
        const data = await response.json();
        apps = data.record.apps || [];
        jsonbinReady = true;
        console.log('✅ تم تحميل التطبيقات', apps);
    } catch (error) {
        console.error('❌ خطأ تحميل التطبيقات:', error);
    }
}

// ================== حفظ التطبيقات إلى JSONBin ==================
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
        if (!response.ok) throw new Error('فشل الحفظ');
        console.log('✅ تم الحفظ بنجاح', data);
        return true;
    } catch (error) {
        console.error('❌ خطأ الحفظ:', error);
        alert('فشل رفع البيانات');
        return false;
    }
}

// ================== التصنيفات ==================
let categories = [
    { key: 'games', name: 'ألعاب', icon: '🎮' },
    { key: 'apps', name: 'تطبيقات', icon: '📱' },
    { key: 'tools', name: 'أدوات', icon: '🛠️' },
    { key: 'education', name: 'تعليمي', icon: '📚' }
];

function loadCategoriesForSelect() {
    let select = document.getElementById('appCategory');
    if (!select) return;
    select.innerHTML = '<option value="">اختر التصنيف</option>';
    categories.forEach(cat => {
        let option = document.createElement('option');
        option.value = cat.key;
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
    });
    console.log('✅ تم تحميل التصنيفات');
}

// ================== المعرض ==================
function getGalleryImages() {
    let images = [];
    for (let i = 1; i <= 3; i++) {
        let el = document.getElementById('galleryImage' + i);
        if (el && el.value.trim() !== '') images.push(el.value.trim());
    }
    return images;
}

function setGalleryImages(gallery) {
    if (!Array.isArray(gallery)) return;
    gallery.forEach((img, i) => {
        let input = document.getElementById(`galleryImage${i+1}`);
        if (input) input.value = img;
    });
}

// ================== فتح الصفحة ==================
async function initPage() {
    await loadApps();

    loadCategoriesForSelect();

    let urlParams = new URLSearchParams(window.location.search);
    let editId = urlParams.get('edit');
    if (editId) {
        editAppId = parseInt(editId);
        let app = apps.find(a => a.id === editAppId);
        if (app) {
            document.getElementById('appId').value = app.id;
            document.getElementById('appName').value = app.name;
            document.getElementById('appDescription').value = app.description;
            document.getElementById('appVersion').value = app.version;
            document.getElementById('appDeviceType').value = app.deviceType;
            document.getElementById('appSize').value = app.size;
            document.getElementById('appImage').value = app.image;
            document.getElementById('appDownloadLink').value = app.downloadLink;
            document.getElementById('appDeveloper').value = app.developer || '';
            
            setGalleryImages(app.gallery);

            setTimeout(() => {
                document.getElementById('appCategory').value = app.category;
            }, 100);

            document.getElementById('submitBtn').innerText = '💾 حفظ التغييرات';
            document.getElementById('cancelBtn').style.display = 'inline-block';
        }
    }
}

// ================== حفظ/رفع التطبيق ==================
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

    if (!appData.name || !appData.description || !appData.version || !appData.category || !appData.deviceType || !appData.size || !appData.image || !appData.downloadLink) {
        return alert('يرجى ملء جميع الحقول المطلوبة!');
    }

    if (isEdit) {
        let oldApp = apps.find(a => a.id === appData.id);
        if (oldApp) {
            appData.downloads = oldApp.downloads;
            appData.rating = oldApp.rating;
            appData.ratings = oldApp.ratings;
            appData.comments = oldApp.comments;
        }

        apps = apps.filter(a => a.id !== appData.id);
        apps.push(appData);

        await saveApps();
        alert('تم تعديل التطبيق بنجاح');
        window.location.href = 'admin.html';
    } else {
        apps.push(appData);
        await saveApps();
        alert('تم رفع التطبيق بنجاح');
        window.location.href = 'admin.html';
    }
}

// ================== أحداث ==================
document.getElementById('submitBtn')?.addEventListener('click', e => {
    e.preventDefault();
    saveApp();
});

document.getElementById('uploadForm')?.addEventListener('submit', e => {
    e.preventDefault();
    saveApp();
});

function cancelEdit() {
    if (confirm('هل تريد إلغاء التعديل؟')) window.location.href = 'admin.html';
}

// ================== معاينة الصور ==================
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            preview.innerHTML = `
                <div class="preview-item">
                    <img src="${url}" onerror="this.src='https://placehold.co/100x100/ef4444/white?text=خطأ'">
                    <button class="remove-image" onclick="clearImage('${inputId}', '${previewId}')">×</button>
                </div>
            `;
        } else if (url) {
            preview.innerHTML = `<div class="preview-item" style="background:#fee2e2; display:flex; align-items:center; justify-content:center; color:#ef4444;">رابط غير صالح</div>`;
        } else {
            preview.innerHTML = '';
        }
    });
}

function clearImage(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
}

// تفعيل معاينة الصور
previewImage('appImage', 'mainImagePreview');
previewImage('galleryImage1', 'preview1');
previewImage('galleryImage2', 'preview2');
previewImage('galleryImage3', 'preview3');

// ================== تشغيل الصفحة ==================
initPage();