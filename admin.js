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

function searchUsers() {
    let term = document.getElementById('searchUsers')?.value.toLowerCase();
    let usersTable = document.getElementById('usersTable');
    if(!usersTable) return;
    
    let regularUsers = users.filter(u => u.role === 'user');
    if(!term) {
        displayUsers();
        return;
    }
    
    let filtered = regularUsers.filter(u => u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    
    if(filtered.length === 0) {
        usersTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((user, index) => {
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

async function deleteUser(id) {
    if (!hasPermission(currentUser, 'deleteUser') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بحذف المستخدمين', 'error');
        return;
    }
    
    if(confirm('⚠️ تأكيد حذف هذا المستخدم؟')) {
        users = users.filter(u => u.id !== id);
        await saveUsers();
        displayUsers();
        displayStats();
        showAlert('تم حذف المستخدم', 'success');
    }
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

function searchModerators() {
    let term = document.getElementById('searchModerators')?.value.toLowerCase();
    let moderatorsTable = document.getElementById('moderatorsTable');
    if(!moderatorsTable) return;
    
    if(!isAdmin(currentUser)) return;
    
    let moderatorsList = users.filter(u => u.role === 'moderator');
    if(!term) {
        displayModerators();
        return;
    }
    
    let filtered = moderatorsList.filter(m => m.username.toLowerCase().includes(term) || m.email.toLowerCase().includes(term));
    
    if(filtered.length === 0) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead> <tr><th>#</th><th>اسم المشرف</th><th>البريد الإلكتروني</th><th>الصلاحيات</th><th>تاريخ التعيين</th><th>الإجراءات</th></tr> </thead><tbody>';
    filtered.forEach((mod, index) => {
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

function openPermissionsModal(modId) {
    let mod = users.find(u => u.id === modId && u.role === 'moderator');
    if(!mod) return;
    
    editingModeratorId = modId;
    
    let perms = mod.permissions || {};
    
    let html = `
        <div class="permissions-list">
            <div class="permission-item">
                <input type="checkbox" id="permDeleteUser" ${perms.deleteUser ? 'checked' : ''}>
                <label for="permDeleteUser">🗑️ حذف المستخدمين</label>
            </div>
            <div class="permission-item">
                <input type="checkbox" id="permDeleteApp" ${perms.deleteApp ? 'checked' : ''}>
                <label for="permDeleteApp">📱 حذف التطبيقات</label>
            </div>
            <div class="permission-item">
                <input type="checkbox" id="permEditApp" ${perms.editApp ? 'checked' : ''}>
                <label for="permEditApp">✏️ تعديل التطبيقات</label>
            </div>
            <div class="permission-item">
                <input type="checkbox" id="permDeleteComment" ${perms.deleteComment ? 'checked' : ''}>
                <label for="permDeleteComment">💬 حذف التعليقات</label>
            </div>
            <div class="permission-item">
                <input type="checkbox" id="permEditComment" ${perms.editComment ? 'checked' : ''}>
                <label for="permEditComment">✏️ تعديل التعليقات</label>
            </div>
            <div class="permission-item">
                <input type="checkbox" id="permViewStats" ${perms.viewStats ? 'checked' : ''}>
                <label for="permViewStats">📊 عرض الإحصائيات</label>
            </div>
            <div class="permission-item">
                <input type="checkbox" id="permManageCategories" ${perms.manageCategories ? 'checked' : ''}>
                <label for="permManageCategories">🏷️ إدارة التصنيفات</label>
            </div>
        </div>
    `;
    
    document.getElementById('permissionsModalContent').innerHTML = html;
    document.getElementById('permissionsModal').style.display = 'block';
}

function closePermissionsModal() {
    document.getElementById('permissionsModal').style.display = 'none';
    editingModeratorId = null;
}

async function savePermissionsChanges() {
    if(!editingModeratorId) return;
    
    let modIndex = users.findIndex(u => u.id === editingModeratorId && u.role === 'moderator');
    if(modIndex === -1) return;
    
    users[modIndex].permissions = {
        deleteUser: document.getElementById('permDeleteUser')?.checked || false,
        deleteApp: document.getElementById('permDeleteApp')?.checked || false,
        editApp: document.getElementById('permEditApp')?.checked || false,
        deleteComment: document.getElementById('permDeleteComment')?.checked || false,
        editComment: document.getElementById('permEditComment')?.checked || false,
        viewStats: document.getElementById('permViewStats')?.checked || false,
        manageCategories: document.getElementById('permManageCategories')?.checked || false
    };
    
    await saveUsers();
    closePermissionsModal();
    displayModerators();
    showAlert('تم تحديث صلاحيات المشرف بنجاح', 'success');
}

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

async function editModerator(id) {
    if(!isAdmin(currentUser)) {
        showAlert('غير مصرح بتعديل المشرفين', 'error');
        return;
    }
    
    let mod = users.find(u => u.id === id && u.role === 'moderator');
    if(!mod) return;
    
    let newUsername = prompt('اسم المشرف الجديد:', mod.username);
    if(newUsername && newUsername.trim()) mod.username = newUsername.trim();
    
    let newPassword = prompt('كلمة المرور الجديدة (اتركها فارغة للإبقاء على نفس الكلمة):', '');
    if(newPassword && newPassword.trim()) mod.password = newPassword.trim();
    
    await saveUsers();
    displayModerators();
    showAlert('تم تعديل بيانات المشرف', 'success');
}

async function deleteModerator(id) {
    if(!isAdmin(currentUser)) {
        showAlert('غير مصرح بحذف المشرفين', 'error');
        return;
    }
    
    if(confirm('⚠️ تأكيد حذف هذا المشرف؟')) {
        users = users.filter(u => u.id !== id);
        await saveUsers();
        displayModerators();
        displayStats();
        showAlert('تم حذف المشرف', 'success');
    }
}

function displayApps() {
    let appsTable = document.getElementById('appsTable');
    if(!appsTable) return;
    
    if(apps.length === 0) {
        appsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد تطبيقات</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead> <tr><th>#</th><th>التطبيق</th><th>التصنيف</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr> </thead><tbody>';
    apps.forEach((app, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.name)}</strong><br><small>${escapeHtml(app.description.substring(0,40))}...</small></td>
            <td>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</td>
            <td>📥 ${app.downloads}</td>
            <td>⭐ ${app.rating.toFixed(1)}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'editApp') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editAppFull(${app.id})">✏️ تعديل</button>` : ''}
                ${hasPermission(currentUser, 'deleteApp') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteAppAdmin(${app.id})">🗑️ حذف</button>` : ''}
                <button class="btn-view" onclick="viewApp(${app.id})">👁️ عرض</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    appsTable.innerHTML = html;
}

function searchAdminApps() {
    let term = document.getElementById('searchApps')?.value.toLowerCase();
    let appsTable = document.getElementById('appsTable');
    if(!appsTable) return;
    
    if(!term) {
        displayApps();
        return;
    }
    
    let filtered = apps.filter(a => a.name.toLowerCase().includes(term) || a.description.toLowerCase().includes(term));
    
    if(filtered.length === 0) {
        appsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead> <tr><th>#</th><th>التطبيق</th><th>التصنيف</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr> </thead><tbody>';
    filtered.forEach((app, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.name)}</strong><br><small>${escapeHtml(app.description.substring(0,40))}...</small></td>
            <td>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</td>
            <td>📥 ${app.downloads}</td>
            <td>⭐ ${app.rating.toFixed(1)}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'editApp') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editAppFull(${app.id})">✏️ تعديل</button>` : ''}
                ${hasPermission(currentUser, 'deleteApp') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteAppAdmin(${app.id})">🗑️ حذف</button>` : ''}
                <button class="btn-view" onclick="viewApp(${app.id})">👁️ عرض</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    appsTable.innerHTML = html;
}

function editAppFull(appId) {
    localStorage.setItem('editAppId', appId);
    window.location.href = `upload.html?edit=${appId}`;
}

function viewApp(appId) {
    window.location.href = `app-detail.html?id=${appId}`;
}

async function deleteAppAdmin(appId) {
    if (!hasPermission(currentUser, 'deleteApp') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بحذف التطبيقات', 'error');
        return;
    }
    
    if(confirm('⚠️ تأكيد حذف هذا التطبيق؟')) {
        apps = apps.filter(a => a.id !== appId);
        await saveApps();
        displayApps();
        displayStats();
        showAlert('تم حذف التطبيق بنجاح', 'success');
    }
}

function displayComments() {
    let commentsTable = document.getElementById('commentsTable');
    if(!commentsTable) return;
    
    if(comments.length === 0) {
        commentsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد تعليقات</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead> <tr><th>#</th><th>المستخدم</th><th>التطبيق</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr> </thead><tbody>';
    let sortedComments = [...comments].reverse();
    sortedComments.forEach((comment, index) => {
        let app = apps.find(a => a.id === comment.appId);
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(comment.username)}</strong></td>
            <td>${app ? escapeHtml(app.name) : 'تطبيق محذوف'}</td>
            <td><small>${escapeHtml(comment.comment.substring(0,50))}${comment.comment.length>50?'...':''}</small></td>
            <td>${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</td>
            <td>${new Date(comment.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'editComment') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editCommentAdmin(${comment.id})">✏️ تعديل</button>` : ''}
                ${hasPermission(currentUser, 'deleteComment') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteCommentAdmin(${comment.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    commentsTable.innerHTML = html;
}

function searchComments() {
    let term = document.getElementById('searchComments')?.value.toLowerCase();
    let commentsTable = document.getElementById('commentsTable');
    if(!commentsTable) return;
    
    if(!term) {
        displayComments();
        return;
    }
    
    let filtered = comments.filter(c => c.comment.toLowerCase().includes(term) || c.username.toLowerCase().includes(term));
    
    if(filtered.length === 0) {
        commentsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead> <tr><th>#</th><th>المستخدم</th><th>التطبيق</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr> </thead><tbody>';
    let sortedComments = [...filtered].reverse();
    sortedComments.forEach((comment, index) => {
        let app = apps.find(a => a.id === comment.appId);
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(comment.username)}</strong></td>
            <td>${app ? escapeHtml(app.name) : 'تطبيق محذوف'}</td>
            <td><small>${escapeHtml(comment.comment.substring(0,50))}${comment.comment.length>50?'...':''}</small></td>
            <td>${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</td>
            <td>${new Date(comment.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'editComment') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editCommentAdmin(${comment.id})">✏️ تعديل</button>` : ''}
                ${hasPermission(currentUser, 'deleteComment') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteCommentAdmin(${comment.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    commentsTable.innerHTML = html;
}

async function editCommentAdmin(commentId) {
    if (!hasPermission(currentUser, 'editComment') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بتعديل التعليقات', 'error');
        return;
    }
    
    let comment = comments.find(c => c.id === commentId);
    if(!comment) return;
    
    let newComment = prompt('تعديل التعليق:', comment.comment);
    if(newComment && newComment.trim()) {
        comment.comment = newComment.trim();
        await saveComments();
        displayComments();
        showAlert('تم تعديل التعليق بنجاح', 'success');
    }
}

async function deleteCommentAdmin(commentId) {
    if (!hasPermission(currentUser, 'deleteComment') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بحذف التعليقات', 'error');
        return;
    }
    
    if(confirm('⚠️ تأكيد حذف هذا التعليق؟')) {
        comments = comments.filter(c => c.id !== commentId);
        await saveComments();
        displayComments();
        displayStats();
        showAlert('تم حذف التعليق بنجاح', 'success');
    }
}

function displayCategories() {
    let categoriesList = document.getElementById('categoriesList');
    if(!categoriesList) return;
    
    if(categories.length === 0) {
        categoriesList.innerHTML = '<p style="text-align:center; padding:20px;">لا يوجد تصنيفات</p>';
        return;
    }
    
    let html = '';
    categories.forEach((cat) => {
        html += `
            <div class="category-item">
                <div class="category-name">
                    <span style="font-size:1.2rem;">${cat.icon}</span>
                    <span>${escapeHtml(cat.name)}</span>
                    <span style="color:#64748b; font-size:0.8rem;">(${cat.key})</span>
                </div>
                <div class="category-actions">
                    <button class="btn-edit" onclick="editCategory(${cat.id})">✏️ تعديل</button>
                    <button class="btn-delete" onclick="deleteCategory(${cat.id})">🗑️ حذف</button>
                </div>
            </div>
        `;
    });
    categoriesList.innerHTML = html;
}

async function addCategory() {
    if (!hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بإضافة تصنيفات', 'error');
        return;
    }
    
    let name = document.getElementById('newCategoryName')?.value.trim();
    let icon = document.getElementById('newCategoryIcon')?.value.trim();
    let key = document.getElementById('newCategoryKey')?.value.trim();
    
    if(!name) {
        showAlert('يرجى إدخال اسم التصنيف', 'error');
        return;
    }
    
    if(!icon) icon = '📱';
    if(!key) key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if(categories.find(c => c.key === key)) {
        showAlert('يوجد تصنيف بنفس المفتاح', 'error');
        return;
    }
    
    let newCategory = {
        id: Date.now(),
        name: name,
        icon: icon,
        key: key
    };
    
    categories.push(newCategory);
    await saveCategories();
    displayCategories();
    displayStats();
    showAlert('تم إضافة التصنيف بنجاح', 'success');
    
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryIcon').value = '';
    document.getElementById('newCategoryKey').value = '';
}

async function editCategory(id) {
    if (!hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بتعديل التصنيفات', 'error');
        return;
    }
    
    let category = categories.find(c => c.id === id);
    if(!category) return;
    
    let newName = prompt('اسم التصنيف الجديد:', category.name);
    if(newName && newName.trim()) {
        category.name = newName.trim();
        
        let newIcon = prompt('أيقونة التصنيف الجديدة:', category.icon);
        if(newIcon && newIcon.trim()) category.icon = newIcon.trim();
        
        await saveCategories();
        displayCategories();
        showAlert('تم تعديل التصنيف بنجاح', 'success');
    }
}

async function deleteCategory(id) {
    if (!hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بحذف التصنيفات', 'error');
        return;
    }
    
    let category = categories.find(c => c.id === id);
    if(!category) return;
    
    let appsInCategory = apps.filter(a => a.category === category.key);
    if(appsInCategory.length > 0) {
        if(!confirm(`⚠️ يوجد ${appsInCategory.length} تطبيق(ات) في هذا التصنيف. سيتم نقلها إلى التصنيف الافتراضي. هل تريد المتابعة؟`)) {
            return;
        }
        
        let defaultCategory = categories.find(c => c.key === 'games') || categories[0];
        appsInCategory.forEach(app => {
            app.category = defaultCategory.key;
        });
        await saveApps();
    }
    
    categories = categories.filter(c => c.id !== id);
    await saveCategories();
    displayCategories();
    displayStats();
    showAlert('تم حذف التصنيف بنجاح', 'success');
}

function loadCurrentFavicon() {
    let savedFavicon = localStorage.getItem('site_favicon');
    let previewImg = document.getElementById('faviconPreviewImg');
    let noFaviconText = document.getElementById('noFaviconText');
    
    if (savedFavicon) {
        if (previewImg) {
            previewImg.src = savedFavicon;
            previewImg.style.display = 'block';
        }
        if (noFaviconText) noFaviconText.style.display = 'none';
        updateFaviconInPage(savedFavicon);
    } else {
        if (previewImg) previewImg.style.display = 'none';
        if (noFaviconText) noFaviconText.style.display = 'block';
    }
}

function updateFaviconInPage(faviconUrl) {
    let existingLink = document.querySelector("link[rel*='icon']");
    if (existingLink) {
        existingLink.href = faviconUrl;
    } else {
        let link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
    }
}

async function uploadFavicon() {
    if (!isAdmin(currentUser)) {
        showAlert('غير مصرح لك بتغيير أيقونة الموقع', 'error');
        return;
    }
    
    let fileInput = document.getElementById('faviconFile');
    let file = fileInput.files[0];
    
    if (!file) {
        showAlert('يرجى اختيار صورة أولاً', 'error');
        return;
    }
    
    let validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
        showAlert('يرجى اختيار صورة بصيغة PNG, JPG أو ICO', 'error');
        return;
    }
    
    if (file.size > 1024 * 1024) {
        showAlert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 1 ميجابايت', 'error');
        return;
    }
    
    showAlert('جاري رفع الأيقونة...', 'info');
    
    try {
        let reader = new FileReader();
        reader.onload = function(e) {
            let base64Image = e.target.result;
            localStorage.setItem('site_favicon', base64Image);
            
            let previewImg = document.getElementById('faviconPreviewImg');
            let noFaviconText = document.getElementById('noFaviconText');
            if (previewImg) {
                previewImg.src = base64Image;
                previewImg.style.display = 'block';
            }
            if (noFaviconText) noFaviconText.style.display = 'none';
            
            updateFaviconInPage(base64Image);
            showAlert('تم رفع أيقونة الموقع بنجاح', 'success');
            fileInput.value = '';
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('خطأ في رفع الأيقونة:', error);
        showAlert('حدث خطأ أثناء رفع الأيقونة', 'error');
    }
}

async function removeFavicon() {
    if (!isAdmin(currentUser)) {
        showAlert('غير مصرح لك بإزالة أيقونة الموقع', 'error');
        return;
    }
    
    if (confirm('⚠️ هل أنت متأكد من إزالة أيقونة الموقع؟')) {
        localStorage.removeItem('site_favicon');
        
        let previewImg = document.getElementById('faviconPreviewImg');
        let noFaviconText = document.getElementById('noFaviconText');
        if (previewImg) previewImg.style.display = 'none';
        if (noFaviconText) noFaviconText.style.display = 'block';
        
        updateFaviconInPage('/favicon.ico');
        showAlert('تم إزالة أيقونة الموقع', 'success');
    }
}

// ========== إدارة الإعلانات ==========

function displayAdSettings() {
    document.getElementById('topBannerCode').value = adSettings.topBanner || '';
    document.getElementById('bottomBannerCode').value = adSettings.bottomBanner || '';
    document.getElementById('leftSidebarCode').value = adSettings.leftSidebar || '';
    document.getElementById('rightSidebarCode').value = adSettings.rightSidebar || '';
    document.getElementById('clickAdCode').value = adSettings.clickAd || '';
}

async function saveAdCode(type) {
    let code = '';
    switch(type) {
        case 'topBanner':
            code = document.getElementById('topBannerCode').value;
            adSettings.topBanner = code;
            break;
        case 'bottomBanner':
            code = document.getElementById('bottomBannerCode').value;
            adSettings.bottomBanner = code;
            break;
        case 'leftSidebar':
            code = document.getElementById('leftSidebarCode').value;
            adSettings.leftSidebar = code;
            break;
        case 'rightSidebar':
            code = document.getElementById('rightSidebarCode').value;
            adSettings.rightSidebar = code;
            break;
        case 'clickAd':
            code = document.getElementById('clickAdCode').value;
            adSettings.clickAd = code;
            break;
    }
    
    await saveAdSettings();
    renderAds();
    showAlert('تم حفظ إعدادات الإعلان بنجاح', 'success');
}

// ========== تهيئة الصفحة ==========

(async function initAdminPage() {
    while (!jsonbinReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!checkAdminAccess()) return;
    
    filterTabsByPermissions();
    await displayStats();
    displayUsers();
    loadCurrentFavicon();
})();