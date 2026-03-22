// ==================== البيانات الأساسية ====================
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', password: '123456', role: 'user', joinDate: '2024-01-01' },
    { id: 2, name: 'مدير النظام', email: 'admin@example.com', password: 'admin123', role: 'admin', joinDate: '2024-01-01' }
];

let apps = JSON.parse(localStorage.getItem('apps')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ==================== دوال إدارة المستخدمين ====================
function login(email, password) {
    console.log('محاولة تسجيل الدخول:', email);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForUser();
        showNotification(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
        closeLoginModal();
        console.log('تم تسجيل الدخول، دور المستخدم:', user.role);
        console.log('المستخدم الحالي:', currentUser);
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
        
        // إظهار زر لوحة التحكم إذا كان المستخدم مديراً
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
        
        // التحقق من صفحة رفع التطبيق
        if (window.location.pathname.includes('upload.html')) {
            const uploadContainer = document.getElementById('uploadFormContainer');
            const loginMessage = document.getElementById('loginRequiredMessage');
            if (uploadContainer) uploadContainer.style.display = 'block';
            if (loginMessage) loginMessage.style.display = 'none';
        }
    } else {
        // إظهار أزرار تسجيل الدخول
        if (authButtons) authButtons.style.display = 'flex';
        
        // إخفاء معلومات المستخدم
        if (userInfo) userInfo.style.display = 'none';
        
        // إخفاء زر لوحة التحكم
        if (adminPanelBtn) adminPanelBtn.style.display = 'none';
        
        // التحقق من صفحة رفع التطبيق
        if (window.location.pathname.includes('upload.html')) {
            const uploadContainer = document.getElementById('uploadFormContainer');
            const loginMessage = document.getElementById('loginRequiredMessage');
            if (uploadContainer) uploadContainer.style.display = 'none';
            if (loginMessage) loginMessage.style.display = 'block';
        }
    }
    
    updateStats();
    console.log('تم تحديث واجهة المستخدم بنجاح');
}

// ==================== لوحة التحكم ====================
function showAdminPanel() {
    console.log('محاولة فتح لوحة التحكم');
    
    if (!currentUser) {
        showNotification('الرجاء تسجيل الدخول أولاً', 'warning');
        openLoginModal();
        return;
    }
    
    if (currentUser.role !== 'admin') {
        showNotification('غير مصرح لك بالدخول إلى لوحة التحكم', 'error');
        console.log('المستخدم ليس مديراً:', currentUser.role);
        return;
    }
    
    const modal = document.getElementById('adminPanelModal');
    if (!modal) {
        console.error('لم يتم العثور على عنصر adminPanelModal');
        showNotification('حدث خطأ في فتح لوحة التحكم', 'error');
        return;
    }
    
    console.log('جارٍ تحميل محتوى لوحة التحكم');
    updateAdminPanelContent();
    modal.style.display = 'block';
    console.log('تم فتح لوحة التحكم بنجاح');
}

function closeAdminPanel() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) modal.style.display = 'none';
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
    event.target.classList.add('active');
    
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
                <thead><tr><th>#</th><th>الصورة</th><th>الاسم</th><th>المطور</th><th>الإصدار</th><th>التحميلات</th><th>التقييم</th><th>تاريخ الرفع</th><th>الإجراءات</th></tr></thead>
                <tbody>
                    ${apps.map(a => `
                        <tr>
                            <td>${a.id}</td>
                            <td><div class="admin-app-icon">${a.iconUrl ? `<img src="${a.iconUrl}" width="40" height="40">` : `<i class="fas ${a.icon}"></i>`}</div></td>
                            <td><strong>${a.name}</strong><br><small>${a.categoryName}</small></td>
                            <td>${a.developer}<br><small>${a.developerEmail || ''}</small></td>
                            <td>${a.version || '1.0'}</td>
                            <td>${a.downloads}</td>
                            <td>${(a.rating||0).toFixed(1)} (${a.ratingCount})</td>
                            <td>${a.uploadDate}</td>
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
                <thead><tr><th>#</th><th>الاسم</th><th>البريد الإلكتروني</th><th>عدد التطبيقات</th><th>عدد التعليقات</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead>
                <tbody>
                    ${normalUsers.map(u => {
                        const userApps = apps.filter(a => a.developerId === u.id);
                        const userComments = apps.reduce((s, a) => s + (a.comments?.filter(c => c.userId === u.id).length || 0), 0);
                        return `
                        <tr>
                            <td>${u.id}</td>
                            <td><strong>${u.name}</strong></td>
                            <td>${u.email}</td>
                            <td>${userApps.length}</td>
                            <td>${userComments}</td>
                            <td>${u.joinDate || 'غير محدد'}</td>
                            <td class="admin-actions">
                                <button class="admin-btn-edit" onclick="editUser(${u.id})"><i class="fas fa-edit"></i> تعديل</button>
                                <button class="admin-btn-danger" onclick="deleteUserAdmin(${u.id})"><i class="fas fa-trash"></i> حذف</button>
                            </td>
                        </tr>
                    `}).join('')}
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
                <thead><tr><th>التطبيق</th><th>المستخدم</th><th>البريد</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                <tbody>
                    ${allComments.map(c => `
                        <tr>
                            <td><strong>${c.appName}</strong></td>
                            <td>${c.userName}</td>
                            <td>${c.userEmail || 'زائر'}</td>
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
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> تعديل التطبيق: ${app.name}</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <form id="editAppForm">
                <div class="form-group">
                    <label>اسم التطبيق</label>
                    <input type="text" id="editAppName" value="${app.name.replace(/"/g, '&quot;')}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>التصنيف</label>
                        <select id="editAppCategory">
                            <option value="educational" ${app.category === 'educational' ? 'selected' : ''}>تعليمي</option>
                            <option value="entertainment" ${app.category === 'entertainment' ? 'selected' : ''}>ترفيهي</option>
                            <option value="productivity" ${app.category === 'productivity' ? 'selected' : ''}>إنتاجية</option>
                            <option value="social" ${app.category === 'social' ? 'selected' : ''}>تواصل اجتماعي</option>
                            <option value="games" ${app.category === 'games' ? 'selected' : ''}>ألعاب</option>
                            <option value="business" ${app.category === 'business' ? 'selected' : ''}>أعمال</option>
                            <option value="health" ${app.category === 'health' ? 'selected' : ''}>صحة ولياقة</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>المنصة</label>
                        <select id="editAppPlatform">
                            <option value="android" ${app.platform === 'android' ? 'selected' : ''}>أندرويد</option>
                            <option value="ios" ${app.platform === 'ios' ? 'selected' : ''}>iOS</option>
                            <option value="both" ${app.platform === 'both' ? 'selected' : ''}>كلاهما</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>وصف التطبيق</label>
                    <textarea id="editAppDescription" rows="4" required>${app.description.replace(/</g, '&lt;')}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>الإصدار</label>
                        <input type="text" id="editAppVersion" value="${app.version || '1.0'}">
                    </div>
                    <div class="form-group">
                        <label>الحجم (MB)</label>
                        <input type="number" id="editAppSize" value="${app.size}" step="0.1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>السعر</label>
                        <select id="editAppPrice">
                            <option value="free" ${app.price === 'free' ? 'selected' : ''}>مجاني</option>
                            <option value="paid" ${app.price === 'paid' ? 'selected' : ''}>مدفوع</option>
                            <option value="freemium" ${app.price === 'freemium' ? 'selected' : ''}>مجاني + داخلي</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit"><i class="fas fa-save"></i> حفظ التغييرات</button>
                    <button type="button" class="btn-reset" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i> إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('editAppForm').addEventListener('submit', function(e) {
        e.preventDefault();
        app.name = document.getElementById('editAppName').value;
        app.category = document.getElementById('editAppCategory').value;
        app.categoryName = getCategoryName(app.category);
        app.platform = document.getElementById('editAppPlatform').value;
        app.platformName = getPlatformName(app.platform);
        app.description = document.getElementById('editAppDescription').value;
        app.version = document.getElementById('editAppVersion').value;
        app.size = document.getElementById('editAppSize').value;
        app.price = document.getElementById('editAppPrice').value;
        if (app.price === 'paid') app.priceText = 'مدفوع';
        if (app.price === 'freemium') app.priceText = 'مجاني + داخلي';
        
        localStorage.setItem('apps', JSON.stringify(apps));
        showNotification('تم تحديث التطبيق بنجاح', 'success');
        modal.remove();
        updateAdminPanelContent();
        displayAllApps();
        displayFeaturedApps();
        updateStats();
    });
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user || user.role === 'admin') return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> تعديل المستخدم: ${user.name}</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <form id="editUserForm">
                <div class="form-group">
                    <label>الاسم الكامل</label>
                    <input type="text" id="editUserName" value="${user.name.replace(/"/g, '&quot;')}" required>
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="editUserEmail" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</label>
                    <input type="password" id="editUserPassword" placeholder="********">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit"><i class="fas fa-save"></i> حفظ التغييرات</button>
                    <button type="button" class="btn-reset" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i> إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        user.name = document.getElementById('editUserName').value;
        user.email = document.getElementById('editUserEmail').value;
        const newPassword = document.getElementById('editUserPassword').value;
        if (newPassword) user.password = newPassword;
        
        apps.forEach(app => {
            if (app.developerId === user.id) {
                app.developer = user.name;
                app.developerEmail = user.email;
            }
            if (app.comments) {
                app.comments.forEach(comment => {
                    if (comment.userId === user.id) {
                        comment.userName = user.name;
                        comment.userEmail = user.email;
                    }
                });
            }
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('apps', JSON.stringify(apps));
        
        if (currentUser && currentUser.id === user.id) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUIForUser();
        }
        
        showNotification('تم تحديث المستخدم بنجاح', 'success');
        modal.remove();
        updateAdminPanelContent();
        if (document.getElementById('appsContainer')) displayAllApps();
        if (document.getElementById('featuredApps')) displayFeaturedApps();
        updateStats();
    });
}

