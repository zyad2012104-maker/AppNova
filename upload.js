// رفع تطبيق جديد
document.getElementById('uploadForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if(!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    let newApp = {
        id: Date.now(),
        name: document.getElementById('appName').value,
        description: document.getElementById('appDescription').value,
        version: document.getElementById('appVersion').value,
        category: document.getElementById('appCategory').value,
        deviceType: document.getElementById('appDeviceType').value,
        size: document.getElementById('appSize').value,
        image: document.getElementById('appImage').value || 'https://via.placeholder.com/300x180/cccccc/ffffff?text=No+Image',
        downloadLink: document.getElementById('appDownloadLink').value,
        downloads: 0,
        rating: 0,
        ratings: [],
        userId: currentUser.id,
        date: new Date().toISOString()
    };
    
    apps.push(newApp);
    saveApps();
    
    showAdModal(() => {
        showAlert('تم رفع التطبيق بنجاح', 'success');
        window.location.href = 'apps.html';
    });
});

// البحث
function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}