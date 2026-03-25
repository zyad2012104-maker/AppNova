// home.js - الصفحة الرئيسية

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
    
    console.log('✅ تم عرض التطبيقات');
}

// الانتظار حتى يتم تحميل البيانات
let homeInitInterval = setInterval(() => {
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(homeInitInterval);
        displayHomeContent();
    } else if (typeof apps !== 'undefined' && apps.length === 0) {
        clearInterval(homeInitInterval);
        displayHomeContent();
    }
}, 100);