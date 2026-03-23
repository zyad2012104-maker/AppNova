// عرض لوحة الإدارة
function displayAdminPanel() {
    if(!currentUser || currentUser.role !== 'admin') {
        showAlert('غير مصرح بالدخول إلى لوحة الإدارة', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    let adminContent = document.getElementById('adminContent');
    if(!adminContent) return;
    
    // المستخدمين
    let regularUsers = users.filter(u => u.role !== 'admin');
    let usersHtml = `<div style="background:white; padding:20px; border-radius:15px; margin-bottom:20px;">
        <h3 style="margin-bottom:15px;">👥 المستخدمين (${regularUsers.length})</h3>`;
    if(regularUsers.length) {
        regularUsers.forEach(u => {
            usersHtml += `<div style="padding:12px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${u.username}</strong><br><small>${u.email}</small></div>
                <button onclick="deleteUser(${u.id})" style="background:#ef4444; color:white; border:none; padding:6px 15px; border-radius:8px; cursor:pointer;">حذف</button>
            </div>`;
        });
    } else {
        usersHtml += '<p>لا يوجد مستخدمين</p>';
    }
    usersHtml += '</div>';
    
    // التطبيقات
    let appsHtml = `<div style="background:white; padding:20px; border-radius:15px; margin-bottom:20px;">
        <h3 style="margin-bottom:15px;">📱 التطبيقات (${apps.length})</h3>`;
    if(apps.length) {
        apps.forEach(a => {
            appsHtml += `<div style="padding:12px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${a.name}</strong><br><small>📥 ${a.downloads} | ⭐ ${a.rating.toFixed(1)}</small></div>
                <div>
                    <button onclick="editApp(${a.id})" style="background:#10b981; color:white; border:none; padding:6px 15px; border-radius:8px; margin-left:8px; cursor:pointer;">تعديل</button>
                    <button onclick="deleteApp(${a.id})" style="background:#ef4444; color:white; border:none; padding:6px 15px; border-radius:8px; cursor:pointer;">حذف</button>
                </div>
            </div>`;
        });
    } else {
        appsHtml += '<p>لا يوجد تطبيقات</p>';
    }
    appsHtml += '</div>';
    
    // التعليقات
    let commentsHtml = `<div style="background:white; padding:20px; border-radius:15px;">
        <h3 style="margin-bottom:15px;">💬 التعليقات (${comments.length})</h3>`;
    if(comments.length) {
        comments.forEach(c => {
            commentsHtml += `<div style="padding:12px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${c.username}</strong>: ${c.comment.substring(0,60)}${c.comment.length>60?'...':''}<br><small>⭐ ${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</small></div>
                <button onclick="deleteComment(${c.id})" style="background:#ef4444; color:white; border:none; padding:6px 15px; border-radius:8px; cursor:pointer;">حذف</button>
            </div>`;
        });
    } else {
        commentsHtml += '<p>لا يوجد تعليقات</p>';
    }
    commentsHtml += '</div>';
    
    adminContent.innerHTML = usersHtml + appsHtml + commentsHtml;
}

function deleteUser(id) {
    if(confirm('تأكيد حذف المستخدم؟')) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        displayAdminPanel();
        showAlert('تم حذف المستخدم', 'success');
    }
}

function deleteApp(id) {
    if(confirm('تأكيد حذف التطبيق؟')) {
        apps = apps.filter(a => a.id !== id);
        saveApps();
        displayAdminPanel();
        showAlert('تم حذف التطبيق', 'success');
    }
}

function deleteComment(id) {
    if(confirm('تأكيد حذف التعليق؟')) {
        comments = comments.filter(c => c.id !== id);
        saveComments();
        displayAdminPanel();
        showAlert('تم حذف التعليق', 'success');
    }
}

function editApp(id) {
    let app = apps.find(a => a.id === id);
    if(!app) return;
    
    let newName = prompt('الاسم الجديد:', app.name);
    if(newName && newName.trim()) app.name = newName.trim();
    
    let newDesc = prompt('الوصف الجديد:', app.description);
    if(newDesc && newDesc.trim()) app.description = newDesc.trim();
    
    saveApps();
    displayAdminPanel();
    showAlert('تم تعديل التطبيق', 'success');
}

function saveAdminChanges() {
    saveApps();
    saveUsers();
    saveComments();
    showAlert('تم حفظ جميع التغييرات', 'success');
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}

// تهيئة الصفحة
displayAdminPanel();

window.onclick = function(e) {
    let adModal = document.getElementById('adModal');
    if(e.target === adModal) closeAdModal();
};