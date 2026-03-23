// عرض التطبيقات في الشبكة
function displayAppsGrid(list, containerId) {
    let container = document.getElementById(containerId);
    if(!container) return;
    if(!list.length) {
        container.innerHTML = '<div class="loading-skeleton">لا توجد تطبيقات</div>';
        return;
    }
    container.innerHTML = list.map(app => createAppCard(app)).join('');
}

// عرض المحتوى الرئيسي
function displayHomeContent() {
    let latestApps = [...apps].reverse().slice(0, 6);
    let mostDownloaded = [...apps].sort((a,b) => b.downloads - a.downloads).slice(0, 6);
    let topRated = [...apps].sort((a,b) => b.rating - a.rating).slice(0, 6);
    
    displayAppsGrid(latestApps, 'latestApps');
    displayAppsGrid(mostDownloaded, 'mostDownloadedApps');
    displayAppsGrid(topRated, 'topRatedApps');
}

// طلب تحميل التطبيق
function requestDownload(appId) {
    let app = apps.find(a => a.id === appId);
    if(!app) return;
    
    let hasRated = comments.find(c => c.appId === appId && c.userId === (currentUser ? currentUser.id : null));
    if(hasRated) {
        showDownloadConfirm(app);
    } else {
        pendingDownloadApp = app;
        showRatingModal(appId);
        showAlert('يرجى تقييم التطبيق أولاً', 'error');
    }
}

// عرض تأكيد التحميل
function showDownloadConfirm(app) {
    let infoDiv = document.getElementById('downloadAppInfo');
    if(infoDiv) infoDiv.innerHTML = `<h4>${app.name}</h4><p>الإصدار: ${app.version} | الحجم: ${app.size}</p>`;
    pendingDownloadApp = app;
    document.getElementById('downloadModal').style.display = 'block';
}

// تأكيد التحميل
function confirmDownload() {
    if(pendingDownloadApp) {
        showAdModal(() => {
            pendingDownloadApp.downloads++;
            saveApps();
            window.open(pendingDownloadApp.downloadLink, '_blank');
            closeDownloadModal();
            showAlert('جاري التحميل...', 'success');
            displayHomeContent();
        });
    }
}

function closeDownloadModal() {
    document.getElementById('downloadModal').style.display = 'none';
    pendingDownloadApp = null;
}

// عرض نافذة التقييم
function showRatingModal(appId) {
    let app = apps.find(a => a.id === appId);
    if(!app) return;
    
    currentAppId = appId;
    selectedRating = 0;
    
    let infoDiv = document.getElementById('modalAppInfo');
    if(infoDiv) infoDiv.innerHTML = `<h4>${app.name}</h4><p>${app.description.substring(0,100)}</p>`;
    
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    document.getElementById('commentText').value = '';
    document.getElementById('ratingModal').style.display = 'block';
}

function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.star').forEach((s, i) => {
        if(i < rating) s.classList.add('active');
        else s.classList.remove('active');
    });
}

function submitRating() {
    if(!selectedRating) {
        showAlert('يرجى اختيار التقييم', 'error');
        return;
    }
    
    let comment = document.getElementById('commentText').value.trim();
    if(!comment) {
        showAlert('يرجى إضافة تعليق', 'error');
        return;
    }
    
    let app = apps.find(a => a.id === currentAppId);
    if(app) {
        app.ratings.push(selectedRating);
        app.rating = app.ratings.reduce((s,r) => s+r, 0) / app.ratings.length;
        
        comments.push({
            id: Date.now(),
            appId: currentAppId,
            userId: currentUser ? currentUser.id : null,
            username: currentUser ? currentUser.username : 'زائر',
            comment: comment,
            rating: selectedRating,
            date: new Date().toISOString()
        });
        
        saveApps();
        saveComments();
        showAlert('تم إضافة التقييم', 'success');
        closeModal();
        displayHomeContent();
        
        if(pendingDownloadApp && pendingDownloadApp.id === currentAppId) {
            showDownloadConfirm(pendingDownloadApp);
        }
    }
}

function closeModal() {
    document.getElementById('ratingModal').style.display = 'none';
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}

// تهيئة الصفحة
displayHomeContent();

// أحداث النوافذ
window.onclick = function(e) {
    let ratingModal = document.getElementById('ratingModal');
    let downloadModal = document.getElementById('downloadModal');
    let adModal = document.getElementById('adModal');
    
    if(e.target === ratingModal) closeModal();
    if(e.target === downloadModal) closeDownloadModal();
    if(e.target === adModal) closeAdModal();
};

// بحث من الرابط
let urlParams = new URLSearchParams(window.location.search);
let searchTerm = urlParams.get('search');
if(searchTerm && document.getElementById('searchInput')) {
    document.getElementById('searchInput').value = searchTerm;
    searchApps();
}