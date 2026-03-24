// apps-page.js - صفحة التطبيقات مع JSONBin.io

function displayAllApps() {
    let container = document.getElementById('allApps');
    if(!container) return;
    
    console.log('🔄 عرض جميع التطبيقات...');
    console.log(`📱 عدد التطبيقات: ${apps.length}`);
    
    if(!apps || apps.length === 0) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    container.innerHTML = apps.map(app => createAppCard(app)).join('');
}

function filterApps(category) {
    let filtered = category === 'all' ? apps : apps.filter(a => a.category === category);
    let container = document.getElementById('allApps');
    if(!container) return;
    
    console.log(`🔍 تصفية حسب: ${category}, النتائج: ${filtered.length}`);
    
    if(!filtered.length) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات في هذا التصنيف</div>';
        return;
    }
    container.innerHTML = filtered.map(app => createAppCard(app)).join('');
    
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    let container = document.getElementById('allApps');
    if(!container) return;
    
    if(!term) {
        displayAllApps();
        return;
    }
    
    let filtered = apps.filter(a => 
        a.name.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
    );
    
    if(!filtered.length) {
        container.innerHTML = '<div class="loading-skeleton">🔍 لا توجد نتائج مطابقة</div>';
        return;
    }
    container.innerHTML = filtered.map(app => createAppCard(app)).join('');
}

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

async function confirmDownload() {
    if(pendingDownloadApp) {
        showProfitableAd(async () => {
            pendingDownloadApp.downloads++;
            await saveApps();
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

async function submitRating() {
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
        
        await saveApps();
        await saveComments();
        showAlert('تم إضافة التقييم بنجاح', 'success');
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

(async function initAppsPage() {
    console.log('📱 تهيئة صفحة التطبيقات...');
    
    while (!jsonbinReady) {
        console.log('⏳ انتظار تحميل البيانات...');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ البيانات جاهزة، عرض التطبيقات');
    displayAllApps();
    
    let urlParams = new URLSearchParams(window.location.search);
    let searchTerm = urlParams.get('search');
    if(searchTerm && document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = searchTerm;
        searchApps();
    }
    
    let viewId = urlParams.get('view');
    if(viewId) {
        let app = apps.find(a => a.id === parseInt(viewId));
        if(app) {
            setTimeout(() => showRatingModal(app.id), 500);
        }
    }
})();

window.onclick = function(e) {
    let ratingModal = document.getElementById('ratingModal');
    let downloadModal = document.getElementById('downloadModal');
    let adModal = document.getElementById('adModal');
    
    if(e.target === ratingModal) closeModal();
    if(e.target === downloadModal) closeDownloadModal();
    if(e.target === adModal) closeAdModal();
};