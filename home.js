// home.js - الصفحة الرئيسية المصححة

function displayAppsGrid(list, containerId) {
    let container = document.getElementById(containerId);
    if(!container) {
        console.log(`⚠️ العنصر ${containerId} غير موجود`);
        return;
    }
    
    if(!list || list.length === 0) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    
    console.log(`📱 عرض ${list.length} تطبيق في ${containerId}`);
    container.innerHTML = list.map(app => createAppCard(app)).join('');
}

function displayHomeContent() {
    console.log('🔄 عرض المحتوى الرئيسي...');
    console.log(`📱 عدد التطبيقات الكلي: ${apps.length}`);
    
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
    
    console.log('✅ تم عرض المحتوى الرئيسي بنجاح');
}

// انتظار تحميل البيانات
let homeInitInterval = setInterval(async () => {
    if (jsonbinReady) {
        clearInterval(homeInitInterval);
        console.log('✅ البيانات جاهزة، بدء عرض المحتوى');
        displayHomeContent();
    } else {
        console.log('⏳ انتظار تحميل البيانات...');
        // عرض رسالة انتظار
        if(document.getElementById('latestApps') && document.getElementById('latestApps').innerHTML === '') {
            document.getElementById('latestApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
            document.getElementById('mostDownloadedApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
            document.getElementById('topRatedApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
        }
    }
}, 500);