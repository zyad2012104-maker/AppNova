// admin.js - لوحة الإدارة الكاملة

let currentAdminPanel = 'users';
let editingModeratorId = null;

function checkAdminAccess() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    const titleEl = document.getElementById('adminPageTitle');
    const descEl = document.getElementById('adminPageDesc');
    
    if (isAdmin(currentUser)) {
        if (titleEl) titleEl.innerHTML = '👑 لوحة التحكم - الإدارة الكاملة';
        if (descEl) descEl.innerHTML = 'إدارة المستخدمين والمشرفين والتطبيقات والتعليقات والتصنيفات والإعلانات';
    } else if (isModerator(currentUser)) {
        if (titleEl) titleEl.innerHTML = '🛡️ لوحة الإشراف';
        if (descEl) descEl.innerHTML = 'إدارة المحتوى حسب الصلاحيات الممنوحة لك';
    } else {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

function filterTabsByPermissions() {
    if (!currentUser) return;
    
    const moderatorsTab = document.getElementById('moderatorsTab');
    if (moderatorsTab && !isAdmin(currentUser)) {
        moderatorsTab.style.display = 'none';
    }
    
    const categoriesTab = document.querySelector('[data-panel="categories"]');
    if (categoriesTab && !hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        categoriesTab.style.display = 'none';
    }
    
    const addModeratorSection = document.getElementById('addModeratorSection');
    if (addModeratorSection && !isAdmin(currentUser)) {
        addModeratorSection.style.display = 'none';
    }
    
    const faviconTab = document.querySelector('[data-panel="favicon"]');
    if (faviconTab && !isAdmin(currentUser)) {
        faviconTab.style.display = 'none';
    }
    
    const adsTab = document.querySelector('[data-panel="ads"]');
    if (adsTab && !isAdmin(currentUser)) {
        adsTab.style.display = 'none';
    }
}

async function displayStats() {
    let statsContainer = document.getElementById('statsCards');
    if(!statsContainer) return;
    
    if (!hasPermission(currentUser, 'viewStats') && !isAdmin(currentUser)) {
        statsContainer.innerHTML = '<div class="stat-card" style="grid-column:span 4;"><p>⚠️ لا تملك صلاحية عرض الإحصائيات</p></div>';
        return;
    }
    
    let usersCount = users.filter(u => u.role === 'user').length;
    let moderatorsCount = users.filter(u => u.role === 'moderator').length;
    let totalDownloads = apps.reduce((sum, a) => sum + a.downloads, 0);
    
    statsContainer.innerHTML = `
        <div class="stat-card"><h3>${usersCount}</h3><p>👥 مستخدمين</p></div>
        <div class="stat-card"><h3>${moderatorsCount}</h3><p>🛡️ مشرفين</p></div>
        <div class="stat-card"><h3>${apps.length}</h3><p>📱 تطبيقات</p></div>
        <div class="stat-card"><h3>${comments.length}</h3><p>💬 تعليقات</p></div>
        <div class="stat-card"><h3>${totalDownloads}</h3><p>📥 إجمالي التحميلات</p></div>
        <div class="stat-card"><h3>${categories.length}</h3><p>🏷️ تصنيفات</p></div>
    `;
}

function showAdminPanel(panel) {
    if (panel === 'moderators' && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة المشرفين', 'error');
        return;
    }
    
    if (panel === 'categories' && !hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة التصنيفات', 'error');
        return;
    }
    
    if (panel === 'favicon' && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة أيقونة الموقع', 'error');
        return;
    }
    
    if (panel === 'ads' && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة الإعلانات', 'error');
        return;
    }
    
    currentAdminPanel = panel;
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`${panel}Panel`);
    if (targetPanel) targetPanel.classList.add('active');
    
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
    
    if(panel === 'users') displayUsers();
    else if(panel === 'moderators') displayModerators();
    else if(panel === 'apps') displayApps();
    else if(panel === 'comments') displayComments();
    else if(panel === 'categories') displayCategories();
    else if(panel === 'favicon') loadCurrentFavicon();
    else if(panel === 'ads') displayAdSettings();
}