function editComment(appId, commentId) {
    const app = apps.find(a => a.id === appId);
    const comment = app?.comments?.find(c => c.id === commentId);
    if (!comment) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> تعديل التعليق</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <form id="editCommentForm">
                <div class="form-group">
                    <label>التعليق</label>
                    <textarea id="editCommentText" rows="4" required>${comment.text.replace(/</g, '&lt;')}</textarea>
                </div>
                <div class="form-group">
                    <label>التقييم</label>
                    <div class="rating-stars-download" id="editCommentRating" style="margin-top: 10px;">
                        ${[1,2,3,4,5].map(star => `
                            <i class="fa${comment.rating >= star ? 's' : 'r'} fa-star" data-rating="${star}" onclick="selectEditRating(${star})"></i>
                        `).join('')}
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit"><i class="fas fa-save"></i> حفظ التغييرات</button>
                    <button type="button" class="btn-reset" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i> إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    window.currentEditRating = comment.rating;
    window.selectEditRating = function(rating) {
        window.currentEditRating = rating;
        const stars = document.querySelectorAll('#editCommentRating i');
        stars.forEach((star, index) => {
            star.className = index < rating ? 'fas fa-star' : 'far fa-star';
        });
    };
    
    document.getElementById('editCommentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        comment.text = document.getElementById('editCommentText').value;
        comment.rating = window.currentEditRating;
        
        let totalRating = 0;
        let ratedCount = 0;
        app.comments.forEach(c => { if (c.rating > 0) { totalRating += c.rating; ratedCount++; } });
        if (ratedCount > 0) {
            app.rating = totalRating / ratedCount;
            app.ratingCount = ratedCount;
        } else {
            app.rating = 0;
            app.ratingCount = 0;
        }
        
        localStorage.setItem('apps', JSON.stringify(apps));
        showNotification('تم تحديث التعليق بنجاح', 'success');
        modal.remove();
        updateAdminPanelContent();
        if (document.getElementById('appsContainer')) displayAllApps();
        if (document.getElementById('featuredApps')) displayFeaturedApps();
    });
}

