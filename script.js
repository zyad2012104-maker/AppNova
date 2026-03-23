// ==================== البيانات الأساسية ====================
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', password: '123456', role: 'user', joinDate: '2024-01-01' },
    { id: 2, name: 'مدير النظام', email: 'admin@example.com', password: 'admin123', role: 'admin', joinDate: '2024-01-01' }
];

let apps = JSON.parse(localStorage.getItem('apps')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ==================== دوال النوافذ المنبثقة ====================
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'block';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'block';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
}

function closeAppDetailsModal() {
    const modal = document.getElementById('appDetailsModal');
    if (modal) modal.style.display = 'none';
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) modal.style.display = 'none';
}

function closeAdminPanel() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) modal.style.display = 'none';
}

function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// ==================== دوال تسجيل الدخول والخروج ====================
function login(email, password) {
    console.log('محاولة تسجيل الدخول:', email);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForUser();
        showNotification(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
        closeLoginModal();
        
        if (user.role === 'admin') {
            setTimeout(() => {
                showAdminPanel();
            }, 500);
        }
        return true;
    } else {
        showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
    }
}

function register(name, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        showNotification('كلمة المرور غير متطابقة', 'error');
        return false;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('البريد الإلكتروني مسجل بالفعل', 'error');
        return false;
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: 'user',
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateUIForUser();
    showNotification('تم إنشاء الحساب بنجاح!', 'success');
    closeRegisterModal();
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    closeAdminPanel();
}

// ==================== تحديث واجهة المستخدم (المفتاح الرئيسي) ====================
function updateUIForUser() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userNameSpan = document.getElementById('userName');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    
    console.log('تحديث واجهة المستخدم...');
    console.log('المستخدم الحالي:', currentUser);
    
    if (currentUser) {
        // إخفاء أزرار تسجيل الدخول
        if (authButtons) authButtons.style.display = 'none';
        
        // إظهار معلومات المستخدم
        if (userInfo) {
            userInfo.style.display = 'flex';
            if (userNameSpan) userNameSpan.textContent = currentUser.name;
        }
        
        // **الجزء الأهم: إظهار زر لوحة التحكم إذا كان المستخدم مديراً**
        if (adminPanelBtn) {
            if (currentUser.role === 'admin') {
                adminPanelBtn.style.display = 'block';
                console.log('✅ تم إظهار زر لوحة التحكم للمدير');
            } else {
                adminPanelBtn.style.display = 'none';
                console.log('المستخدم ليس مديراً، إخفاء زر لوحة التحكم');
            }
        } else {
            console.log('❌ لم يتم العثور على عنصر adminPanelBtn في الصفحة');
        }
    } else {
        // إظهار أزرار تسجيل الدخول
        if (authButtons) authButtons.style.display = 'flex';
        
        // إخفاء معلومات المستخدم
        if (userInfo) userInfo.style.display = 'none';
        
        // إخفاء زر لوحة التحكم
        if (adminPanelBtn) adminPanelBtn.style.display = 'none';
    }
    
    updateStats();
}

// ==================== إحصائيات الموقع ====================
function updateStats() {
    const appsCount = document.getElementById('appsCount');
    const usersCount = document.getElementById('usersCount');
    const downloadsCount = document.getElementById('downloadsCount');
    
    if (appsCount) appsCount.textContent = apps.length;
    if (usersCount) usersCount.textContent = users.filter(u => u.role !== 'admin').length;
    if (downloadsCount) downloadsCount.textContent = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
}

// ==================== لوحة تحكم المدير ====================
function showAdminPanel() {
    console.log('محاولة فتح لوحة التحكم');
    
    if (!currentUser) {
        showNotification('الرجاء تسجيل الدخول أولاً', 'warning');
        openLoginModal();
        return;
    }
    
    if (currentUser.role !== 'admin') {
        showNotification('غير مصرح لك بالدخول إلى لوحة التحكم', 'error');
        return;
    }
    
    const modal = document.getElementById('adminPanelModal');
    if (!modal) {
        console.error('لم يتم العثور على عنصر adminPanelModal');
        showNotification('حدث خطأ في فتح لوحة التحكم', 'error');
        return;
    }
    
    updateAdminPanelContent();
    modal.style.display = 'block';
    console.log('تم فتح لوحة التحكم بنجاح');
}

