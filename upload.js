// upload.js - نسخة تصحيح الأخطاء

let editAppId = null;
let urlParams = new URLSearchParams(window.location.search);
let editId = urlParams.get('edit');
if(editId) {
    editAppId = parseInt(editId);
}

// التحقق من تسجيل الدخول
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

// تحميل التصنيفات
function loadCategoriesForSelect() {
    let categorySelect = document.getElementById('appCategory');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">اختر التصنيف</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.key}">${cat.icon} ${cat.name}</option>`;
    });
}

// دالة لجلب معرض الصور
function getGalleryImages() {
    console.log('🔍 جلب الصور من الحقول...');
    
    let images = [];
    
    // الحصول على الصورة 1
    let img1 = document.getElementById('galleryImage1');
    if (img1) {
        let val1 = img1.value.trim();
        console.log('📸 حقل الصورة 1:', val1);
        if (val1 && val1 !== '') {
            images.push(val1);
        }
    }
    
    // الحصول على الصورة 2
    let img2 = document.getElementById('galleryImage2');
    if (img2) {
        let val2 = img2.value.trim();
        console.log('📸 حقل الصورة 2:', val2);
        if (val2 && val2 !== '') {
            images.push(val2);
        }
    }
    
    // الحصول على الصورة 3
    let img3 = document.getElementById('galleryImage3');
    if (img3) {
        let val3 = img3.value.trim();
        console.log('📸 حقل الصورة 3:', val3);
        if (val3 && val3 !== '') {
            images.push(val3);
        }
    }
    
    console.log('📸 الصور المجمعة:', images);
    console.log('📸 عدد الصور:', images.length);
    
    return images;
}

// انتظار تحميل البيانات
(async function checkEditMode() {
    console.log('⏳ انتظار تحميل البيانات...');
    while (!jsonbinReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('✅ البيانات جاهزة');
    
    if (!checkLoginAndRedirect()) return;
    loadCategoriesForSelect();
    
    if(editAppId) {
        let appToEdit = apps.find(a => a.id === editAppId);
        if(appToEdit) {
            console.log('✏️ تعديل التطبيق:', appToEdit.name);
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
            if (appToEdit.developer) {
                document.getElementById('appDeveloper').value = appToEdit.developer;
            }
            
            // عرض الصور إذا وجدت
            if (appToEdit.gallery && appToEdit.gallery.length) {
                console.log('📸 تحميل الصور للتعديل:', appToEdit.gallery);
                if (appToEdit.gallery[0]) document.getElementById('galleryImage1').value = appToEdit.gallery[0];
                if (appToEdit.gallery[1]) document.getElementById('galleryImage2').value = appToEdit.gallery[1];
                if (appToEdit.gallery[2]) document.getElementById('galleryImage3').value = appToEdit.gallery[2];
            }
        }
    }
})();

// معالجة إرسال النموذج
document.getElementById('uploadForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('📝 بدء عملية حفظ التطبيق...');
    
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
    
    console.log('📝 البيانات الأساسية:', {
        name: appName,
        category: appCategory,
        version: appVersion,
        size: appSize,
        image: appImage
    });
    
    // جلب الصور
    let galleryImages = getGalleryImages();
    
    // التحقق من الحقول المطلوبة
    if (!appName) { showAlert('يرجى إدخال اسم التطبيق', 'error'); return; }
    if (!appDescription) { showAlert('يرجى إدخال وصف التطبيق', 'error'); return; }
    if (!appVersion) { showAlert('يرجى إدخال إصدار التطبيق', 'error'); return; }
    if (!appCategory) { showAlert('يرجى اختيار تصنيف التطبيق', 'error'); return; }
    if (!appDeviceType) { showAlert('يرجى اختيار نوع الجهاز', 'error'); return; }
    if (!appSize) { showAlert('يرجى إدخال حجم التطبيق', 'error'); return; }
    if (!appDownloadLink) { showAlert('يرجى إدخال رابط تحميل التطبيق', 'error'); return; }
    
    // الصورة الرئيسية
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
    
    console.log('📦 بيانات التطبيق الكاملة:', appData);
    console.log('📸 الصور في gallery:', appData.gallery);
    console.log('📸 عدد الصور:', appData.gallery.length);
    
    if(document.getElementById('appId').value) {
        // تعديل
        let index = apps.findIndex(a => a.id === parseInt(document.getElementById('appId').value));
        if(index !== -1) {
            appData.downloads = apps[index].downloads;
            appData.rating = apps[index].rating;
            appData.ratings = apps[index].ratings;
            apps[index] = appData;
            await saveApps();
            console.log('✅ تم تعديل التطبيق بنجاح');
            showAlert('تم تعديل التطبيق بنجاح مع ' + galleryImages.length + ' صور', 'success');
            window.location.href = 'admin.html';
        }
    } else {
        // إضافة جديدة
        apps.push(appData);
        await saveApps();
        console.log('✅ تم رفع التطبيق الجديد بنجاح');
        console.log('📸 الصور المحفوظة في قاعدة البيانات:', apps[apps.length-1].gallery);
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