function deleteAppAdmin(id) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا التطبيق؟\nسيتم حذف جميع بياناته وتعليقاته بشكل نهائي.')) {
        apps = apps.filter(a => a.id !== id);
        localStorage.setItem('apps', JSON.stringify(apps));
        showNotification('✅ تم حذف التطبيق بنجاح', 'success');
        updateAdminPanelContent();
        displayAllApps();
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
    if (confirm(`⚠️ هل أنت متأكد من حذف المستخدم "${user?.name}"؟\nسيتم حذف جميع تطبيقاته (${apps.filter(a => a.developerId === id).length}) وتعليقاته بشكل نهائي.`)) {
        apps = apps.filter(a => a.developerId !== id);
        apps.forEach(a => {
            if (a.comments) a.comments = a.comments.filter(c => c.userId !== id);
        });
        users = users.filter(u => u.id !== id);
        localStorage.setItem('apps', JSON.stringify(apps));
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('✅ تم حذف المستخدم وجميع بياناته', 'success');
        updateAdminPanelContent();
        displayAllApps();
        displayFeaturedApps();
        updateStats();
    }
}

function deleteCommentAdmin(appId, commentId) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا التعليق؟')) {
        const app = apps.find(a => a.id === appId);
        if (app && app.comments) {
            app.comments = app.comments.filter(c => c.id !== commentId);
            
            let totalRating = 0;
            let ratedCount = 0;
            app.comments.forEach(c => { if (c.rating > 0) { totalRating += c.rating; ratedCount++; } });
            if (ratedCount > 0) {
                app.rating = totalRating / ratedCount;
                app.ratingCount = ratedCount;
            } else {
                app.rating = 0;
                app.ratingCount = 0;
            }
            
            localStorage.setItem('apps', JSON.stringify(apps));
            showNotification('✅ تم حذف التعليق بنجاح', 'success');
            updateAdminPanelContent();
            if (document.getElementById('appsContainer')) displayAllApps();
            if (document.getElementById('featuredApps')) displayFeaturedApps();
        }
    }
}

