// التحقق من وجود تطبيق للتعديل
let editAppId = null;
let urlParams = new URLSearchParams(window.location.search);
let editId = urlParams.get('edit');
if(editId) {
    editAppId = parseInt(editId);
    let appToEdit = apps.find(a => a.id === editAppId);
    if(appToEdit && (currentUser?.role === 'admin' || (currentUser?.role === 'moderator' && hasPermission(currentUser, 'editApp')))) {
        document.getElementById('pageTitle').innerHTML = '✏️ تعديل التطبيق';
        document.getElementById('pageDesc').innerHTML = 'قم بتعديل بيانات التطبيق';
        document.getElementById('submitBtn').innerHTML = '💾 حفظ التغييرات';
        document.getElementById('cancelBtn').style.display = 'block';
        
        // ملء البيانات
        document.getElementById('appId').value = appToEdit.id;
        document.getElementById('appName').value = appToEdit.name;
        document.getElementById('appDescription').value = appToEdit.description;
        document.getElementById('appVersion').value = appToEdit.version;
        document.getElementById('appCategory').value = appToEdit.category;
        document.getElementById('appDeviceType').value = appToEdit.deviceType;
        document.getElementById('appSize').value = appToEdit.size;
        document.getElementById('appImage').value = appToEdit.image;
        document.getElementById('appDownloadLink').value = appToEdit.downloadLink;
    } else {
        showAlert('لا تملك صلاحية تعديل هذا التطبيق', 'error');
        window.location.href = 'admin.html';
    }
}

// رفع أو تعديل التطبيق
document.getElementById('uploadForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if(!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    let appId = document.getElementById('appId').value;
    let appData = {
        id: appId ? parseInt(appId) : Date.now(),
        name: document.getElementById('appName').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
        version: document.getElementById('appVersion').value.trim(),
        category: document.getElementById('appCategory').value,
        deviceType: document.getElementById('appDeviceType').value,
        size: document.getElementById('appSize').value.trim(),
        image: document.getElementById('appImage').value || 'https://via.placeholder.com/300x180/cccccc/ffffff?text=No+Image',
        downloadLink: document.getElementById('appDownloadLink').value,
        downloads: 0,
        rating: 0,
        ratings: [],
        userId: currentUser.id,
        date: new Date().toISOString()
    };
    
    if(appId) {
        // تعديل تطبيق موجود
        let index = apps.findIndex(a => a.id === parseInt(appId));
        if(index !== -1) {
            appData.downloads = apps[index].downloads;
            appData.rating = apps[index].rating;
            appData.ratings = apps[index].ratings;
            apps[index] = appData;
            showAdModal(() => {
                showAlert('تم تعديل التطبيق بنجاح', 'success');
                window.location.href = 'admin.html';
            });
        }
    } else {
        // رفع تطبيق جديد
        apps.push(appData);
        showAdModal(() => {
            showAlert('تم رفع التطبيق بنجاح', 'success');
            window.location.href = 'apps.html';
        });
    }
    
    saveApps();
});

function cancelEdit() {
    window.location.href = 'admin.html';
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}