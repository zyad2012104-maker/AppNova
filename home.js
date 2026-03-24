// home.js - الصفحة الرئيسية مع JSONBin.io

function displayAppsGrid(list, containerId) {
    let container = document.getElementById(containerId);
    if(!container) return;
    
    if(!list || list.length === 0) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    
    container.innerHTML = list.map(app => createAppCard(app)).join('');
}

function displayHomeContent() {
    console.log('🔄 عرض المحتوى الرئيسي...');
    console.log(`📱 عدد التطبيقات: ${apps.length}`);
    
    if(!apps || apps.length === 0) {
        document.getElementById('latestApps').innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        document.getElementById('mostDownloadedApps').innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        document.getElementById('topRatedApps').innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    
    let latestApps = [...apps].reverse().slice(0, 6);
    let mostDownloaded = [...apps].sort((a,b) => b.downloads - a.downloads).slice(0, 6);
    let topRated = [...apps].sort((a,b) => b.rating - a.rating).slice(0, 6);
    
    displayAppsGrid(latestApps, 'latestApps');
    displayAppsGrid(mostDownloaded, 'mostDownloadedApps');
    displayAppsGrid(topRated, 'topRatedApps');
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
            displayHomeContent();
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
    
    let stars = document.querySelectorAll('.star');
    stars.forEach(s => s.classList.remove('active'));
    
    let commentText = document.getElementById('commentText');
    if(commentText) commentText.value = '';
    
    document.getElementById('ratingModal').style.display = 'block';
}

function setRating(rating) {
    selectedRating = rating;
    let stars = document.querySelectorAll('.star');
    stars.forEach((s, i) => {
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
        displayHomeContent();
        
        if(pendingDownloadApp && pendingDownloadApp.id === currentAppId) {
            showDownloadConfirm(pendingDownloadApp);
        }
    }
}

function closeModal() {
    document.getElementById('ratingModal').style.display = 'none';
}

(async function initHome() {
    console.log('🏠 تهيئة الصفحة الرئيسية...');
    
    while (!jsonbinReady) {
        console.log('⏳ انتظار تحميل البيانات...');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ البيانات جاهزة، عرض المحتوى');
    displayHomeContent();
})();

window.onclick = function(e) {
    let ratingModal = document.getElementById('ratingModal');
    let downloadModal = document.getElementById('downloadModal');
    let adModal = document.getElementById('adModal');
    
    if(e.target === ratingModal) closeModal();
    if(e.target === downloadModal) closeDownloadModal();
    if(e.target === adModal) closeAdModal();
};