// ==================== دوال رفع التطبيقات والتحميل ====================
function uploadApp(formData) {
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'warning');
        openLoginModal();
        return false;
    }
    
    const iconFile = formData.get('appIcon');
    const appFile = formData.get('appFile');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const iconBase64 = e.target.result;
        const newApp = {
            id: apps.length + 1,
            name: formData.get('appName'),
            category: formData.get('appCategory'),
            categoryName: getCategoryName(formData.get('appCategory')),
            platform: formData.get('appPlatform'),
            platformName: getPlatformName(formData.get('appPlatform')),
            description: formData.get('appDescription'),
            version: formData.get('appVersion') || '1.0',
            size: formData.get('appSize') || '0',
            price: formData.get('appPrice'),
            icon: getCategoryIcon(formData.get('appCategory')),
            iconUrl: iconBase64,
            downloadLink: URL.createObjectURL(appFile),
            developer: currentUser.name,
            developerId: currentUser.id,
            developerEmail: currentUser.email,
            rating: 0,
            ratingCount: 0,
            comments: [],
            downloads: 0,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        if (newApp.price === 'paid') newApp.priceText = 'مدفوع';
        if (newApp.price === 'freemium') newApp.priceText = 'مجاني + داخلي';
        apps.push(newApp);
        localStorage.setItem('apps', JSON.stringify(apps));
        showNotification('تم رفع التطبيق بنجاح!', 'success');
        setTimeout(() => window.location.href = 'apps.html', 1500);
    };
    if (iconFile && iconFile.size > 0) reader.readAsDataURL(iconFile);
    return true;
}

let downloadRating = 0;

function showDownloadModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const modal = document.getElementById('downloadModal');
    const modalContent = document.getElementById('downloadModalContent');
    modalContent.innerHTML = `
        <div class="download-modal">
            <div class="download-app-info">
                <div class="download-app-icon">${app.iconUrl ? `<img src="${app.iconUrl}" alt="${app.name}">` : `<i class="fas ${app.icon}"></i>`}</div>
                <div class="download-app-details"><h3>${app.name}</h3><p>المطور: ${app.developer}</p><p>الحجم: ${app.size} MB</p><p>الإصدار: ${app.version || '1.0'}</p></div>
            </div>
            <div class="download-rating-section"><h4>قيم التطبيق قبل التحميل</h4><div class="rating-stars-download" id="downloadRatingStars">${[1,2,3,4,5].map(star => `<i class="far fa-star" onclick="selectDownloadRating(${star})"></i>`).join('')}</div></div>
            <div class="download-comment-section"><h4>أضف تعليقاً (اختياري)</h4><textarea id="downloadComment" rows="3" placeholder="اكتب تعليقك هنا..."></textarea></div>
            <div class="download-actions"><button onclick="confirmDownload(${app.id})" class="btn-primary"><i class="fas fa-download"></i> تأكيد التحميل</button><button onclick="closeDownloadModal()" class="btn-secondary"><i class="fas fa-times"></i> إلغاء</button></div>
        </div>
    `;
    modal.style.display = 'block';
}

function selectDownloadRating(rating) {
    downloadRating = rating;
    const stars = document.querySelectorAll('#downloadRatingStars i');
    stars.forEach((star, index) => { star.className = index < rating ? 'fas fa-star' : 'far fa-star'; });
}

function confirmDownload(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    if (downloadRating > 0) addRating(appId, downloadRating);
    const commentText = document.getElementById('downloadComment')?.value;
    if (commentText && commentText.trim()) addComment(appId, commentText, downloadRating);
    app.downloads++;
    localStorage.setItem('apps', JSON.stringify(apps));
    if (app.downloadLink) { window.open(app.downloadLink, '_blank'); showNotification(`جاري تحميل ${app.name}...`, 'success'); }
    else showNotification('رابط التحميل غير متوفر', 'error');
    downloadRating = 0;
    closeDownloadModal();
    updateStats();
    displayAllApps();
    displayFeaturedApps();
}

function closeDownloadModal() { const modal = document.getElementById('downloadModal'); if (modal) modal.style.display = 'none'; downloadRating = 0; }

function addRating(appId, rating) {
    const app = apps.find(a => a.id === appId);
    if (app) {
        const totalRating = (app.rating * app.ratingCount) + rating;
        app.ratingCount++;
        app.rating = totalRating / app.ratingCount;
        localStorage.setItem('apps', JSON.stringify(apps));
        return true;
    }
    return false;
}

function addComment(appId, commentText, rating) {
    const app = apps.find(a => a.id === appId);
    if (app && commentText.trim()) {
        const comment = { id: Date.now(), userId: currentUser ? currentUser.id : 0, userName: currentUser ? currentUser.name : 'زائر', userEmail: currentUser ? currentUser.email : '', rating: rating || 0, text: commentText, date: new Date().toISOString().split('T')[0] };
        if (!app.comments) app.comments = [];
        app.comments.unshift(comment);
        localStorage.setItem('apps', JSON.stringify(apps));
        return true;
    }
    return false;
}

// ==================== دوال عرض التطبيقات ====================
function createAppCard(app) {
    const priceClass = app.price === 'paid' ? 'paid' : 'free';
    const priceText = app.priceText || (app.price === 'paid' ? 'مدفوع' : 'مجاني');
    const ratingStars = generateRatingStars(app.rating, true);
    const iconHtml = app.iconUrl ? `<img src="${app.iconUrl}" alt="${app.name}">` : `<i class="fas ${app.icon}"></i>`;
    return `
        <div class="app-card">
            <div class="app-icon">${iconHtml}<span class="app-platform"><i class="fas ${app.platform === 'android' ? 'fa-android' : 'fa-apple'}"></i> ${app.platformName}</span></div>
            <div class="app-info">
                <h3>${app.name}</h3><span class="app-category">${app.categoryName}</span>
                <p class="app-description">${app.description.substring(0, 80)}${app.description.length > 80 ? '...' : ''}</p>
                <div class="app-rating">${ratingStars}<span class="rating-count">(${app.ratingCount})</span></div>
                <div class="app-meta"><span class="app-size"><i class="fas fa-database"></i> ${app.size} MB</span><span class="app-price ${priceClass}">${priceText}</span></div>
                <div class="app-actions"><button onclick="showDownloadModal(${app.id})" class="btn-download"><i class="fas fa-download"></i> تحميل (${app.downloads})</button><button onclick="showAppDetails(${app.id})" class="btn-details"><i class="fas fa-info-circle"></i> تفاصيل</button></div>
            </div>
        </div>
    `;
}

