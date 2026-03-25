// upload.js - نسخة مع تصحيح مباشر

let editAppId = null;
let urlParams = new URLSearchParams(window.location.search);
let editId = urlParams.get('edit');
if(editId) {
    editAppId = parseInt(editId);
}

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

function loadCategoriesForSelect() {
    let categorySelect = document.getElementById('appCategory');
    if (!categorySelect) return;
    categorySelect.innerHTML = '<option value="">اختر التصنيف</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.key}">${cat.icon} ${cat.name}</option>`;
    });
}

// دالة بسيطة لجلب الصور
function getGalleryImages() {
    let images = [];
    
    // محاولة جلب كل صورة على حدة
    let img1 = document.getElementById('galleryImage1');
    let img2 = document.getElementById('galleryImage2');
    let img3 = document.getElementById('galleryImage3');
    
    if (img1 && img1.value && img1.value.trim() !== '') {
        images.push(img1.value.trim());
        console.log('✅ صورة 1:', img1.value);
    }
    if (img2 && img2.value && img2.value.trim() !== '') {
        images.push(img2.value.trim());
        console.log('✅ صورة 2:', img2.value);
    }
    if (img3 && img3.value && img3.value.trim() !== '') {
        images.push(img3.value.trim());
        console.log('✅ صورة 3:', img3.value);
    }
    
    console.log('📸 جميع الصور:', images);
    return images;
}

// انتظار تحميل البيانات
(async function checkEditMode() {
    while (!jsonbinReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!checkLoginAndRedirect()) return;
    loadCategoriesForSelect();
    
    if(editAppId) {
        let appToEdit = apps.find(a => a.id === editAppId);
        if(appToEdit) {
            document.getElementById('pageTitle').innerHTML = '✏️ تعديل التطبيق';
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
            if (appToEdit.developer) {
                document.getElementById('appDeveloper').value = appToEdit.developer;
            }
            
            // عرض الصور
            if (appToEdit.gallery) {
                if (appToEdit.gallery[0]) document.getElementById('galleryImage1').value = appToEdit.gallery[0];
                if (appToEdit.gallery[1]) document.getElementById('galleryImage2').value = appToEdit.gallery[1];
                if (appToEdit.gallery[2]) document.getElementById('galleryImage3').value = appToEdit.gallery[2];
            }
        }
    }
})();

// حفظ التطبيق
document.getElementById('uploadForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('===== بدء حفظ التطبيق =====');
    
    if(!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    // جلب جميع البيانات
    let appName = document.getElementById('appName').value.trim();
    let appDescription = document.getElementById('appDescription').value.trim();
    let appVersion = document.getElementById('appVersion').value.trim();
    let appCategory = document.getElementById('appCategory').value;
    let appDeviceType = document.getElementById('appDeviceType').value;
    let appSize = document.getElementById('appSize').value.trim();
    let appImage = document.getElementById('appImage').value.trim();
    let appDownloadLink = document.getElementById('appDownloadLink').value.trim();
    let appDeveloper = document.getElementById('appDeveloper').value.trim();
    
    // جلب الصور - الطريقة المباشرة
    let galleryImages = [];
    let img1 = document.getElementById('galleryImage1');
    let img2 = document.getElementById('galleryImage2');
    let img3 = document.getElementById('galleryImage3');
    
    if (img1 && img1.value) galleryImages.push(img1.value);
    if (img2 && img2.value) galleryImages.push(img2.value);
    if (img3 && img3.value) galleryImages.push(img3.value);
    
    console.log('📸 الصور المجمعة:', galleryImages);
    
    // التحقق
    if (!appName) { showAlert('يرجى إدخال اسم التطبيق', 'error'); return; }
    if (!appDescription) { showAlert('يرجى إدخال وصف التطبيق', 'error'); return; }
    if (!appVersion) { showAlert('يرجى إدخال إصدار التطبيق', 'error'); return; }
    if (!appCategory) { showAlert('يرجى اختيار تصنيف التطبيق', 'error'); return; }
    if (!appDeviceType) { showAlert('يرجى اختيار نوع الجهاز', 'error'); return; }
    if (!appSize) { showAlert('يرجى إدخال حجم التطبيق', 'error'); return; }
    if (!appDownloadLink) { showAlert('يرجى إدخال رابط تحميل التطبيق', 'error'); return; }
    
    if (!appImage) {
        appImage = 'https://placehold.co/400x200/667eea/white?text=' + encodeURIComponent(appName);
    }
    
    // إنشاء بيانات التطبيق
    let appData = {
        id: document.getElementById('appId').value ? parseInt(document.getElementById('appId').value) : Date.now(),
        name: appName,
        description: appDescription,
        version: appVersion,
        category: appCategory,
        deviceType: appDeviceType,
        size: appSize,
        image: appImage,
        gallery: galleryImages,
        downloadLink: appDownloadLink,
        downloads: 0,
        rating: 0,
        ratings: [],
        userId: currentUser.id,
        userName: currentUser.username,
        developer: appDeveloper || currentUser.username,
        date: new Date().toISOString()
    };
    
    console.log('📦 التطبيق:', appData.name);
    console.log('📸 عدد الصور:', galleryImages.length);
    
    if(document.getElementById('appId').value) {
        // تعديل
        let index = apps.findIndex(a => a.id === parseInt(document.getElementById('appId').value));
        if(index !== -1) {
            appData.downloads = apps[index].downloads;
            appData.rating = apps[index].rating;
            appData.ratings = apps[index].ratings;
            apps[index] = appData;
            await saveApps();
            showAlert('تم تعديل التطبيق بنجاح مع ' + galleryImages.length + ' صور', 'success');
            window.location.href = 'admin.html';
        }
    } else {
        // إضافة جديدة
        apps.push(appData);
        await saveApps();
        console.log('✅ تم حفظ التطبيق مع', galleryImages.length, 'صور');
        showAlert('تم رفع التطبيق بنجاح مع ' + galleryImages.length + ' صور', 'success');
        window.location.href = `app-detail.html?id=${appData.id}`;
    }
});

function cancelEdit() {
    if (confirm('هل تريد إلغاء التعديل؟')) {
        window.location.href = 'admin.html';
    }
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}