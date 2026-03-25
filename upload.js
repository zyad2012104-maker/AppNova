// upload.js - رفع وتعديل التطبيقات

let editAppId = null;
let urlParams = new URLSearchParams(window.location.search);
let editId = urlParams.get('edit');
if(editId) {
    editAppId = parseInt(editId);
}

// التحقق من تسجيل الدخول قبل عرض الصفحة
function checkLoginAndRedirect() {
    if (!currentUser) {
        showAlert('⚠️ يجب تسجيل الدخول أولاً لرفع التطبيقات', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

// تحميل التصنيفات في القائمة المنسدلة
function loadCategoriesForSelect() {
    let categorySelect = document.getElementById('appCategory');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">اختر التصنيف</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.key}">${cat.icon} ${cat.name}</option>`;
    });
}

(async function checkEditMode() {
    // انتظار تحميل البيانات
    while (!jsonbinReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // التحقق من تسجيل الدخول
    if (!checkLoginAndRedirect()) return;
    
    // تحميل التصنيفات
    loadCategoriesForSelect();
    
    if(editAppId) {
        let appToEdit = apps.find(a => a.id === editAppId);
        if(appToEdit && (currentUser?.role === 'admin' || (currentUser?.role === 'moderator' && hasPermission(currentUser, 'editApp')))) {
            document.getElementById('pageTitle').innerHTML = '✏️ تعديل التطبيق';
            document.getElementById('pageDesc').innerHTML = 'قم بتعديل بيانات التطبيق';
            document.getElementById('submitBtn').innerHTML = '💾 حفظ التغييرات';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            document.getElementById('appId').value = appToEdit.id;
            document.getElementById('appName').value = appToEdit.name;
            document.getElementById('appDescription').value = appToEdit.description;
            document.getElementById('appVersion').value = appToEdit.version;
            document.getElementById('appCategory').value = appToEdit.category;
            document.getElementById('appDeviceType').value = appToEdit.deviceType;
            document.getElementById('appSize').value = appToEdit.size;
            document.getElementById('appImage').value = appToEdit.image;
            document.getElementById('appDownloadLink').value = appToEdit.downloadLink;
            
            if (appToEdit.gallery && appToEdit.gallery.length) {
                document.getElementById('appGallery').value = appToEdit.gallery.join('\n');
            }
        } else if(appToEdit) {
            showAlert('لا تملك صلاحية تعديل هذا التطبيق', 'error');
            window.location.href = 'admin.html';
        }
    }
})();

document.getElementById('uploadForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if(!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    let galleryText = document.getElementById('appGallery')?.value.trim();
    let galleryImages = galleryText ? galleryText.split('\n').filter(url => url.trim() && url.trim().startsWith('http')) : [];
    
    if (galleryImages.length > 5) {
        galleryImages = galleryImages.slice(0, 5);
        showAlert('تم اقتصار معرض الصور على 5 صور فقط', 'info');
    }
    
    for (let i = 0; i < galleryImages.length; i++) {
        if (!galleryImages[i].startsWith('http')) {
            showAlert(`الرابط رقم ${i+1} غير صحيح. يجب أن يبدأ بـ http:// أو https://`, 'error');
            return;
        }
    }
    
    let appData = {
        id: document.getElementById('appId').value ? parseInt(document.getElementById('appId').value) : Date.now(),
        name: document.getElementById('appName').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
        version: document.getElementById('appVersion').value.trim(),
        category: document.getElementById('appCategory').value,
        deviceType: document.getElementById('appDeviceType').value,
        size: document.getElementById('appSize').value.trim(),
        image: document.getElementById('appImage').value.trim(),
        gallery: galleryImages,
        downloadLink: document.getElementById('appDownloadLink').value.trim(),
        downloads: 0,
        rating: 0,
        ratings: [],
        userId: currentUser.id,
        userName: currentUser.username,
        date: new Date().toISOString()
    };
    
    if (!appData.name) {
        showAlert('يرجى إدخال اسم التطبيق', 'error');
        return;
    }
    if (!appData.description) {
        showAlert('يرجى إدخال وصف التطبيق', 'error');
        return;
    }
    if (!appData.version) {
        showAlert('يرجى إدخال إصدار التطبيق', 'error');
        return;
    }
    if (!appData.category) {
        showAlert('يرجى اختيار تصنيف التطبيق', 'error');
        return;
    }
    if (!appData.deviceType) {
        showAlert('يرجى اختيار نوع الجهاز', 'error');
        return;
    }
    if (!appData.size) {
        showAlert('يرجى إدخال حجم التطبيق', 'error');
        return;
    }
    if (!appData.downloadLink) {
        showAlert('يرجى إدخال رابط تحميل التطبيق', 'error');
        return;
    }
    
    if (!appData.image) {
        appData.image = 'https://placehold.co/400x200/667eea/white?text=' + encodeURIComponent(appData.name);
    } else if (!appData.image.startsWith('http')) {
        showAlert('رابط الصورة الرئيسية يجب أن يبدأ بـ http:// أو https://', 'error');
        return;
    }
    
    if(document.getElementById('appId').value) {
        let index = apps.findIndex(a => a.id === parseInt(document.getElementById('appId').value));
        if(index !== -1) {
            appData.downloads = apps[index].downloads;
            appData.rating = apps[index].rating;
            appData.ratings = apps[index].ratings;
            apps[index] = appData;
            await saveApps();
            showAlert('تم تعديل التطبيق بنجاح', 'success');
            window.location.href = 'admin.html';
        }
    } else {
        showClickAd(async () => {
            apps.push(appData);
            await saveApps();
            showAlert('تم رفع التطبيق بنجاح', 'success');
            window.location.href = `app-detail.html?id=${appData.id}`;
        });
    }
});

function cancelEdit() {
    if (confirm('هل تريد إلغاء التعديل؟ سيتم فقدان التغييرات غير المحفوظة.')) {
        window.location.href = 'admin.html';
    }
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}