function generateRatingStars(rating, isSmall = false) {
    const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
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
            <div class="app-details-header"><div class="app-details-icon">${iconHtml}</div>
            <div class="app-details-info"><h2>${app.name}</h2><p class="developer">المطور: ${app.developer} (${app.developerEmail})</p><p>الإصدار: ${app.version || '1.0'}</p>
            <div class="app-details-rating">${generateRatingStars(app.rating)}<span>(${app.ratingCount} تقييم)</span></div>
            <div class="app-details-meta"><span><i class="fas fa-tag"></i> ${app.categoryName}</span><span><i class="fas fa-mobile-alt"></i> ${app.platformName}</span><span><i class="fas fa-database"></i> ${app.size} MB</span><span><i class="fas fa-dollar-sign"></i> ${app.price === 'free' ? 'مجاني' : (app.priceText || 'مدفوع')}</span><span><i class="fas fa-download"></i> ${app.downloads} تحميل</span><span><i class="fas fa-calendar"></i> ${app.uploadDate}</span></div>
            <button onclick="showDownloadModal(${app.id})" class="btn-primary" style="margin-top:15px;"><i class="fas fa-download"></i> تحميل التطبيق</button></div></div>
            <div class="app-details-description"><h3>عن التطبيق</h3><p>${app.description}</p></div>
            <div class="rating-section"><h3><i class="fas fa-star"></i> قيم التطبيق</h3><div class="rating-stars">${[1,2,3,4,5].map(s => `<i class="far fa-star" onclick="addRatingAndRefresh(${app.id}, ${s})"></i>`).join('')}</div></div>
            <div class="comment-section"><h3><i class="fas fa-comments"></i> التعليقات (${app.comments?.length || 0})</h3>
            <div class="comment-list">${app.comments?.length ? app.comments.map(c => `<div class="comment-item"><div class="comment-header"><span class="comment-user"><i class="fas fa-user-circle"></i> ${c.userName} (${c.userEmail || 'زائر'})</span><span class="comment-date">${c.date}</span>${currentUser?.role === 'admin' ? `<button class="admin-delete-comment" onclick="deleteCommentAdmin(${app.id}, ${c.id})"><i class="fas fa-trash"></i> حذف</button>` : ''}</div>${c.rating ? `<div class="comment-rating">${generateRatingStars(c.rating)}</div>` : ''}<p class="comment-text">${c.text}</p></div>`).join('') : '<p style="text-align:center;color:var(--gray-color);">لا توجد تعليقات بعد</p>'}</div>
            <div class="comment-form"><h4>أضف تعليقاً</h4><div class="rating-input" id="commentRatingInput">${[1,2,3,4,5].map(s => `<i class="far fa-star" onclick="selectRating(${s})"></i>`).join('')}</div><textarea id="commentText" rows="3" placeholder="اكتب تعليقك هنا..."></textarea><button onclick="submitComment(${app.id})" class="btn-submit" style="width:auto;"><i class="fas fa-paper-plane"></i> إرسال</button></div></div>
        </div>
    `;
    modal.style.display = 'block';
}

let selectedRating = 0;
function selectRating(r) { selectedRating = r; document.querySelectorAll('#commentRatingInput i').forEach((star, i) => star.className = i < r ? 'fas fa-star' : 'far fa-star'); }
function addRatingAndRefresh(id, r) { addRating(id, r); showAppDetails(id); }
function submitComment(id) { if (addComment(id, document.getElementById('commentText')?.value, selectedRating)) { selectedRating = 0; document.getElementById('commentText').value = ''; showAppDetails(id); } }

// ==================== دوال العرض والبحث ====================
let currentApps = [...apps];
let currentPage = 1;
const perPage = 6;

function displayAllApps() {
    const container = document.getElementById('appsContainer');
    if (!container) return;
    const toShow = currentApps.slice(0, currentPage * perPage);
    if (!toShow.length) { container.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>لا توجد تطبيقات</h3></div>'; const btn = document.getElementById('loadMoreBtn'); if (btn) btn.style.display = 'none'; return; }
    container.innerHTML = toShow.map(createAppCard).join('');
    const btn = document.getElementById('loadMoreBtn');
    if (btn) btn.style.display = currentApps.length <= currentPage * perPage ? 'none' : 'inline-flex';
}

function displayFeaturedApps() { const container = document.getElementById('featuredApps'); if(container) container.innerHTML = apps.slice(0,3).map(createAppCard).join(''); }
function filterApps() { const s = document.getElementById('searchApps')?.value.toLowerCase()||'', c = document.getElementById('filterCategory')?.value||'all', p = document.getElementById('filterPlatform')?.value||'all'; currentApps = apps.filter(a=>(a.name.toLowerCase().includes(s)||a.description.toLowerCase().includes(s))&&(c==='all'||a.category===c)&&(p==='all'||a.platform===p)); currentPage=1; displayAllApps(); }
function updateStats() { document.getElementById('appsCount') && (document.getElementById('appsCount').textContent = apps.length); document.getElementById('usersCount') && (document.getElementById('usersCount').textContent = users.filter(u=>u.role!=='admin').length); document.getElementById('downloadsCount') && (document.getElementById('downloadsCount').textContent = apps.reduce((s,a)=>s+(a.downloads||0),0)); }

// ==================== دوال مساعدة ====================
function getCategoryName(c) { const map={educational:'تعليمي',entertainment:'ترفيهي',productivity:'إنتاجية',social:'تواصل اجتماعي',games:'ألعاب',business:'أعمال',health:'صحة ولياقة'}; return map[c]||c; }
function getPlatformName(p) { const map={android:'أندرويد',ios:'iOS',both:'أندرويد و iOS'}; return map[p]||p; }
function getCategoryIcon(c) { const map={educational:'fa-graduation-cap',entertainment:'fa-film',productivity:'fa-chart-line',social:'fa-users',games:'fa-gamepad',business:'fa-briefcase',health:'fa-heartbeat'}; return map[c]||'fa-mobile-alt'; }

// ==================== دوال النوافذ المنبثقة ====================
function openLoginModal() { document.getElementById('loginModal').style.display='block'; }
function closeLoginModal() { document.getElementById('loginModal').style.display='none'; }
function openRegisterModal() { document.getElementById('registerModal').style.display='block'; }
function closeRegisterModal() { document.getElementById('registerModal').style.display='none'; }
function closeAppDetailsModal() { document.getElementById('appDetailsModal').style.display='none'; }
function switchToRegister() { closeLoginModal(); openRegisterModal(); }
function switchToLogin() { closeRegisterModal(); openLoginModal(); }

// ==================== دوال الإعداد ====================
function setupForms() {
    document.getElementById('loginForm')?.addEventListener('submit', e=>{ e.preventDefault(); login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value); });
    document.getElementById('registerForm')?.addEventListener('submit', e=>{ e.preventDefault(); register(document.getElementById('regName').value, document.getElementById('regEmail').value, document.getElementById('regPassword').value, document.getElementById('regConfirmPassword').value); });
    document.getElementById('appUploadForm')?.addEventListener('submit', e=>{ e.preventDefault(); if(!currentUser){showNotification('يجب تسجيل الدخول','warning');openLoginModal();return;} if(!e.target.checkValidity()){e.target.classList.add('was-validated');return;} uploadApp(new FormData(e.target)); });
    document.getElementById('contactForm')?.addEventListener('submit', e=>{ e.preventDefault(); showNotification('تم إرسال رسالتك','success'); e.target.reset(); });
}

function setupFileInputs() { document.querySelectorAll('.file-input-wrapper input[type="file"]').forEach(i=>i.addEventListener('change',function(){const n=this.files.length?(this.files.length>1?`${this.files.length} ملفات`:this.files[0].name):'لم يتم اختيار ملف';this.parentElement.querySelector('.file-name').textContent=n;})); }
function setupMobileMenu() { const btn=document.querySelector('.mobile-menu-btn'),nav=document.querySelector('nav'); if(btn&&nav) btn.addEventListener('click',()=>nav.classList.toggle('active')); document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('active'))); }
function showNotification(m,t='success') { const n=document.createElement('div'); n.className='notification'; const c={success:'#10b981',error:'#ef4444',warning:'#f59e0b'}; n.innerHTML=`<i class="fas ${t==='success'?'fa-check-circle':t==='error'?'fa-exclamation-circle':'fa-exclamation-triangle'}"></i><span>${m}</span>`; n.style.cssText=`position:fixed;top:100px;left:50%;transform:translateX(-50%);background:${c[t]||c.success};color:white;padding:12px 24px;border-radius:50px;z-index:10001;display:flex;align-items:center;gap:10px;animation:slideDown 0.3s ease;`; document.body.appendChild(n); setTimeout(()=>{n.style.animation='slideUp 0.3s ease';setTimeout(()=>n.remove(),300);},3000); }
function closeTopAd() { const ad=document.querySelector('.ad-top'); if(ad){ad.style.animation='slideUp 0.3s ease';setTimeout(()=>ad.style.display='none',300);} }
function closeBottomAd() { const ad=document.querySelector('.ad-bottom'); if(ad){ad.style.animation='slideUp 0.3s ease';setTimeout(()=>ad.style.display='none',300);} }

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل الصفحة، تهيئة النظام...');
    updateUIForUser();
    displayFeaturedApps();
    if(document.getElementById('appsContainer')) displayAllApps();
    setupFileInputs();
    setupMobileMenu();
    setupForms();
    document.getElementById('searchApps')?.addEventListener('input', filterApps);
    document.getElementById('filterCategory')?.addEventListener('change', filterApps);
    document.getElementById('filterPlatform')?.addEventListener('change', filterApps);
    document.getElementById('loadMoreBtn')?.addEventListener('click', () => { currentPage++; displayAllApps(); });
    window.onclick = e => { if(e.target===document.getElementById('loginModal')) closeLoginModal(); if(e.target===document.getElementById('registerModal')) closeRegisterModal(); if(e.target===document.getElementById('appDetailsModal')) closeAppDetailsModal(); if(e.target===document.getElementById('adminPanelModal')) closeAdminPanel(); if(e.target===document.getElementById('downloadModal')) closeDownloadModal(); };
});

// جعل الدوال عالمية
window.openLoginModal=openLoginModal; window.closeLoginModal=closeLoginModal; window.openRegisterModal=openRegisterModal; window.closeRegisterModal=closeRegisterModal; window.closeAppDetailsModal=closeAppDetailsModal; window.switchToRegister=switchToRegister; window.switchToLogin=switchToLogin; window.logout=logout;
window.showAdminPanel=showAdminPanel; window.closeAdminPanel=closeAdminPanel; window.showAdminTab=showAdminTab;
window.editApp=editApp; window.editUser=editUser; window.editComment=editComment;
window.deleteAppAdmin=deleteAppAdmin; window.deleteUserAdmin=deleteUserAdmin; window.deleteCommentAdmin=deleteCommentAdmin;
window.showAppDetails=showAppDetails; window.showDownloadModal=showDownloadModal; window.selectDownloadRating=selectDownloadRating; window.confirmDownload=confirmDownload; window.closeDownloadModal=closeDownloadModal;
window.addRatingAndRefresh=addRatingAndRefresh; window.selectRating=selectRating; window.submitComment=submitComment;
window.closeTopAd=closeTopAd; window.closeBottomAd=closeBottomAd;