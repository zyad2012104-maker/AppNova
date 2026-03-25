// upload.js - رفع وتعديل التطبيقات مع 3 صور منفصلة

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

// دالة لجلب معرض الصور من الحقول المنفصلة
function getGalleryImages() {
    let images = [];
    const imageInputs = ['galleryImage1', 'galleryImage2', 'galleryImage3'];
    
    for (let i = 0; i < imageInputs.length; i++) {
        const input = document.getElementById(imageInputs[i]);
        if (input) {
            const url = input.value.trim();
            if (url && url !== '') {
                // التحقق من صحة الرابط
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    images.push(url);
                    console.log(`✅ تم إضافة الصورة ${i+1}:`, url);
                } else {
                    console.log(`⚠️ الصورة ${i+1} رابط غير صالح (يجب أن يبدأ بـ http:// أو https://):`, url);
                    showAlert(`⚠️ رابط الصورة ${i+1} غير صحيح. يجب أن يبدأ بـ http:// أو https://`, 'error');
                }
            }
        }
    }
    
    console.log('📸 جميع الصور المجمعة:', images);
    return images;
}

// دالة لتعيين معرض الصور في الحقول المنفصلة (للتعديل)
function setGalleryImages(gallery) {
    if (!gallery || gallery.length === 0) {
        console.log('⚠️ لا توجد صور لعرضها للتعديل');
        return;
    }
    
    console.log('📸 تحميل الصور للتعديل:', gallery);
    
    for (let i = 0; i < gallery.length && i < 3; i++) {
        const input = document.getElementById(`galleryImage${i + 1}`);
        if (input && gallery[i]) {
            input.value = gallery[i];
            console.log(`✅ تم تعيين الصورة ${i+1}:`, gallery[i]);
            
            // تحديث المعاينة
            const previewId = `preview${i + 1}`;
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.innerHTML = `
                    <div class="preview-item">
                        <img src="${gallery[i]}" onerror="this.src='https://placehold.co/100x100/ef4444/white?text=خطأ'">
                        <button class="remove-image" onclick="clearImage('galleryImage${i + 1}', 'preview${i + 1}')">×</button>
                    </div>
                `;
            }
        }
    }
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
            if (appToEdit.developer) {
                document.getElementById('appDeveloper').value = appToEdit.developer;
            }
            
            // عرض معرض الصور في الحقول المنفصلة
            if (appToEdit.gallery && appToEdit.gallery.length) {
                setGalleryImages(appToEdit.gallery);
            }
            
            // معاينة الصورة الرئيسية
            if (appToEdit.image) {
                const mainPreview = document.getElementById('mainImagePreview');
                if (mainPreview) {
                    mainPreview.innerHTML = `
                        <div class="preview-item">
                            <img src="${appToEdit.image}" onerror="this.src='https://placehold.co/100x100/ef4444/white?text=خطأ'">
                            <button class="remove-image" onclick="clearImage('appImage', 'mainImagePreview')">×</button>
                        </div>
                    `;
                }
            }
        } else if(appToEdit) {
            showAlert('لا تملك صلاحية تعديل هذا التطبيق', 'error');
            window.location.href = 'admin.html';
        }
    }
})();

// معالجة إرسال النموذج
document.getElementById('uploadForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if(!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    // جلب الصورة الرئيسية
    let mainImage = document.getElementById('appImage').value.trim();
    
    // جلب معرض الصور من الحقول المنفصلة
    let galleryImages = getGalleryImages();
    
    // إذا لم توجد صور في المعرض ولكن هناك صورة رئيسية، أضفها كأول صورة في المعرض
    if (galleryImages.length === 0 && mainImage && mainImage !== '') {
        galleryImages = [mainImage];
        console.log('📸 تم إضافة الصورة الرئيسية كأول صورة في المعرض');
    }
    
    console.log('📸 الصورة الرئيسية:', mainImage);
    console.log('📸 معرض الصور:', galleryImages);
    
    let appData = {
        id: document.getElementById('appId').value ? parseInt(document.getElementById('appId').value) : Date.now(),
        name: document.getElementById('appName').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
        version: document.getElementById('appVersion').value.trim(),
        category: document.getElementById('appCategory').value,
        deviceType: document.getElementById('appDeviceType').value,
        size: document.getElementById('appSize').value.trim(),
        image: mainImage,
        gallery: galleryImages,
        downloadLink: document.getElementById('appDownloadLink').value.trim(),
        downloads: 0,
        rating: 0,
        ratings: [],
        userId: currentUser.id,
        userName: currentUser.username,
        developer: document.getElementById('appDeveloper').value.trim() || currentUser.username,
        date: new Date().toISOString()
    };
    
    // التحقق من الحقول المطلوبة
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
    
    // التحقق من صورة التطبيق الرئيسية
    if (!appData.image) {
        appData.image = 'https://placehold.co/400x200/667eea/white?text=' + encodeURIComponent(appData.name);
    } else if (!appData.image.startsWith('http')) {
        showAlert('رابط الصورة الرئيسية يجب أن يبدأ بـ http:// أو https://', 'error');
        return;
    }
    
    console.log('📦 بيانات التطبيق النهائية:', appData);
    console.log('📸 معرض الصور في البيانات:', appData.gallery);
    console.log('📸 عدد الصور:', appData.gallery.length);
    
    if(document.getElementById('appId').value) {
        // وضع التعديل
        let index = apps.findIndex(a => a.id === parseInt(document.getElementById('appId').value));
        if(index !== -1) {
            appData.downloads = apps[index].downloads;
            appData.rating = apps[index].rating;
            appData.ratings = apps[index].ratings;
            apps[index] = appData;
            await saveApps();
            console.log('✅ تم تعديل التطبيق بنجاح مع الصور:', appData.gallery);
            showAlert('تم تعديل التطبيق بنجاح', 'success');
            window.location.href = 'admin.html';
        }
    } else {
        // وضع الإضافة الجديدة
        apps.push(appData);
        await saveApps();
        console.log('✅ تم حفظ التطبيق الجديد بنجاح مع الصور:', appData.gallery);
        console.log('✅ عدد الصور المحفوظة:', appData.gallery.length);
        showAlert('تم رفع التطبيق بنجاح مع ' + appData.gallery.length + ' صور', 'success');
        window.location.href = `app-detail.html?id=${appData.id}`;
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

// دالة مساعدة لمسح الصورة
window.clearImage = function(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
};