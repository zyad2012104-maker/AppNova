// البيانات المشتركة
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
    
    if(!apps.length) {
        apps = [
            {id:1, name:"تطبيق التواصل", description:"تطبيق تواصل اجتماعي مميز", version:"2.0", category:"social", size:"45 MB", image:"https://via.placeholder.com/300x180/667eea/ffffff?text=Social", downloadLink:"#", downloads:1250, rating:4.5, ratings:[5,4,5,4,5]},
            {id:2, name:"لعبة الألغاز", description:"لعبة ألغاز ممتعة", version:"1.5", category:"games", size:"78 MB", image:"https://via.placeholder.com/300x180/764ba2/ffffff?text=Game", downloadLink:"#", downloads:890, rating:4.2, ratings:[4,5,4,4,4]},
            {id:3, name:"تطبيق التعليم", description:"منصة تعليمية متكاملة", version:"3.0", category:"education", size:"120 MB", image:"https://via.placeholder.com/300x180/48c6ef/ffffff?text=Education", downloadLink:"#", downloads:2340, rating:4.8, ratings:[5,5,4,5,5]}
        ];
        saveApps();
    }
    if(!users.find(u=>u.role==='admin')) users.push({id:1, username:"المدير", email:"admin", password:"admin2012", role:"admin"});
    saveUsers();
}

function saveApps() { localStorage.setItem('apps', JSON.stringify(apps)); }
function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
function saveComments() { localStorage.setItem('comments', JSON.stringify(comments)); }

function showAlert(message, type) {
    let div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.innerHTML = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function updateNavBar() {
    let loginNav = document.getElementById('loginNav');
    let adminNav = document.getElementById('adminNav');
    let userInfo = document.getElementById('userInfo');
    let uploadNav = document.getElementById('uploadNav');
    
    let storedUser = localStorage.getItem('currentUser');
    if(storedUser) currentUser = JSON.parse(storedUser);
    
    if(currentUser) {
        if(loginNav) loginNav.style.display = 'none';
        if(userInfo) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `<span style="display:flex; align-items:center; gap:12px; background:#f0f4ff; padding:8px 16px; border-radius:50px;">👤 ${currentUser.username} <a href="#" onclick="logout()" style="color:#f44336;">🚪 خروج</a></span>`;
        }
        if(adminNav) adminNav.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    } else {
        if(loginNav) loginNav.style.display = 'block';
        if(userInfo) userInfo.style.display = 'none';
        if(adminNav) adminNav.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAlert('تم تسجيل الخروج', 'info');
    window.location.href = 'index.html';
}

function getCategoryIcon(cat) {
    const icons = {games:'🎮', social:'💬', education:'📚', productivity:'💼', entertainment:'🎬'};
    return icons[cat] || cat;
}

function createAppCard(app) {
    let stars = '★'.repeat(Math.floor(app.rating)) + '☆'.repeat(5-Math.floor(app.rating));
    return `<div class="app-card" onclick="showRatingModal(${app.id})">
        <img src="${app.image}" class="app-card-image" onerror="this.src='https://via.placeholder.com/300x180/cccccc/ffffff?text=No+Image'">
        <div class="app-card-content">
            <div class="app-card-title">${app.name}</div>
            <div class="app-card-description">${app.description.substring(0,80)}${app.description.length>80?'...':''}</div>
            <div class="app-card-meta"><span>📥 ${app.downloads}</span><span>💾 ${app.size}</span></div>
            <div class="app-card-meta"><span class="app-card-rating">${stars} (${app.rating.toFixed(1)})</span><span>${getCategoryIcon(app.category)}</span></div>
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
        showAlert('تم الاشتراك في النشرة البريدية', 'success');
        document.querySelector('#newsletterEmail').value = '';
    } else {
        showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
    }
}

// تحميل المستخدم الحالي
let storedUser = localStorage.getItem('currentUser');
if(storedUser) currentUser = JSON.parse(storedUser);

// تحميل البيانات
loadData();
updateNavBar();