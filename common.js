// common.js - الملف الرئيسي مع JSONBin.io

// المتغيرات العامة
let apps = [];
let users = [];
let comments = [];
let currentUser = null;
let selectedRating = 0;
let currentAppId = null;
let pendingDownloadApp = null;

// متغيرات JSONBin
let jsonbinReady = false;
let jsonbinData = null;

// ========== دوال JSONBin.io ==========

// قراءة جميع البيانات من JSONBin
async function loadDataFromJSONBin() {
    try {
        console.log('🔄 جاري تحميل البيانات من JSONBin.io...');
        
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': CONFIG.JSONBIN.MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        jsonbinData = data.record;
        
        // تحميل البيانات من JSONBin
        apps = jsonbinData.apps || [];
        users = jsonbinData.users || [];
        comments = jsonbinData.comments || [];
        
        console.log('✅ تم تحميل البيانات بنجاح');
        console.log(`📊 التطبيقات: ${apps.length}, المستخدمين: ${users.length}, التعليقات: ${comments.length}`);
        
        // إضافة بيانات افتراضية إذا كانت فارغة
        await ensureDefaultData();
        
        jsonbinReady = true;
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        // محاولة تحميل من localStorage كنسخة احتياطية
        loadFromLocalBackup();
        jsonbinReady = true;
        return false;
    }
}

// حفظ جميع البيانات إلى JSONBin
async function saveAllToJSONBin() {
    if (!jsonbinReady) {
        console.warn('⚠️ JSONBin غير جاهز بعد');
        return false;
    }
    
    try {
        const dataToSave = {
            apps: apps,
            users: users,
            comments: comments,
            lastUpdated: new Date().toISOString()
        };
        
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ تم حفظ البيانات في JSONBin.io');
        
        // حفظ نسخة احتياطية في localStorage
        saveToLocalBackup();
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
        // حفظ في localStorage كنسخة احتياطية
        saveToLocalBackup();
        return false;
    }
}

// نسخة احتياطية في localStorage
function saveToLocalBackup() {
    localStorage.setItem('apps_backup', JSON.stringify(apps));
    localStorage.setItem('users_backup', JSON.stringify(users));
    localStorage.setItem('comments_backup', JSON.stringify(comments));
    localStorage.setItem('last_backup', new Date().toISOString());
}

// تحميل من النسخة الاحتياطية
function loadFromLocalBackup() {
    const backupApps = localStorage.getItem('apps_backup');
    const backupUsers = localStorage.getItem('users_backup');
    const backupComments = localStorage.getItem('comments_backup');
    
    if (backupApps) apps = JSON.parse(backupApps);
    if (backupUsers) users = JSON.parse(backupUsers);
    if (backupComments) comments = JSON.parse(backupComments);
    
    console.log('📦 تم التحميل من النسخة الاحتياطية المحلية');
}

// التأكد من وجود بيانات افتراضية
async function ensureDefaultData() {
    let needsSave = false;
    
    // إضافة المستخدم admin إذا لم يوجد
    const adminExists = users.find(u => u.email === "admin");
    if (!adminExists) {
        users.push({
            id: 1,
            username: "المدير",
            email: "admin",
            password: "admin2012",
            role: "admin",
            date: new Date().toISOString()
        });
        needsSave = true;
        console.log('👑 تم إضافة المستخدم admin');
    }
    
    // إضافة تطبيقات افتراضية إذا كانت فارغة
    if (apps.length === 0) {
        apps.push(
            {id:1, name:"تطبيق التواصل الاجتماعي", description:"تطبيق رائع للتواصل مع الأصدقاء والعائلة ومشاركة الصور", version:"2.0.1", category:"social", deviceType:"both", size:"45 MB", image:"https://via.placeholder.com/300x180/667eea/ffffff?text=Social+App", downloadLink:"#", downloads:1250, rating:4.5, ratings:[5,4,5,4,5], userId:1, userName:"المدير", date:"2024-01-01"},
            {id:2, name:"لعبة الألغاز", description:"لعبة ألغاز ممتعة وتحدي للعقل مع مستويات متعددة", version:"1.5.0", category:"games", deviceType:"android", size:"78 MB", image:"https://via.placeholder.com/300x180/764ba2/ffffff?text=Puzzle+Game", downloadLink:"#", downloads:890, rating:4.2, ratings:[4,5,4,4,4], userId:1, userName:"المدير", date:"2024-01-02"},
            {id:3, name:"تطبيق التعليم", description:"منصة تعليمية متكاملة للطلاب تحتوي على دروس واختبارات", version:"3.0.0", category:"education", deviceType:"both", size:"120 MB", image:"https://via.placeholder.com/300x180/48c6ef/ffffff?text=Education+App", downloadLink:"#", downloads:2340, rating:4.8, ratings:[5,5,4,5,5], userId:1, userName:"المدير", date:"2024-01-03"}
        );
        needsSave = true;
        console.log('📱 تم إضافة تطبيقات افتراضية');
    }
    
    if (needsSave) {
        await saveAllToJSONBin();
    }
}

