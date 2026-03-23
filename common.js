// البيانات المخزنة
let apps = [];
let users = [];
let comments = [];
let currentUser = null;
let selectedRating = 0;
let currentAppId = null;
let pendingDownloadApp = null;

// تحميل البيانات
function loadData() {
    apps = JSON.parse(localStorage.getItem('apps') || '[]');
    users = JSON.parse(localStorage.getItem('users') || '[]');
    comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    // بيانات افتراضية للتطبيقات
    if(apps.length === 0) {
        apps = [
            {id:1, name:"تطبيق التواصل الاجتماعي", description:"تطبيق رائع للتواصل مع الأصدقاء والعائلة ومشاركة الصور", version:"2.0.1", category:"social", deviceType:"both", size:"45 MB", image:"https://via.placeholder.com/300x180/667eea/ffffff?text=Social+App", downloadLink:"#", downloads:1250, rating:4.5, ratings:[5,4,5,4,5], userId:1, userName:"المدير", date:"2024-01-01"},
            {id:2, name:"لعبة الألغاز", description:"لعبة ألغاز ممتعة وتحدي للعقل مع مستويات متعددة", version:"1.5.0", category:"games", deviceType:"android", size:"78 MB", image:"https://via.placeholder.com/300x180/764ba2/ffffff?text=Puzzle+Game", downloadLink:"#", downloads:890, rating:4.2, ratings:[4,5,4,4,4], userId:1, userName:"المدير", date:"2024-01-02"},
            {id:3, name:"تطبيق التعليم", description:"منصة تعليمية متكاملة للطلاب تحتوي على دروس واختبارات", version:"3.0.0", category:"education", deviceType:"both", size:"120 MB", image:"https://via.placeholder.com/300x180/48c6ef/ffffff?text=Education+App", downloadLink:"#", downloads:2340, rating:4.8, ratings:[5,5,4,5,5], userId:1, userName:"المدير", date:"2024-01-03"}
        ];
        saveApps();
    }
    
    // إضافة المستخدم admin إذا لم يوجد
    const adminExists = users.find(u => u.email === "admin");
    if(!adminExists) {
        users.push({
            id: 1,
            username: "المدير",
            email: "admin",
            password: "admin2012",
            role: "admin",
            date: new Date().toISOString()
        });
        saveUsers();
    }
    
    // تحديث البيانات في localStorage
    saveApps();
    saveUsers();
    saveComments();
}

function saveApps() { 
    localStorage.setItem('apps', JSON.stringify(apps)); 
}

function saveUsers() { 
    localStorage.setItem('users', JSON.stringify(users)); 
}

function saveComments() { 
    localStorage.setItem('comments', JSON.stringify(comments)); 
}

// التحقق من صلاحيات المستخدم
function hasPermission(user, permission) {
    if(!user) return false;
    if(user.role === 'admin') return true;
    if(user.role === 'moderator' && user.permissions && user.permissions[permission]) return true;
    return false;
}

// التحقق من أن المستخدم هو المدير فقط
function isAdmin(user) {
    return user && user.role === 'admin';
}

// عرض التنبيهات
function showAlert(message, type) {
    let div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.innerHTML = message;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.animation = 'slideOut 0.3s';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// تحديث شريط التنقل
function updateNavBar() {
    let loginNav = document.getElementById('loginNav');
    let adminNav = document.getElementById('adminNav');
    let userInfo = document.getElementById('userInfo');
    let uploadNav = document.getElementById('uploadNav');
    
    let storedUser = localStorage.getItem('currentUser');
    if(storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch(e) {
            currentUser = null;
        }
    }
    
    if(currentUser) {
        if(loginNav) loginNav.style.display = 'none';
        if(userInfo) {
            userInfo.style.display = 'block';
            let roleIcon = currentUser.role === 'admin' ? '👑' : (currentUser.role === 'moderator' ? '🛡️' : '👤');
            userInfo.innerHTML = `<span style="display:flex; align-items:center; gap:12px; background:#f0f4ff; padding:8px 16px; border-radius:50px;">${roleIcon} ${escapeHtml(currentUser.username)} <a href="#" onclick="logout()" style="color:#f44336; text-decoration:none;">🚪 خروج</a></span>`;
        }
        if(adminNav) adminNav.style.display = (currentUser.role === 'admin' || currentUser.role === 'moderator') ? 'block' : 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    } else {
        if(loginNav) loginNav.style.display = 'block';
        if(userInfo) userInfo.style.display = 'none';
        if(adminNav) adminNav.style.display = 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAlert('تم تسجيل الخروج بنجاح', 'info');
    window.location.href = 'index.html';
}

function getCategoryIcon(cat) {
    const icons = {games:'🎮', social:'💬', education:'📚', productivity:'💼', entertainment:'🎬'};
    return icons[cat] || cat;
}

function getCategoryName(cat) {
    const names = {games:'ألعاب', social:'تواصل اجتماعي', education:'تعليم', productivity:'إنتاجية', entertainment:'ترفيه'};
    return names[cat] || cat;
}

function escapeHtml(text) {
    if(!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

function createAppCard(app) {
    let fullStars = Math.floor(app.rating);
    let emptyStars = 5 - fullStars;
    let stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
    
    return `<div class="app-card" onclick="showRatingModal(${app.id})">
        <img src="${app.image}" class="app-card-image" onerror="this.src='https://via.placeholder.com/300x180/cccccc/ffffff?text=No+Image'">
        <div class="app-card-content">
            <div class="app-card-title">${escapeHtml(app.name)}</div>
            <div class="app-card-description">${escapeHtml(app.description.substring(0,80))}${app.description.length>80?'...':''}</div>
            <div class="app-card-meta">
                <span>📥 ${app.downloads}</span>
                <span>💾 ${app.size}</span>
                <span>📱 ${app.version}</span>
            </div>
            <div class="app-card-meta">
                <span class="app-card-rating">${stars} (${app.rating.toFixed(1)})</span>
                <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
            </div>
            <a href="#" class="app-card-download" onclick="event.stopPropagation(); requestDownload(${app.id})">📥 تحميل</a>
        </div>
    </div>`;
}

function showAdModal(callback) {
    let modal = document.getElementById('adModal');
    if(modal) {
        let content = document.getElementById('modalAdContent');
        if(content) content.innerHTML = '<script src="https://pl28941680.profitablecpmratenetwork.com/8b/d5/21/8bd5212efbe7fc123c0c78afb316cd4f.js"><\/script>';
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
            if(callback) callback();
        }, 3000);
    } else {
        if(callback) callback();
    }
}

function closeAdModal() {
    let modal = document.getElementById('adModal');
    if(modal) modal.style.display = 'none';
}

function subscribeNewsletter() {
    let email = document.querySelector('#newsletterEmail')?.value;
    if(email && email.includes('@')) {
        showAlert('تم الاشتراك في النشرة البريدية بنجاح', 'success');
        document.querySelector('#newsletterEmail').value = '';
    } else {
        showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
    }
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}

// تحميل المستخدم الحالي
let storedUser = localStorage.getItem('currentUser');
if(storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch(e) {
        currentUser = null;
    }
}

// تحميل البيانات
loadData();
updateNavBar();