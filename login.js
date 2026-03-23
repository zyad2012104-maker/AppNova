// login.js
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let input = document.getElementById('loginEmail').value.trim();
    let password = document.getElementById('loginPassword').value;
    
    let user = users.find(u => (u.email === input || u.username === input) && u.password === password);
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAdModal(() => {
            showAlert(`مرحباً ${user.username}`, 'success');
            if(user.role === 'admin' || user.role === 'moderator') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    } else {
        showAlert('بيانات الدخول غير صحيحة', 'error');
    }
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}