// ========== دوال حفظ البيانات (متوافقة مع الكود القديم) ==========

function saveApps() { 
    saveAllToJSONBin();
}

function saveUsers() { 
    saveAllToJSONBin();
}

function saveComments() { 
    saveAllToJSONBin();
}

// ========== دوال مساعدة ==========

// التحقق من صلاحيات المستخدم
function hasPermission(user, permission) {
    if(!user) return false;
    if(user.role === 'admin') return true;
    if(user.role === 'moderator' && user.permissions && user.permissions[permission]) return true;
    return false;
}

// التحقق من أن المستخدم هو المدير فقط
function isAdmin(user) {
    return user && user.role === 'admin';
}

// عرض التنبيهات
function showAlert(message, type) {
    let div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.innerHTML = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 15px 25px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.animation = 'slideOut 0.3s';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// تحديث شريط التنقل
function updateNavBar() {
    let loginNav = document.getElementById('loginNav');
    let adminNav = document.getElementById('adminNav');
    let userInfo = document.getElementById('userInfo');
    let uploadNav = document.getElementById('uploadNav');
    
    let storedUser = localStorage.getItem('currentUser');
    if(storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch(e) {
            currentUser = null;
        }
    }
    
    if(currentUser) {
        if(loginNav) loginNav.style.display = 'none';
        if(userInfo) {
            userInfo.style.display = 'block';
            let roleIcon = currentUser.role === 'admin' ? '👑' : (currentUser.role === 'moderator' ? '🛡️' : '👤');
            userInfo.innerHTML = `<span style="display:flex; align-items:center; gap:12px; background:#f0f4ff; padding:8px 16px; border-radius:50px;">${roleIcon} ${escapeHtml(currentUser.username)} <a href="#" onclick="logout()" style="color:#f44336; text-decoration:none;">🚪 خروج</a></span>`;
        }
        if(adminNav) adminNav.style.display = (currentUser.role === 'admin' || currentUser.role === 'moderator') ? 'block' : 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    } else {
        if(loginNav) loginNav.style.display = 'block';
        if(userInfo) userInfo.style.display = 'none';
        if(adminNav) adminNav.style.display = 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAlert('تم تسجيل الخروج بنجاح', 'info');
    window.location.href = 'index.html';
}

function getCategoryIcon(cat) {
    const icons = {games:'🎮', social:'💬', education:'📚', productivity:'💼', entertainment:'🎬'};
    return icons[cat] || '📱';
}

function getCategoryName(cat) {
    const names = {games:'ألعاب', social:'تواصل اجتماعي', education:'تعليم', productivity:'إنتاجية', entertainment:'ترفيه'};
    return names[cat] || cat;
}

function escapeHtml(text) {
    if(!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

function createAppCard(app) {
    let fullStars = Math.floor(app.rating);
    let emptyStars = 5 - fullStars;
    let stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
    
    return `<div class="app-card" onclick="showRatingModal(${app.id})">
        <img src="${app.image}" class="app-card-image" onerror="this.src='https://via.placeholder.com/300x180/cccccc/ffffff?text=No+Image'">
        <div class="app-card-content">
            <div class="app-card-title">${escapeHtml(app.name)}</div>
            <div class="app-card-description">${escapeHtml(app.description.substring(0,80))}${app.description.length>80?'...':''}</div>
            <div class="app-card-meta">
                <span>📥 ${app.downloads}</span>
                <span>💾 ${app.size}</span>
                <span>📱 ${app.version}</span>
            </div>
            <div class="app-card-meta">
                <span class="app-card-rating">${stars} (${app.rating.toFixed(1)})</span>
                <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
            </div>
            <a href="#" class="app-card-download" onclick="event.stopPropagation(); requestDownload(${app.id})">📥 تحميل</a>
        </div>
    </div>`;
}

function showAdModal(callback) {
    let modal = document.getElementById('adModal');
    if(modal) {
        let content = document.getElementById('modalAdContent');
        if(content) content.innerHTML = '<div style="padding:20px; text-align:center;">📢 إعلان<br><small>سيتم توجيهك بعد 3 ثواني</small></div>';
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
            if(callback) callback();
        }, 3000);
    } else {
        if(callback) callback();
    }
}

function closeAdModal() {
    let modal = document.getElementById('adModal');
    if(modal) modal.style.display = 'none';
}

function subscribeNewsletter() {
    let email = document.querySelector('#newsletterEmail')?.value;
    if(email && email.includes('@')) {
        showAlert('تم الاشتراك في النشرة البريدية بنجاح', 'success');
        document.querySelector('#newsletterEmail').value = '';
    } else {
        showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
    }
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}

// ========== تهيئة الصفحة ==========

// تحميل المستخدم الحالي من localStorage
let storedUser = localStorage.getItem('currentUser');
if(storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch(e) {
        currentUser = null;
    }
}

// تحميل البيانات من JSONBin عند بدء التشغيل
(async function init() {
    await loadDataFromJSONBin();
    updateNavBar();
    console.log('🚀 AppNova جاهز للعمل مع JSONBin.io');
})();