function updateAdminPanelContent() {
    const totalDownloads = apps.reduce((s, a) => s + (a.downloads || 0), 0);
    const totalComments = apps.reduce((s, a) => s + (a.comments?.length || 0), 0);
    const regularUsers = users.filter(u => u.role !== 'admin');
    
    const content = document.getElementById('adminPanelContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="admin-stats">
            <div class="admin-stat-card"><i class="fas fa-mobile-alt"></i><div><h3>${apps.length}</h3><p>التطبيقات</p></div></div>
            <div class="admin-stat-card"><i class="fas fa-users"></i><div><h3>${regularUsers.length}</h3><p>المستخدمين</p></div></div>
            <div class="admin-stat-card"><i class="fas fa-download"></i><div><h3>${totalDownloads}</h3><p>التحميلات</p></div></div>
            <div class="admin-stat-card"><i class="fas fa-comments"></i><div><h3>${totalComments}</h3><p>التعليقات</p></div></div>
        </div>
        <div class="admin-tabs">
            <button class="admin-tab-btn active" onclick="showAdminTab('apps')"><i class="fas fa-mobile-alt"></i> التطبيقات</button>
            <button class="admin-tab-btn" onclick="showAdminTab('users')"><i class="fas fa-users"></i> المستخدمين</button>
            <button class="admin-tab-btn" onclick="showAdminTab('comments')"><i class="fas fa-comments"></i> التعليقات</button>
        </div>
        <div id="adminTabContent">${renderAppsTable()}</div>
    `;
}

function showAdminTab(tab) {
    const btns = document.querySelectorAll('.admin-tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    
    const content = document.getElementById('adminTabContent');
    if (tab === 'apps') content.innerHTML = renderAppsTable();
    else if (tab === 'users') content.innerHTML = renderUsersTable();
    else content.innerHTML = renderCommentsTable();
}

function renderAppsTable() {
    if (!apps.length) return '<div class="admin-empty">لا توجد تطبيقات</div>';
    return `
        <div class="admin-table">
            <table>
                <thead><tr><th>#</th><th>الصورة</th><th>الاسم</th><th>المطور</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr></thead>
                <tbody>
                    ${apps.map(a => `
                        <tr>
                            <td>${a.id}</td>
                            <td><div class="admin-app-icon">${a.iconUrl ? `<img src="${a.iconUrl}" width="40" height="40">` : `<i class="fas ${a.icon}"></i>`}</div></td>
                            <td><strong>${a.name}</strong><br><small>${a.categoryName}</small></td>
                            <td>${a.developer}</td>
                            <td>${a.downloads}</td>
                            <td>${(a.rating||0).toFixed(1)} (${a.ratingCount})</td>
                            <td class="admin-actions">
                                <button class="admin-btn-edit" onclick="editApp(${a.id})"><i class="fas fa-edit"></i> تعديل</button>
                                <button class="admin-btn-danger" onclick="deleteAppAdmin(${a.id})"><i class="fas fa-trash"></i> حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderUsersTable() {
    const normalUsers = users.filter(u => u.role !== 'admin');
    if (!normalUsers.length) return '<div class="admin-empty">لا يوجد مستخدمين</div>';
    return `
        <div class="admin-table">
            <table>
                <thead><tr><th>#</th><th>الاسم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead>
                <tbody>
                    ${normalUsers.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td><strong>${u.name}</strong></td>
                            <td>${u.email}</td>
                            <td>${u.joinDate || 'غير محدد'}</td>
                            <td class="admin-actions">
                                <button class="admin-btn-edit" onclick="editUser(${u.id})"><i class="fas fa-edit"></i> تعديل</button>
                                <button class="admin-btn-danger" onclick="deleteUserAdmin(${u.id})"><i class="fas fa-trash"></i> حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderCommentsTable() {
    const allComments = [];
    apps.forEach(app => { if (app.comments) app.comments.forEach(c => allComments.push({...c, appId: app.id, appName: app.name})); });
    if (!allComments.length) return '<div class="admin-empty">لا توجد تعليقات</div>';
    return `
        <div class="admin-table">
            <table>
                <thead><tr><th>التطبيق</th><th>المستخدم</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                <tbody>
                    ${allComments.map(c => `
                        <tr>
                            <td><strong>${c.appName}</strong></td>
                            <td>${c.userName}</td>
                            <td>${c.text.substring(0, 50)}${c.text.length > 50 ? '...' : ''}</td>
                            <td>${c.rating || 0} <i class="fas fa-star" style="color:#ffc107;"></i></td>
                            <td>${c.date}</td>
                            <td class="admin-actions">
                                <button class="admin-btn-edit" onclick="editComment(${c.appId}, ${c.id})"><i class="fas fa-edit"></i> تعديل</button>
                                <button class="admin-btn-danger" onclick="deleteCommentAdmin(${c.appId}, ${c.id})"><i class="fas fa-trash"></i> حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ==================== دوال التعديل والحذف ====================
function editApp(appId) {
    showNotification('سيتم إضافة نافذة تعديل قريباً', 'info');
}

function editUser(userId) {
    showNotification('سيتم إضافة نافذة تعديل قريباً', 'info');
}

function editComment(appId, commentId) {
    showNotification('سيتم إضافة نافذة تعديل قريباً', 'info');
}

function deleteAppAdmin(id) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا التطبيق؟')) {
        apps = apps.filter(a => a.id !== id);
        localStorage.setItem('apps', JSON.stringify(apps));
        showNotification('✅ تم حذف التطبيق بنجاح', 'success');
        updateAdminPanelContent();
        displayFeaturedApps();
        updateStats();
    }
}

function deleteUserAdmin(id) {
    const user = users.find(u => u.id === id);
    if (user && user.role === 'admin') {
        showNotification('لا يمكن حذف المدير الرئيسي', 'error');
        return;
    }
    if (confirm(`⚠️ هل أنت متأكد من حذف المستخدم "${user?.name}"؟`)) {
        apps = apps.filter(a => a.developerId !== id);
        apps.forEach(a => {
            if (a.comments) a.comments = a.comments.filter(c => c.userId !== id);
        });
        users = users.filter(u => u.id !== id);
        localStorage.setItem('apps', JSON.stringify(apps));
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('✅ تم حذف المستخدم', 'success');
        updateAdminPanelContent();
        updateStats();
    }
}

function deleteCommentAdmin(appId, commentId) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا التعليق؟')) {
        const app = apps.find(a => a.id === appId);
        if (app && app.comments) {
            app.comments = app.comments.filter(c => c.id !== commentId);
            localStorage.setItem('apps', JSON.stringify(apps));
            showNotification('✅ تم حذف التعليق', 'success');
            updateAdminPanelContent();
        }
    }
}

// ==================== دوال عرض التطبيقات ====================
function createAppCard(app) {
    const priceClass = app.price === 'paid' ? 'paid' : 'free';
    const priceText = app.priceText || (app.price === 'paid' ? 'مدفوع' : 'مجاني');
    const ratingStars = generateRatingStars(app.rating, true);
    const iconHtml = app.iconUrl ? `<img src="${app.iconUrl}" alt="${app.name}">` : `<i class="fas ${app.icon}"></i>`;
    
    return `
        <div class="app-card">
            <div class="app-icon">
                ${iconHtml}
                <span class="app-platform"><i class="fas ${app.platform === 'android' ? 'fa-android' : 'fa-apple'}"></i> ${app.platformName}</span>
            </div>
            <div class="app-info">
                <h3>${app.name}</h3>
                <span class="app-category">${app.categoryName}</span>
                <p class="app-description">${app.description.substring(0, 80)}${app.description.length > 80 ? '...' : ''}</p>
                <div class="app-rating">${ratingStars}<span class="rating-count">(${app.ratingCount})</span></div>
                <div class="app-meta"><span class="app-size"><i class="fas fa-database"></i> ${app.size} MB</span><span class="app-price ${priceClass}">${priceText}</span></div>
                <div class="app-actions">
                    <button onclick="showDownloadModal(${app.id})" class="btn-download"><i class="fas fa-download"></i> تحميل (${app.downloads})</button>
                    <button onclick="showAppDetails(${app.id})" class="btn-details"><i class="fas fa-info-circle"></i> تفاصيل</button>
                </div>
            </div>
        </div>
    `;
}

function generateRatingStars(rating, isSmall = false) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    return `<div class="stars-container">${stars}</div>`;
}

function showAppDetails(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const modal = document.getElementById('appDetailsModal');
    document.getElementById('modalAppTitle').textContent = app.name;
    const iconHtml = app.iconUrl ? `<img src="${app.iconUrl}" alt="${app.name}">` : `<i class="fas ${app.icon}"></i>`;
    
    document.getElementById('appDetailsContent').innerHTML = `
        <div class="app-details">
            <div class="app-details-header">
                <div class="app-details-icon">${iconHtml}</div>
                <div class="app-details-info">
                    <h2>${app.name}</h2>
                    <p class="developer">المطور: ${app.developer}</p>
                    <div class="app-details-rating">${generateRatingStars(app.rating)}<span>(${app.ratingCount} تقييم)</span></div>
                    <div class="app-details-meta">
                        <span><i class="fas fa-tag"></i> ${app.categoryName}</span>
                        <span><i class="fas fa-mobile-alt"></i> ${app.platformName}</span>
                        <span><i class="fas fa-database"></i> ${app.size} MB</span>
                        <span><i class="fas fa-download"></i> ${app.downloads} تحميل</span>
                    </div>
                    <button onclick="showDownloadModal(${app.id})" class="btn-primary"><i class="fas fa-download"></i> تحميل التطبيق</button>
                </div>
            </div>
            <div class="app-details-description"><h3>عن التطبيق</h3><p>${app.description}</p></div>
        </div>
    `;
    modal.style.display = 'block';
}

function showDownloadModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    showNotification(`جاري تحميل ${app.name}...`, 'success');
    if (app.downloadLink) {
        window.open(app.downloadLink, '_blank');
        app.downloads++;
        localStorage.setItem('apps', JSON.stringify(apps));
        updateStats();
    }
}

