// تسجيل مستخدم جديد
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let username = document.getElementById('regUsername').value.trim();
    let email = document.getElementById('regEmail').value.trim();
    let password = document.getElementById('regPassword').value;
    let confirm = document.getElementById('regConfirmPassword').value;
    
    if(username.length < 3) {
        showAlert('اسم المستخدم يجب أن يكون 3 أحرف على الأقل', 'error');
        return;
    }
    
    if(password.length < 6) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    if(password !== confirm) {
        showAlert('كلمة المرور غير متطابقة', 'error');
        return;
    }
    
    if(users.find(u => u.email === email)) {
        showAlert('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    users.push({
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: 'user',
        date: new Date().toISOString()
    });
    saveUsers();
    
    showAlert('تم إنشاء الحساب بنجاح', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}