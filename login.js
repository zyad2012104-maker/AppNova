// login.js - تسجيل الدخول مع JSONBin.io

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    let input = document.getElementById('loginEmail').value.trim();
    let password = document.getElementById('loginPassword').value;
    
    if (!input || !password) {
        showAlert('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
        return;
    }
    
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
    
    // البحث عن المستخدم
    let user = users.find(u => (u.email === input || u.username === input) && u.password === password);
    
    if(user) {
        // حفظ المستخدم الحالي
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log(`✅ تم تسجيل الدخول بنجاح: ${user.username} (${user.role})`);
        
        // عرض إعلان قبل التوجيه
        showClickAd(() => {
            showAlert(`مرحباً ${user.username}`, 'success');
            
            // التوجيه حسب الدور
            if(user.role === 'admin' || user.role === 'moderator') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    } else {
        console.log('❌ فشل تسجيل الدخول');
        showAlert('بيانات الدخول غير صحيحة. تأكد من اسم المستخدم وكلمة المرور', 'error');
        
        // إظهار رسالة للمستخدمين الجدد
        let adminExists = users.find(u => u.email === 'admin');
        if (!adminExists) {
            showAlert('لم يتم العثور على حساب admin. يرجى التسجيل أولاً', 'info');
        }
    }
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}