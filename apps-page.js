// عرض جميع التطبيقات
function displayAllApps() {
    let container = document.getElementById('allApps');
    if(!container) return;
    if(!apps.length) {
        container.innerHTML = '<div class="loading-skeleton">لا توجد تطبيقات</div>';
        return;
    }
    container.innerHTML = apps.map(app => createAppCard(app)).join('');
}

// تصفية التطبيقات حسب الفئة
function filterApps(category) {
    let filtered = category === 'all' ? apps : apps.filter(a => a.category === category);
    let container = document.getElementById('allApps');
    if(!container) return;
    if(!filtered.length) {
        container.innerHTML = '<div class="loading-skeleton">لا توجد تطبيقات</div>';
        return;
    }
    container.innerHTML = filtered.map(app => createAppCard(app)).join('');
    
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if(event.target) event.target.classList.add('active');
}

// البحث في التطبيقات
function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(!term) {
        displayAllApps();
        return;
    }
    
    let filtered = apps.filter(a => 
        a.name.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
    );
    
    let container = document.getElementById('allApps');
    if(!container) return;
    if(!filtered.length) {
        container.innerHTML = '<div class="loading-skeleton">لا توجد نتائج</div>';
        return;
    }
    container.innerHTML = filtered.map(app => createAppCard(app)).join('');
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

function showDownloadConfirm(app) {
    let infoDiv = document.getElementById('downloadAppInfo');
    if(infoDiv) infoDiv.innerHTML = `<h4>${escapeHtml(app.name)}</h4><p>الإصدار: ${app.version} | الحجم: ${app.size}</p>`;
    pendingDownloadApp = app;
    document.getElementById('downloadModal').style.display = 'block';
}

function confirmDownload() {
    if(pendingDownloadApp) {
        showAdModal(() => {
            pendingDownloadApp.downloads++;
            saveApps();
            window.open(pendingDownloadApp.downloadLink, '_blank');
            closeDownloadModal();
            showAlert('جاري التحميل...', 'success');
            displayAllApps();
        });
    }
}

function closeDownloadModal() {
    document.getElementById('downloadModal').style.display = 'none';
    pendingDownloadApp = null;
}

function showRatingModal(appId) {
    let app = apps.find(a => a.id === appId);
    if(!app) return;
    
    currentAppId = appId;
    selectedRating = 0;
    
    let infoDiv = document.getElementById('modalAppInfo');
    if(infoDiv) infoDiv.innerHTML = `<h4>${escapeHtml(app.name)}</h4><p>${escapeHtml(app.description.substring(0,100))}</p>`;
    
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
        displayAllApps();
        
        if(pendingDownloadApp && pendingDownloadApp.id === currentAppId) {
            showDownloadConfirm(pendingDownloadApp);
        }
    }
}

function closeModal() {
    document.getElementById('ratingModal').style.display = 'none';
}

// تهيئة الصفحة
displayAllApps();

// بحث من الرابط
let urlParams = new URLSearchParams(window.location.search);
let searchTerm = urlParams.get('search');
if(searchTerm && document.getElementById('searchInput')) {
    document.getElementById('searchInput').value = searchTerm;
    searchApps();
}

// عرض تطبيق معين
let viewId = urlParams.get('view');
if(viewId) {
    let app = apps.find(a => a.id === parseInt(viewId));
    if(app) {
        showRatingModal(app.id);
    }
}

// أحداث النوافذ
window.onclick = function(e) {
    let ratingModal = document.getElementById('ratingModal');
    let downloadModal = document.getElementById('downloadModal');
    let adModal = document.getElementById('adModal');
    
    if(e.target === ratingModal) closeModal();
    if(e.target === downloadModal) closeDownloadModal();
    if(e.target === adModal) closeAdModal();
};