// common.js - الملف الرئيسي مع JSONBin.io

// ========== المتغيرات العامة ==========
let apps = [];
let users = [];
let comments = [];
let categories = [];
let currentUser = null;
let selectedRating = 0;
let currentAppId = null;
let pendingDownloadApp = null;

// متغيرات JSONBin
let jsonbinReady = false;
let BIN_ID = '';
let MASTER_KEY = '';
let BASE_URL = 'https://api.jsonbin.io/v3/b/';

// التصنيفات الافتراضية
const defaultCategories = [
    { id: 1, name: 'ألعاب', icon: '🎮', key: 'games' },
    { id: 2, name: 'تواصل اجتماعي', icon: '💬', key: 'social' },
    { id: 3, name: 'تعليم', icon: '📚', key: 'education' },
    { id: 4, name: 'إنتاجية', icon: '💼', key: 'productivity' },
    { id: 5, name: 'ترفيه', icon: '🎬', key: 'entertainment' }
];

// ========== دوال التحقق من الصلاحيات ==========

function isAdmin(user) {
    return user && user.role === 'admin';
}

function isModerator(user) {
    return user && user.role === 'moderator';
}

function hasPermission(user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'moderator' && user.permissions && user.permissions[permission]) return true;
    return false;
}

function canAccessAdminPanel(user) {
    return isAdmin(user) || isModerator(user);
}

// ========== تحميل التكوين ==========
async function loadConfig() {
    try {
        console.log('🔄 جاري تحميل التكوين...');
        
        // محاولة تحميل من get-config.php أولاً
        let response;
        try {
            response = await fetch('get-config.php');
        } catch(e) {
            console.log('لا يوجد ملف get-config.php، استخدام config.js');
        }
        
        if (response && response.ok) {
            const config = await response.json();
            if (!config.error) {
                BIN_ID = config.BIN_ID;
                MASTER_KEY = config.MASTER_KEY;
                BASE_URL = config.BASE_URL || 'https://api.jsonbin.io/v3/b/';
                console.log('✅ تم تحميل التكوين من get-config.php');
                return true;
            }
        }
        
        // استخدام config.js مباشرة
        if (typeof CONFIG !== 'undefined' && CONFIG.JSONBIN) {
            BIN_ID = CONFIG.JSONBIN.BIN_ID;
            MASTER_KEY = CONFIG.JSONBIN.MASTER_KEY;
            BASE_URL = CONFIG.JSONBIN.BASE_URL;
            console.log('✅ تم تحميل التكوين من config.js');
            return true;
        }
        
        throw new Error('لم يتم العثور على إعدادات JSONBin');
        
    } catch (error) {
        console.error('❌ خطأ في تحميل التكوين:', error);
        showAlert('خطأ في تحميل إعدادات الاتصال: ' + error.message, 'error');
        return false;
    }
}

// ========== دوال JSONBin.io ==========