function displayUsers() {
    let usersTable = document.getElementById('usersTable');
    if(!usersTable) return;
    
    let regularUsers = users.filter(u => u.role === 'user');
    
    if(regularUsers.length === 0) {
        usersTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد مستخدمين</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>';
    regularUsers.forEach((user, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${new Date(user.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'deleteUser') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteUser(${user.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    usersTable.innerHTML = html;
}

function displayModerators() {
    let moderatorsTable = document.getElementById('moderatorsTable');
    if(!moderatorsTable) return;
    
    if(!isAdmin(currentUser)) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">⚠️ فقط المدير يمكنه إدارة المشرفين</p>';
        return;
    }
    
    let moderatorsList = users.filter(u => u.role === 'moderator');
    
    if(moderatorsList.length === 0) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد مشرفين</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المشرف</th><th>البريد الإلكتروني</th><th>الصلاحيات</th><th>تاريخ التعيين</th><th>الإجراءات</th></tr></thead><tbody>';
    moderatorsList.forEach((mod, index) => {
        let perms = [];
        if(mod.permissions?.deleteUser) perms.push('حذف مستخدم');
        if(mod.permissions?.deleteApp) perms.push('حذف تطبيق');
        if(mod.permissions?.editApp) perms.push('تعديل تطبيق');
        if(mod.permissions?.deleteComment) perms.push('حذف تعليق');
        if(mod.permissions?.editComment) perms.push('تعديل تعليق');
        if(mod.permissions?.viewStats) perms.push('عرض إحصائيات');
        if(mod.permissions?.manageCategories) perms.push('إدارة تصنيفات');
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(mod.username)}</strong></td>
            <td>${escapeHtml(mod.email)}</td>
            <td><small>${perms.join(', ') || 'لا توجد'}</small></td>
            <td>${new Date(mod.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                <button class="btn-permissions" onclick="openPermissionsModal(${mod.id})">🔧 صلاحيات</button>
                <button class="btn-edit" onclick="editModerator(${mod.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteModerator(${mod.id})">🗑️ حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    moderatorsTable.innerHTML = html;
}

// إضافة مشرف جديد
document.getElementById('addModeratorForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if(!isAdmin(currentUser)) {
        showAlert('غير مصرح بإضافة مشرفين', 'error');
        return;
    }
    
    let username = document.getElementById('modUsername').value.trim();
    let email = document.getElementById('modEmail').value.trim();
    let password = document.getElementById('modPassword').value;
    
    if(!username || !email || !password) {
        showAlert('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if(users.find(u => u.email === email)) {
        showAlert('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    let newMod = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: 'moderator',
        permissions: {
            deleteUser: document.getElementById('permDeleteUser').checked,
            deleteApp: document.getElementById('permDeleteApp').checked,
            editApp: document.getElementById('permEditApp').checked,
            deleteComment: document.getElementById('permDeleteComment').checked,
            editComment: document.getElementById('permEditComment').checked,
            viewStats: document.getElementById('permViewStats').checked,
            manageCategories: document.getElementById('permManageCategories').checked
        },
        date: new Date().toISOString()
    };
    
    users.push(newMod);
    await saveUsers();
    
    showAlert('تم إضافة المشرف بنجاح', 'success');
    document.getElementById('addModeratorForm').reset();
    displayModerators();
    displayStats();
});

// باقي دوال admin.js كما هي (displayApps, displayComments, displayCategories, etc.)

// ========== تهيئة الصفحة ==========
(async function initAdminPage() {
    // انتظار تحميل البيانات
    if (!jsonbinReady) {
        await new Promise(resolve => {
            const checkReady = setInterval(() => {
                if (jsonbinReady) {
                    clearInterval(checkReady);
                    resolve();
                }
            }, 100);
        });
    }
    
    if (!checkAdminAccess()) return;
    
    filterTabsByPermissions();
    await displayStats();
    displayUsers();
    loadCurrentFavicon();
})();