let currentAdminPanel = 'users';

// عرض الإحصائيات
function displayStats() {
    let statsContainer = document.getElementById('statsCards');
    if(!statsContainer) return;
    
    let usersCount = users.filter(u => u.role === 'user').length;
    let moderatorsCount = users.filter(u => u.role === 'moderator').length;
    let totalDownloads = apps.reduce((sum, a) => sum + a.downloads, 0);
    
    statsContainer.innerHTML = `
        <div class="stat-card"><h3>${usersCount}</h3><p>👥 مستخدمين</p></div>
        <div class="stat-card"><h3>${moderatorsCount}</h3><p>🛡️ مشرفين</p></div>
        <div class="stat-card"><h3>${apps.length}</h3><p>📱 تطبيقات</p></div>
        <div class="stat-card"><h3>${comments.length}</h3><p>💬 تعليقات</p></div>
        <div class="stat-card"><h3>${totalDownloads}</h3><p>📥 إجمالي التحميلات</p></div>
    `;
}

// عرض لوحة الإدارة
function showAdminPanel(panel) {
    currentAdminPanel = panel;
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${panel}Panel`).classList.add('active');
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
    
    if(panel === 'users') displayUsers();
    else if(panel === 'moderators') displayModerators();
    else if(panel === 'apps') displayApps();
    else if(panel === 'comments') displayComments();
}

// عرض المستخدمين
function displayUsers() {
    let usersTable = document.getElementById('usersTable');
    if(!usersTable) return;
    
    let regularUsers = users.filter(u => u.role === 'user');
    
    if(regularUsers.length === 0) {
        usersTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد مستخدمين</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>';
    regularUsers.forEach((user, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${new Date(user.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                <button class="btn-delete" onclick="deleteUser(${user.id})">🗑️ حذف</button>
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
    
    let html = '<table><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((user, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${new Date(user.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                <button class="btn-delete" onclick="deleteUser(${user.id})">🗑️ حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    usersTable.innerHTML = html;
}

// عرض المشرفين (للمدير فقط)
function displayModerators() {
    let moderatorsTable = document.getElementById('moderatorsTable');
    if(!moderatorsTable) return;
    
    // فقط المدير يمكنه رؤية وإدارة المشرفين
    if(!isAdmin(currentUser)) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">⚠️ فقط المدير يمكنه إدارة المشرفين</p>';
        return;
    }
    
    let moderatorsList = users.filter(u => u.role === 'moderator');
    
    if(moderatorsList.length === 0) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد مشرفين</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>#</th><th>اسم المشرف</th><th>البريد الإلكتروني</th><th>الصلاحيات</th><th>تاريخ التعيين</th><th>الإجراءات</th></tr></thead><tbody>';
    moderatorsList.forEach((mod, index) => {
        let perms = [];
        if(mod.permissions?.deleteUser) perms.push('حذف مستخدم');
        if(mod.permissions?.deleteApp) perms.push('حذف تطبيق');
        if(mod.permissions?.editApp) perms.push('تعديل تطبيق');
        if(mod.permissions?.deleteComment) perms.push('حذف تعليق');
        if(mod.permissions?.editComment) perms.push('تعديل تعليق');
        if(mod.permissions?.viewStats) perms.push('عرض إحصائيات');
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(mod.username)}</strong></td>
            <td>${escapeHtml(mod.email)}</td>
            <td><small>${perms.join(', ') || 'لا توجد'}</small></td>
            <td>${new Date(mod.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
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
    
    let html = '<table><thead><tr><th>#</th><th>اسم المشرف</th><th>البريد الإلكتروني</th><th>الصلاحيات</th><th>تاريخ التعيين</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((mod, index) => {
        let perms = [];
        if(mod.permissions?.deleteUser) perms.push('حذف مستخدم');
        if(mod.permissions?.deleteApp) perms.push('حذف تطبيق');
        if(mod.permissions?.editApp) perms.push('تعديل تطبيق');
        if(mod.permissions?.deleteComment) perms.push('حذف تعليق');
        if(mod.permissions?.editComment) perms.push('تعديل تعليق');
        if(mod.permissions?.viewStats) perms.push('عرض إحصائيات');
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(mod.username)}</strong></td>
            <td>${escapeHtml(mod.email)}</td>
            <td><small>${perms.join(', ') || 'لا توجد'}</small></td>
            <td>${new Date(mod.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editModerator(${mod.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteModerator(${mod.id})">🗑️ حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    moderatorsTable.innerHTML = html;
}

// إضافة مشرف جديد (للمدير فقط)
document.getElementById('addModeratorForm')?.addEventListener('submit', function(e) {
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
            viewStats: document.getElementById('permViewStats').checked
        },
        date: new Date().toISOString()
    };
    
    users.push(newMod);
    saveUsers();
    
    showAlert('تم إضافة المشرف بنجاح', 'success');
    document.getElementById('addModeratorForm').reset();
    displayModerators();
    displayStats();
});

function editModerator(id) {
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
    
    saveUsers();
    displayModerators();
    showAlert('تم تعديل بيانات المشرف', 'success');
}

function deleteModerator(id) {
    if(!isAdmin(currentUser)) {
        showAlert('غير مصرح بحذف المشرفين', 'error');
        return;
    }
    
    if(confirm('⚠️ تأكيد حذف هذا المشرف؟')) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        displayModerators();
        displayStats();
        showAlert('تم حذف المشرف', 'success');
    }
}

// عرض التطبيقات
function displayApps() {
    let appsTable = document.getElementById('appsTable');
    if(!appsTable) return;
    
    if(apps.length === 0) {
        appsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد تطبيقات</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>#</th><th>التطبيق</th><th>التصنيف</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr></thead><tbody>';
    apps.forEach((app, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.name)}</strong><br><small>${escapeHtml(app.description.substring(0,40))}...</small></td>
            <td>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</td>
            <td>📥 ${app.downloads}</td>
            <td>⭐ ${app.rating.toFixed(1)}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editAppFull(${app.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteAppAdmin(${app.id})">🗑️ حذف</button>
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
    
    let html = '<table><thead><tr><th>#</th><th>التطبيق</th><th>التصنيف</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((app, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.name)}</strong><br><small>${escapeHtml(app.description.substring(0,40))}...</small></td>
            <td>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</td>
            <td>📥 ${app.downloads}</td>
            <td>⭐ ${app.rating.toFixed(1)}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editAppFull(${app.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteAppAdmin(${app.id})">🗑️ حذف</button>
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
    window.location.href = `apps.html?view=${appId}`;
}

function deleteAppAdmin(appId) {
    if(confirm('⚠️ تأكيد حذف هذا التطبيق؟')) {
        apps = apps.filter(a => a.id !== appId);
        saveApps();
        displayApps();
        displayStats();
        showAlert('تم حذف التطبيق بنجاح', 'success');
    }
}

// عرض التعليقات
function displayComments() {
    let commentsTable = document.getElementById('commentsTable');
    if(!commentsTable) return;
    
    if(comments.length === 0) {
        commentsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد تعليقات</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>#</th><th>المستخدم</th><th>التطبيق</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>';
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
                <button class="btn-edit" onclick="editCommentAdmin(${comment.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteCommentAdmin(${comment.id})">🗑️ حذف</button>
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
    
    let html = '<table><thead><tr><th>#</th><th>المستخدم</th><th>التطبيق</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>';
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
                <button class="btn-edit" onclick="editCommentAdmin(${comment.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteCommentAdmin(${comment.id})">🗑️ حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    commentsTable.innerHTML = html;
}

function editCommentAdmin(commentId) {
    let comment = comments.find(c => c.id === commentId);
    if(!comment) return;
    
    let newComment = prompt('التعليق الجديد:', comment.comment);
    if(newComment && newComment.trim()) {
        comment.comment = newComment.trim();
        saveComments();
        displayComments();
        showAlert('تم تعديل التعليق بنجاح', 'success');
    }
}

function deleteCommentAdmin(commentId) {
    if(confirm('⚠️ تأكيد حذف هذا التعليق؟')) {
        comments = comments.filter(c => c.id !== commentId);
        saveComments();
        displayComments();
        showAlert('تم حذف التعليق بنجاح', 'success');
    }
}

function deleteUser(id) {
    if(confirm('⚠️ تأكيد حذف هذا المستخدم؟')) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        displayUsers();
        displayStats();
        showAlert('تم حذف المستخدم بنجاح', 'success');
    }
}

// تهيئة الصفحة
if(currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
    displayStats();
    displayUsers();
} else {
    window.location.href = 'index.html';
}