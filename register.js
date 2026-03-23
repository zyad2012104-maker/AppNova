// register.js - إنشاء حساب جديد مع JSONBin.io

// تسجيل مستخدم جديد
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // انتظر تحميل البيانات
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
    
    let newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: 'user',
        date: new Date().toISOString()
    };
    
    users.push(newUser);
    await saveUsers();
    
    showAlert('تم إنشاء الحساب بنجاح', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}