// تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let input = document.getElementById('loginEmail').value.trim();
    let password = document.getElementById('loginPassword').value;
    
    // مدير الموقع
    if(input === "admin" && password === "admin2012") {
        let adminUser = {id:1, username:"المدير", email:"admin", role:"admin"};
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        showAdModal(() => {
            showAlert('مرحباً مدير AppNova', 'success');
            window.location.href = 'admin.html';
        });
        return;
    }
    
    // مستخدم عادي
    let user = users.find(u => (u.email === input || u.username === input) && u.password === password);
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAdModal(() => {
            showAlert(`مرحباً ${user.username}`, 'success');
            window.location.href = 'index.html';
        });
    } else {
        showAlert('بيانات الدخول غير صحيحة', 'error');
    }
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}