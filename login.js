// login.js - تسجيل الدخول مع JSONBin.io

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    let input = document.getElementById('loginEmail').value.trim();
    let password = document.getElementById('loginPassword').value;
    
    // انتظر تحميل البيانات إذا لم تكن جاهزة
    if (!jsonbinReady) {
        showAlert('جاري تحميل البيانات...', 'info');
        await new Promise(resolve => {
            const checkReady = setInterval(() => {
                if (jsonbinReady) {
                    clearInterval(checkReady);
                    resolve();
                }
            }, 100);
        });
    }
    
    console.log('🔍 محاولة تسجيل الدخول...');
    console.log(`👤 المستخدم: ${input}`);
    console.log(`👥 عدد المستخدمين: ${users.length}`);
    
    let user = users.find(u => (u.email === input || u.username === input) && u.password === password);
    
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log(`✅ تم تسجيل الدخول بنجاح: ${user.username} (${user.role})`);
        
        showAdModal(() => {
            showAlert(`مرحباً ${user.username}`, 'success');
            if(user.role === 'admin' || user.role === 'moderator') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    } else {
        console.log('❌ فشل تسجيل الدخول');
        showAlert('بيانات الدخول غير صحيحة', 'error');
    }
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}