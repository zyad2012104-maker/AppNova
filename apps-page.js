// apps-page.js - صفحة التطبيقات

function displayCategoriesBar() {
    const container = document.getElementById('categoriesBar');
    if (!container) return;
    
    let html = '<button class="category-btn active" onclick="filterApps(\'all\')">الكل</button>';
    categories.forEach(cat => {
        html += `<button class="category-btn" onclick="filterApps('${cat.key}')">${cat.icon} ${cat.name}</button>`;
    });
    container.innerHTML = html;
}

function displayAllApps() {
    let container = document.getElementById('allApps');
    if(!container) return;
    
    console.log(`📱 عرض ${apps.length} تطبيق`);
    
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

// الانتظار حتى يتم تحميل البيانات
let appsPageInterval = setInterval(() => {
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(appsPageInterval);
        displayCategoriesBar();
        displayAllApps();
        
        let urlParams = new URLSearchParams(window.location.search);
        let searchTerm = urlParams.get('search');
        if(searchTerm && document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = searchTerm;
            searchApps();
        }
    } else if (typeof apps !== 'undefined' && apps.length === 0) {
        clearInterval(appsPageInterval);
        displayCategoriesBar();
        displayAllApps();
    }
}, 100);