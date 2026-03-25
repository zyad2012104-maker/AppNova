// upload.js - نسخة مبسطة جداً

let editAppId = null;
let urlParams = new URLSearchParams(window.location.search);
let editId = urlParams.get('edit');
if(editId) {
    editAppId = parseInt(editId);
    console.log('✏️ وضع التعديل - ID:', editAppId);
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

function getGalleryImages() {
    let images = [];
    
    let img1 = document.getElementById('galleryImage1');
    let img2 = document.getElementById('galleryImage2');
    let img3 = document.getElementById('galleryImage3');
    
    if (img1 && img1.value && img1.value.trim() !== '') {
        images.push(img1.value.trim());
    }
    if (img2 && img2.value && img2.value.trim() !== '') {
        images.push(img2.value.trim());
    }
    if (img3 && img3.value && img3.value.trim() !== '') {
        images.push(img3.value.trim());
    }
    
    return images;
}

function setGalleryImages(gallery) {
    if (!gallery) return;
    
    if (gallery[0]) {
        let input1 = document.getElementById('galleryImage1');
        if (input1) input1.value = gallery[0];
        let preview1 = document.getElementById('preview1');
        if (preview1) {
            preview1.innerHTML = `<div class="preview-item"><img src="${gallery[0]}"><button class="remove-image" onclick="clearImage('galleryImage1', 'preview1')">×</button></div>`;
        }
    }
    if (gallery[1]) {
        let input2 = document.getElementById('galleryImage2');
        if (input2) input2.value = gallery[1];
        let preview2 = document.getElementById('preview2');
        if (preview2) {
            preview2.innerHTML = `<div class="preview-item"><img src="${gallery[1]}"><button class="remove-image" onclick="clearImage('galleryImage2', 'preview2')">×</button></div>`;
        }
    }
    if (gallery[2]) {
        let input3 = document.getElementById('galleryImage3');
        if (input3) input3.value = gallery[2];
        let preview3 = document.getElementById('preview3');
        if (preview3) {
            preview3.innerHTML = `<div class="preview-item"><img src="${gallery[2]}"><button class="remove-image" onclick="clearImage('galleryImage3', 'preview3')">×</button></div>`;
        }
    }
}

// تحميل بيانات التعديل
(async function loadEditData() {
    while (!jsonbinReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!checkLoginAndRedirect()) return;
    loadCategoriesForSelect();
    
    if(editAppId) {
        let appToEdit = apps.find(a => a.id === editAppId);
        if(appToEdit) {
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
            
            if (appToEdit.gallery && appToEdit.gallery.length > 0) {
                setGalleryImages(appToEdit.gallery);
            }
            
            if (appToEdit.image) {
                let mainPreview = document.getElementById('mainImagePreview');
                if (mainPreview) {
                    mainPreview.innerHTML = `<div class="preview-item"><img src="${appToEdit.image}"><button class="remove-image" onclick="clearImage('appImage', 'mainImagePreview')">×</button></div>`;
                }
            }
        }
    }
})();

// دالة حفظ التطبيق
async function saveApp() {
    console.log('===== بدء حفظ التطبيق =====');
    
    if(!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return false;
    }
    
    // جلب البيانات
    let appId = document.getElementById('appId').value;
    let isEdit = (appId && appId !== '');
    
    let appName = document.getElementById('appName').value.trim();
    let appDescription = document.getElementById('appDescription').value.trim();
    let appVersion = document.getElementById('appVersion').value.trim();
    let appCategory = document.getElementById('appCategory').value;
    let appDeviceType = document.getElementById('appDeviceType').value;
    let appSize = document.getElementById('appSize').value.trim();
    let appImage = document.getElementById('appImage').value.trim();
    let appDownloadLink = document.getElementById('appDownloadLink').value.trim();
    let appDeveloper = document.getElementById('appDeveloper').value.trim();
    
    // جلب الصور
    let galleryImages = getGalleryImages();
    
    console.log('📝 الاسم:', appName);
    console.log('📸 عدد الصور:', galleryImages.length);
    
    // التحقق
    if (!appName) { showAlert('يرجى إدخال اسم التطبيق', 'error'); return false; }
    if (!appDescription) { showAlert('يرجى إدخال وصف التطبيق', 'error'); return false; }
    if (!appVersion) { showAlert('يرجى إدخال إصدار التطبيق', 'error'); return false; }
    if (!appCategory) { showAlert('يرجى اختيار تصنيف التطبيق', 'error'); return false; }
    if (!appDeviceType) { showAlert('يرجى اختيار نوع الجهاز', 'error'); return false; }
    if (!appSize) { showAlert('يرجى إدخال حجم التطبيق', 'error'); return false; }
    if (!appDownloadLink) { showAlert('يرجى إدخال رابط تحميل التطبيق', 'error'); return false; }
    
    if (!appImage) {
        appImage = 'https://placehold.co/400x200/667eea/white?text=' + encodeURIComponent(appName);
    }
    
    let appData = {
        id: isEdit ? parseInt(appId) : Date.now(),
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
    
    if (isEdit) {
        // تعديل
        let index = apps.findIndex(a => a.id === appData.id);
        if (index !== -1) {
            appData.downloads = apps[index].downloads;
            appData.rating = apps[index].rating;
            appData.ratings = apps[index].ratings;
            apps[index] = appData;
            await saveApps();
            console.log('✅ تم التعديل بنجاح');
            showAlert('تم تعديل التطبيق بنجاح', 'success');
            window.location.href = 'admin.html';
            return true;
        }
    } else {
        // إضافة جديدة
        apps.push(appData);
        await saveApps();
        console.log('✅ تم الرفع بنجاح');
        showAlert('تم رفع التطبيق بنجاح', 'success');
        window.location.href = `app-detail.html?id=${appData.id}`;
        return true;
    }
    
    return false;
}

// ربط حدث الضغط على زر الرفع
document.getElementById('submitBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('🖱️ تم الضغط على زر رفع التطبيق');
    saveApp();
});

// ربط حدث إرسال النموذج (كإجراء احتياطي)
document.getElementById('uploadForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('📝 تم إرسال النموذج');
    saveApp();
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

window.clearImage = function(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
};