function displayFeaturedApps() {
    const container = document.getElementById('featuredApps');
    if (container && apps.length > 0) {
        container.innerHTML = apps.slice(0, 3).map(createAppCard).join('');
    } else if (container) {
        container.innerHTML = '<div class="no-results">لا توجد تطبيقات حالياً</div>';
    }
}

// ==================== دوال مساعدة ====================
function getCategoryName(c) {
    const map = { educational: 'تعليمي', entertainment: 'ترفيهي', productivity: 'إنتاجية', social: 'تواصل اجتماعي', games: 'ألعاب', business: 'أعمال', health: 'صحة ولياقة' };
    return map[c] || c;
}

function getPlatformName(p) {
    const map = { android: 'أندرويد', ios: 'iOS', both: 'أندرويد و iOS' };
    return map[p] || p;
}

function getCategoryIcon(c) {
    const map = { educational: 'fa-graduation-cap', entertainment: 'fa-film', productivity: 'fa-chart-line', social: 'fa-users', games: 'fa-gamepad', business: 'fa-briefcase', health: 'fa-heartbeat' };
    return map[c] || 'fa-mobile-alt';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
    notification.style.cssText = `position:fixed;top:100px;left:50%;transform:translateX(-50%);background:${colors[type] || colors.success};color:white;padding:12px 24px;border-radius:50px;z-index:10001;display:flex;align-items:center;gap:10px;animation:slideDown 0.3s ease;`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function closeTopAd() {
    const ad = document.querySelector('.ad-top');
    if (ad) { ad.style.animation = 'slideUp 0.3s ease'; setTimeout(() => ad.style.display = 'none', 300); }
}

function closeBottomAd() {
    const ad = document.querySelector('.ad-bottom');
    if (ad) { ad.style.animation = 'slideUp 0.3s ease'; setTimeout(() => ad.style.display = 'none', 300); }
}

// ==================== إعداد النماذج ====================
function setupForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            register(name, email, password, confirmPassword);
        });
    }
}

function setupMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    if (btn && nav) {
        btn.addEventListener('click', () => nav.classList.toggle('active'));
    }
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل الصفحة - بدء التهيئة');
    updateUIForUser();
    displayFeaturedApps();
    setupForms();
    setupMobileMenu();
    
    window.onclick = (e) => {
        if (e.target === document.getElementById('loginModal')) closeLoginModal();
        if (e.target === document.getElementById('registerModal')) closeRegisterModal();
        if (e.target === document.getElementById('appDetailsModal')) closeAppDetailsModal();
        if (e.target === document.getElementById('adminPanelModal')) closeAdminPanel();
        if (e.target === document.getElementById('downloadModal')) closeDownloadModal();
    };
});

// جعل الدوال متاحة عالمياً
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.closeAppDetailsModal = closeAppDetailsModal;
window.closeDownloadModal = closeDownloadModal;
window.closeAdminPanel = closeAdminPanel;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.logout = logout;
window.showAdminPanel = showAdminPanel;
window.showAdminTab = showAdminTab;
window.deleteAppAdmin = deleteAppAdmin;
window.deleteUserAdmin = deleteUserAdmin;
window.deleteCommentAdmin = deleteCommentAdmin;
window.editApp = editApp;
window.editUser = editUser;
window.editComment = editComment;
window.showAppDetails = showAppDetails;
window.showDownloadModal = showDownloadModal;
window.closeTopAd = closeTopAd;
window.closeBottomAd = closeBottomAd;