async function loadDataFromJSONBin() {
    try {
        console.log('🔄 جاري تحميل البيانات من JSONBin.io...');
        console.log('📡 الرابط:', `${BASE_URL}${BIN_ID}`);
        
        const response = await fetch(`${BASE_URL}${BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        apps = data.record.apps || [];
        users = data.record.users || [];
        comments = data.record.comments || [];
        categories = data.record.categories || defaultCategories;
        
        console.log('✅ تم تحميل البيانات بنجاح');
        console.log(`📊 التطبيقات: ${apps.length}, المستخدمين: ${users.length}, التعليقات: ${comments.length}, التصنيفات: ${categories.length}`);
        
        await ensureDefaultData();
        jsonbinReady = true;
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        loadFromLocalBackup();
        jsonbinReady = true;
        return false;
    }
}

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
            categories: categories,
            lastUpdated: new Date().toISOString()
        };
        
        const response = await fetch(`${BASE_URL}${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ تم حفظ البيانات في JSONBin.io');
        saveToLocalBackup();
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
        saveToLocalBackup();
        return false;
    }
}

function saveToLocalBackup() {
    localStorage.setItem('apps_backup', JSON.stringify(apps));
    localStorage.setItem('users_backup', JSON.stringify(users));
    localStorage.setItem('comments_backup', JSON.stringify(comments));
    localStorage.setItem('categories_backup', JSON.stringify(categories));
    localStorage.setItem('last_backup', new Date().toISOString());
    console.log('💾 تم حفظ النسخة الاحتياطية محلياً');
}

function loadFromLocalBackup() {
    console.log('📦 محاولة التحميل من النسخة الاحتياطية المحلية...');
    
    const backupApps = localStorage.getItem('apps_backup');
    const backupUsers = localStorage.getItem('users_backup');
    const backupComments = localStorage.getItem('comments_backup');
    const backupCategories = localStorage.getItem('categories_backup');
    
    if (backupApps) {
        apps = JSON.parse(backupApps);
        console.log(`📱 تم تحميل ${apps.length} تطبيق من النسخة الاحتياطية`);
    }
    if (backupUsers) {
        users = JSON.parse(backupUsers);
        console.log(`👥 تم تحميل ${users.length} مستخدم من النسخة الاحتياطية`);
    }
    if (backupComments) {
        comments = JSON.parse(backupComments);
        console.log(`💬 تم تحميل ${comments.length} تعليق من النسخة الاحتياطية`);
    }
    if (backupCategories) {
        categories = JSON.parse(backupCategories);
        console.log(`🏷️ تم تحميل ${categories.length} تصنيف من النسخة الاحتياطية`);
    }
    
    if (!categories || categories.length === 0) {
        categories = defaultCategories;
        console.log('🏷️ استخدام التصنيفات الافتراضية');
    }
    
    // إذا لم توجد بيانات احتياطية، استخدم البيانات الافتراضية
    if (apps.length === 0) {
        apps = [
            {id:1, name:"تطبيق التواصل الاجتماعي", description:"تطبيق رائع للتواصل مع الأصدقاء", version:"2.0.1", category:"social", deviceType:"both", size:"45 MB", image:"https://via.placeholder.com/300x180/667eea/ffffff?text=Social+App", downloadLink:"#", downloads:1250, rating:4.5, ratings:[5,4,5,4,5], userId:1, userName:"المدير", date:"2024-01-01"},
            {id:2, name:"لعبة الألغاز", description:"لعبة ألغاز ممتعة وتحدي للعقل", version:"1.5.0", category:"games", deviceType:"android", size:"78 MB", image:"https://via.placeholder.com/300x180/764ba2/ffffff?text=Puzzle+Game", downloadLink:"#", downloads:890, rating:4.2, ratings:[4,5,4,4,4], userId:1, userName:"المدير", date:"2024-01-02"},
            {id:3, name:"تطبيق التعليم", description:"منصة تعليمية متكاملة للطلاب", version:"3.0.0", category:"education", deviceType:"both", size:"120 MB", image:"https://via.placeholder.com/300x180/48c6ef/ffffff?text=Education+App", downloadLink:"#", downloads:2340, rating:4.8, ratings:[5,5,4,5,5], userId:1, userName:"المدير", date:"2024-01-03"}
        ];
        console.log('📱 تم إنشاء تطبيقات افتراضية');
    }
    
    if (users.length === 0) {
        users = [{
            id: 1,
            username: "المدير",
            email: "admin",
            password: "admin2012",
            role: "admin",
            date: new Date().toISOString()
        }];
        console.log('👑 تم إنشاء مستخدم admin افتراضي');
    }
    
    console.log('✅ تم تحميل البيانات من النسخة الاحتياطية بنجاح');
}

async function ensureDefaultData() {
    let needsSave = false;
    
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
    
    if (apps.length === 0) {
        apps.push(
            {id:1, name:"تطبيق التواصل الاجتماعي", description:"تطبيق رائع للتواصل مع الأصدقاء", version:"2.0.1", category:"social", deviceType:"both", size:"45 MB", image:"https://via.placeholder.com/300x180/667eea/ffffff?text=Social+App", downloadLink:"#", downloads:1250, rating:4.5, ratings:[5,4,5,4,5], userId:1, userName:"المدير", date:"2024-01-01"},
            {id:2, name:"لعبة الألغاز", description:"لعبة ألغاز ممتعة وتحدي للعقل", version:"1.5.0", category:"games", deviceType:"android", size:"78 MB", image:"https://via.placeholder.com/300x180/764ba2/ffffff?text=Puzzle+Game", downloadLink:"#", downloads:890, rating:4.2, ratings:[4,5,4,4,4], userId:1, userName:"المدير", date:"2024-01-02"},
            {id:3, name:"تطبيق التعليم", description:"منصة تعليمية متكاملة للطلاب", version:"3.0.0", category:"education", deviceType:"both", size:"120 MB", image:"https://via.placeholder.com/300x180/48c6ef/ffffff?text=Education+App", downloadLink:"#", downloads:2340, rating:4.8, ratings:[5,5,4,5,5], userId:1, userName:"المدير", date:"2024-01-03"}
        );
        needsSave = true;
        console.log('📱 تم إضافة تطبيقات افتراضية');
    }
    
    if (categories.length === 0) {
        categories = defaultCategories;
        needsSave = true;
        console.log('🏷️ تم إضافة تصنيفات افتراضية');
    }
    
    if (needsSave) {
        await saveAllToJSONBin();
    }
}

// ========== دوال التصنيفات ==========

function getCategoriesForSelect() {
    return categories.map(cat => `<option value="${cat.key}">${cat.icon} ${cat.name}</option>`).join('');
}

function getCategoryIcon(key) {
    const cat = categories.find(c => c.key === key);
    return cat ? cat.icon : '📱';
}

function getCategoryName(key) {
    const cat = categories.find(c => c.key === key);
    return cat ? cat.name : key;
}

function getCategoryById(id) {
    return categories.find(c => c.id === id);
}

// ========== دوال حفظ البيانات ==========

function saveApps() { saveAllToJSONBin(); }
function saveUsers() { saveAllToJSONBin(); }
function saveComments() { saveAllToJSONBin(); }
function saveCategories() { saveAllToJSONBin(); }

// ========== دوال مساعدة ==========

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

function updateNavBar() {
    let loginNav = document.getElementById('loginNav');
    let adminNav = document.getElementById('adminNav');
    let moderatorNav = document.getElementById('moderatorNav');
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
            let roleName = currentUser.role === 'admin' ? 'مدير' : (currentUser.role === 'moderator' ? 'مشرف' : 'مستخدم');
            userInfo.innerHTML = `<span style="display:flex; align-items:center; gap:12px; background:#f0f4ff; padding:8px 16px; border-radius:50px;">${roleIcon} ${escapeHtml(currentUser.username)} (${roleName}) <a href="#" onclick="logout()" style="color:#f44336; text-decoration:none;">🚪 خروج</a></span>`;
        }
        if(adminNav) adminNav.style.display = (currentUser.role === 'admin') ? 'block' : 'none';
        if(moderatorNav) moderatorNav.style.display = (currentUser.role === 'moderator') ? 'block' : 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    } else {
        if(loginNav) loginNav.style.display = 'block';
        if(userInfo) userInfo.style.display = 'none';
        if(adminNav) adminNav.style.display = 'none';
        if(moderatorNav) moderatorNav.style.display = 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAlert('تم تسجيل الخروج بنجاح', 'info');
    window.location.href = 'index.html';
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
    
    return `<div class="app-card" onclick="if(typeof showRatingModal === 'function') showRatingModal(${app.id})">
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
            <a href="#" class="app-card-download" onclick="event.stopPropagation(); if(typeof requestDownload === 'function') requestDownload(${app.id})">📥 تحميل</a>
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

// ========== أيقونة الموقع ==========
function loadSiteFavicon() {
    let savedFavicon = localStorage.getItem('site_favicon');
    if (savedFavicon) {
        let existingLink = document.querySelector("link[rel*='icon']");
        if (existingLink) {
            existingLink.href = savedFavicon;
        } else {
            let link = document.createElement('link');
            link.rel = 'icon';
            link.href = savedFavicon;
            document.head.appendChild(link);
        }
    }
}

// ========== انتظار تحميل البيانات ==========
function waitForData() {
    return new Promise((resolve) => {
        if (jsonbinReady) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (jsonbinReady) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// ========== تهيئة الصفحة ==========

let storedUser = localStorage.getItem('currentUser');
if(storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch(e) {
        currentUser = null;
    }
}

(async function init() {
    console.log('🚀 بدء تهيئة AppNova...');
    
    const configLoaded = await loadConfig();
    if (!configLoaded) {
        console.error('❌ فشل تحميل التكوين، استخدام البيانات المحلية');
        loadFromLocalBackup();
        jsonbinReady = true;
    } else {
        await loadDataFromJSONBin();
    }
    
    updateNavBar();
    loadSiteFavicon();
    
    console.log('✅ AppNova جاهز للعمل');
    console.log(`📊 عدد التطبيقات: ${apps.length}`);
    console.log(`👥 عدد المستخدمين: ${users.length}`);
})();