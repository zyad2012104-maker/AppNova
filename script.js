// ==================== بيانات المستخدمين ====================
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', password: '123456', role: 'user', avatar: '' },
    { id: 2, name: 'المدير', email: 'admin@example.com', password: 'admin123', role: 'admin', avatar: '' }
];

// ==================== بيانات التطبيقات ====================
let apps = JSON.parse(localStorage.getItem('apps')) || [
    {
        id: 1,
        name: 'تطبيق تعلم اللغة الإنجليزية',
        category: 'educational',
        categoryName: 'تعليمي',
        platform: 'android',
        platformName: 'أندرويد',
        description: 'تطبيق شامل لتعلم اللغة الإنجليزية من الصفر حتى الاحتراف مع تمارين تفاعلية واختبارات',
        size: '15.5',
        price: 'free',
        icon: 'fa-language',
        iconUrl: '',
        downloadLink: 'https://example.com/app1.apk',
        developer: 'أحمد محمد',
        developerId: 1,
        rating: 4.5,
        ratingCount: 128,
        comments: [
            { id: 1, userId: 1, userName: 'أحمد محمد', rating: 5, text: 'تطبيق رائع جداً!', date: '2024-01-15' }
        ],
        downloads: 1500,
        uploadDate: '2024-01-15',
        fileData: null
    },
    {
        id: 2,
        name: 'متجر الأزياء',
        category: 'business',
        categoryName: 'أعمال',
        platform: 'both',
        platformName: 'أندرويد و iOS',
        description: 'تسوق أحدث صيحات الموضة والأزياء مع عروض حصرية وتوصيل سريع',
        size: '25.2',
        price: 'free',
        icon: 'fa-tshirt',
        iconUrl: '',
        downloadLink: 'https://example.com/app2.apk',
        developer: 'سارة أحمد',
        developerId: 2,
        rating: 4.8,
        ratingCount: 256,
        comments: [],
        downloads: 3200,
        uploadDate: '2024-01-20',
        fileData: null
    },
    {
        id: 3,
        name: 'سباق السيارات',
        category: 'games',
        categoryName: 'ألعاب',
        platform: 'ios',
        platformName: 'iOS',
        description: 'لعبة سباق سيارات مثيرة بجرافيك عالي الجودة ومسارات متنوعة',
        size: '45.0',
        price: 'paid',
        priceText: 'مدفوع',
        icon: 'fa-car',
        iconUrl: '',
        downloadLink: 'https://example.com/app3.ipa',
        developer: 'محمد علي',
        developerId: 3,
        rating: 4.3,
        ratingCount: 89,
        comments: [],
        downloads: 850,
        uploadDate: '2024-01-25',
        fileData: null
    }
];

// المستخدم الحالي
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ==================== دوال إدارة المستخدمين ====================

function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForUser();
        showNotification(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
        closeLoginModal();
        
        // إذا كان المدير، عرض لوحة التحكم
        if (user.role === 'admin') {
            setTimeout(() => {
                showAdminPanel();
            }, 500);
        }
        return true;
    } else {
        showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
    }
}

function register(name, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        showNotification('كلمة المرور غير متطابقة', 'error');
        return false;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('البريد الإلكتروني مسجل بالفعل', 'error');
        return false;
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: 'user',
        avatar: '',
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateUIForUser();
    showNotification('تم إنشاء الحساب بنجاح!', 'success');
    closeRegisterModal();
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    closeAdminPanel();
    
    if (window.location.pathname.includes('upload.html')) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function updateUIForUser() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userNameSpan = document.getElementById('userName');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            if (userNameSpan) userNameSpan.textContent = currentUser.name;
        }
        
        // إظهار زر لوحة التحكم للمدير
        if (currentUser.role === 'admin' && adminPanelBtn) {
            adminPanelBtn.style.display = 'flex';
        } else if (adminPanelBtn) {
            adminPanelBtn.style.display = 'none';
        }
        
        if (window.location.pathname.includes('upload.html')) {
            const uploadContainer = document.getElementById('uploadFormContainer');
            const loginMessage = document.getElementById('loginRequiredMessage');
            if (uploadContainer) uploadContainer.style.display = 'block';
            if (loginMessage) loginMessage.style.display = 'none';
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (adminPanelBtn) adminPanelBtn.style.display = 'none';
        
        if (window.location.pathname.includes('upload.html')) {
            const uploadContainer = document.getElementById('uploadFormContainer');
            const loginMessage = document.getElementById('loginRequiredMessage');
            if (uploadContainer) uploadContainer.style.display = 'none';
            if (loginMessage) loginMessage.style.display = 'block';
        }
    }
    
    updateStats();
}

// ==================== دوال الإدارة ====================

function showAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('غير مصرح لك بالدخول إلى لوحة التحكم', 'error');
        return;
    }
    
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
        updateAdminPanel();
        modal.style.display = 'block';
    }
}

function closeAdminPanel() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) modal.style.display = 'none';
}

function updateAdminPanel() {
    const adminContent = document.getElementById('adminPanelContent');
    if (!adminContent) return;
    
    const stats = {
        totalApps: apps.length,
        totalUsers: users.length,
        totalDownloads: apps.reduce((sum, app) => sum + (app.downloads || 0), 0),
        totalComments: apps.reduce((sum, app) => sum + (app.comments?.length || 0), 0)
    };
    
    adminContent.innerHTML = `
        <div class="admin-stats">
            <div class="admin-stat-card">
                <i class="fas fa-mobile-alt"></i>
                <div class="admin-stat-info">
                    <h3>${stats.totalApps}</h3>
                    <p>إجمالي التطبيقات</p>
                </div>
            </div>
            <div class="admin-stat-card">
                <i class="fas fa-users"></i>
                <div class="admin-stat-info">
                    <h3>${stats.totalUsers}</h3>
                    <p>إجمالي المستخدمين</p>
                </div>
            </div>
            <div class="admin-stat-card">
                <i class="fas fa-download"></i>
                <div class="admin-stat-info">
                    <h3>${stats.totalDownloads}</h3>
                    <p>إجمالي التحميلات</p>
                </div>
            </div>
            <div class="admin-stat-card">
                <i class="fas fa-comments"></i>
                <div class="admin-stat-info">
                    <h3>${stats.totalComments}</h3>
                    <p>إجمالي التعليقات</p>
                </div>
            </div>
        </div>
        
        <div class="admin-tabs">
            <button class="admin-tab-btn active" onclick="showAdminTab('apps')">التطبيقات</button>
            <button class="admin-tab-btn" onclick="showAdminTab('users')">المستخدمين</button>
            <button class="admin-tab-btn" onclick="showAdminTab('comments')">التعليقات</button>
        </div>
        
        <div id="adminTabContent" class="admin-tab-content">
            ${renderAppsList()}
        </div>
    `;
}

function showAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    tabs.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('adminTabContent');
    if (tab === 'apps') {
        content.innerHTML = renderAppsList();
    } else if (tab === 'users') {
        content.innerHTML = renderUsersList();
    } else if (tab === 'comments') {
        content.innerHTML = renderCommentsList();
    }
}

function renderAppsList() {
    if (apps.length === 0) {
        return '<div class="admin-empty">لا توجد تطبيقات</div>';
    }
    
    return `
        <div class="admin-table">
            <table>
                <thead>
                    <tr><th>المعرف</th><th>اسم التطبيق</th><th>المطور</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr>
                </thead>
                <tbody>
                    ${apps.map(app => `
                        <tr>
                            <td>${app.id}</td>
                            <td>${app.name}</td>
                            <td>${app.developer}</td>
                            <td>${app.downloads || 0}</td>
                            <td>${app.rating?.toFixed(1) || 0} (${app.ratingCount || 0})</td>
                            <td>
                                <button class="admin-btn-danger" onclick="deleteApp(${app.id})">
                                    <i class="fas fa-trash"></i> حذف
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderUsersList() {
    const regularUsers = users.filter(u => u.role !== 'admin');
    if (regularUsers.length === 0) {
        return '<div class="admin-empty">لا يوجد مستخدمين</div>';
    }
    
    return `
        <div class="admin-table">
            <table>
                <thead>
                    <tr><th>المعرف</th><th>الاسم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الدور</th><th>الإجراءات</th></tr>
                </thead>
                <tbody>
                    ${regularUsers.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.joinDate || 'غير محدد'}</td>
                            <td><span class="admin-badge-user">مستخدم</span></td>
                            <td>
                                <button class="admin-btn-danger" onclick="deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i> حذف
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderCommentsList() {
    const allComments = [];
    apps.forEach(app => {
        if (app.comments && app.comments.length > 0) {
            app.comments.forEach(comment => {
                allComments.push({
                    ...comment,
                    appId: app.id,
                    appName: app.name
                });
            });
        }
    });
    
    if (allComments.length === 0) {
        return '<div class="admin-empty">لا توجد تعليقات</div>';
    }
    
    return `
        <div class="admin-table">
            <table>
                <thead>
                    <tr><th>التطبيق</th><th>المستخدم</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr>
                </thead>
                <tbody>
                    ${allComments.map(comment => `
                        <tr>
                            <td>${comment.appName}</td>
                            <td>${comment.userName}</td>
                            <td>${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}</td>
                            <td>${comment.rating || 0} <i class="fas fa-star" style="color: #ffc107;"></i></td>
                            <td>${comment.date}</td>
                            <td>
                                <button class="admin-btn-danger" onclick="deleteComment(${comment.appId}, ${comment.id})">
                                    <i class="fas fa-trash"></i> حذف
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// دوال الحذف
function deleteApp(appId) {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('غير مصرح لك بهذا الإجراء', 'error');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا التطبيق؟')) {
        const appIndex = apps.findIndex(a => a.id === appId);
        if (appIndex !== -1) {
            apps.splice(appIndex, 1);
            localStorage.setItem('apps', JSON.stringify(apps));
            showNotification('تم حذف التطبيق بنجاح', 'success');
            updateAdminPanel();
            updateStats();
            
            // تحديث الصفحة إذا كانت تعرض التطبيقات
            if (document.getElementById('appsContainer')) {
                currentApps = [...apps];
                displayAllApps();
            }
            if (document.getElementById('featuredApps')) {
                displayFeaturedApps();
            }
        }
    }
}

function deleteUser(userId) {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('غير مصرح لك بهذا الإجراء', 'error');
        return;
    }
    
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.role === 'admin') {
        showNotification('لا يمكن حذف المدير الرئيسي', 'error');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع تطبيقاته وتعليقاته')) {
        // حذف تطبيقات المستخدم
        apps = apps.filter(app => app.developerId !== userId);
        
        // حذف تعليقات المستخدم من جميع التطبيقات
        apps.forEach(app => {
            if (app.comments) {
                app.comments = app.comments.filter(comment => comment.userId !== userId);
            }
        });
        
        // حذف المستخدم
        users = users.filter(u => u.id !== userId);
        
        localStorage.setItem('apps', JSON.stringify(apps));
        localStorage.setItem('users', JSON.stringify(users));
        
        showNotification('تم حذف المستخدم وجميع بياناته بنجاح', 'success');
        updateAdminPanel();
        updateStats();
        
        if (document.getElementById('appsContainer')) {
            currentApps = [...apps];
            displayAllApps();
        }
        if (document.getElementById('featuredApps')) {
            displayFeaturedApps();
        }
    }
}

function deleteComment(appId, commentId) {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('غير مصرح لك بهذا الإجراء', 'error');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
        const app = apps.find(a => a.id === appId);
        if (app && app.comments) {
            app.comments = app.comments.filter(c => c.id !== commentId);
            localStorage.setItem('apps', JSON.stringify(apps));
            showNotification('تم حذف التعليق بنجاح', 'success');
            updateAdminPanel();
        }
    }
}

// ==================== دوال رفع التطبيقات ====================

function uploadApp(formData) {
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'warning');
        openLoginModal();
        return false;
    }
    
    // تحويل الصورة إلى Base64
    const iconFile = formData.get('appIcon');
    const appFile = formData.get('appFile');
    const screenshotsFiles = formData.getAll('appScreenshots');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const iconBase64 = e.target.result;
        
        const newApp = {
            id: apps.length + 1,
            name: formData.get('appName'),
            category: formData.get('appCategory'),
            categoryName: getCategoryName(formData.get('appCategory')),
            platform: formData.get('appPlatform'),
            platformName: getPlatformName(formData.get('appPlatform')),
            description: formData.get('appDescription'),
            size: formData.get('appSize') || '0',
            price: formData.get('appPrice'),
            icon: getCategoryIcon(formData.get('appCategory')),
            iconUrl: iconBase64,
            downloadLink: URL.createObjectURL(appFile),
            developer: currentUser.name,
            developerId: currentUser.id,
            rating: 0,
            ratingCount: 0,
            comments: [],
            downloads: 0,
            uploadDate: new Date().toISOString().split('T')[0],
            fileData: appFile ? { name: appFile.name, size: appFile.size, type: appFile.type } : null,
            screenshots: []
        };
        
        // تحويل صور الشاشة إلى Base64
        let processedScreenshots = 0;
        if (screenshotsFiles && screenshotsFiles.length > 0) {
            screenshotsFiles.forEach((file, index) => {
                if (file && file.size > 0) {
                    const screenshotReader = new FileReader();
                    screenshotReader.onload = function(se) {
                        newApp.screenshots.push(se.target.result);
                        processedScreenshots++;
                        if (processedScreenshots === screenshotsFiles.filter(f => f && f.size > 0).length) {
                            finalizeUpload(newApp);
                        }
                    };
                    screenshotReader.readAsDataURL(file);
                } else {
                    processedScreenshots++;
                    if (processedScreenshots === screenshotsFiles.filter(f => f && f.size > 0).length) {
                        finalizeUpload(newApp);
                    }
                }
            });
        } else {
            finalizeUpload(newApp);
        }
    };
    
    if (iconFile && iconFile.size > 0) {
        reader.readAsDataURL(iconFile);
    } else {
        finalizeUpload({
            id: apps.length + 1,
            name: formData.get('appName'),
            category: formData.get('appCategory'),
            categoryName: getCategoryName(formData.get('appCategory')),
            platform: formData.get('appPlatform'),
            platformName: getPlatformName(formData.get('appPlatform')),
            description: formData.get('appDescription'),
            size: formData.get('appSize') || '0',
            price: formData.get('appPrice'),
            icon: getCategoryIcon(formData.get('appCategory')),
            iconUrl: '',
            downloadLink: URL.createObjectURL(appFile),
            developer: currentUser.name,
            developerId: currentUser.id,
            rating: 0,
            ratingCount: 0,
            comments: [],
            downloads: 0,
            uploadDate: new Date().toISOString().split('T')[0],
            fileData: appFile ? { name: appFile.name, size: appFile.size, type: appFile.type } : null,
            screenshots: []
        });
    }
    
    function finalizeUpload(appData) {
        if (appData.price === 'paid') appData.priceText = 'مدفوع';
        if (appData.price === 'freemium') appData.priceText = 'مجاني + داخلي';
        
        apps.push(appData);
        localStorage.setItem('apps', JSON.stringify(apps));
        
        showNotification('تم رفع التطبيق بنجاح!', 'success');
        return true;
    }
    
    return true;
}

// ==================== دوال التحميل مع التقييم ====================

function showDownloadModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    const modal = document.getElementById('downloadModal');
    const modalContent = document.getElementById('downloadModalContent');
    
    modalContent.innerHTML = `
        <div class="download-modal">
            <div class="download-app-info">
                <div class="download-app-icon">
                    ${app.iconUrl ? `<img src="${app.iconUrl}" alt="${app.name}">` : `<i class="fas ${app.icon}"></i>`}
                </div>
                <div class="download-app-details">
                    <h3>${app.name}</h3>
                    <p>المطور: ${app.developer}</p>
                    <p>الحجم: ${app.size} MB</p>
                </div>
            </div>
            
            <div class="download-rating-section">
                <h4>قيم التطبيق قبل التحميل</h4>
                <div class="rating-stars-download" id="downloadRatingStars">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <i class="far fa-star" data-rating="${star}" onclick="selectDownloadRating(${star})"></i>
                    `).join('')}
                </div>
            </div>
            
            <div class="download-comment-section">
                <h4>أضف تعليقاً (اختياري)</h4>
                <textarea id="downloadComment" rows="3" placeholder="اكتب تعليقك هنا..."></textarea>
            </div>
            
            <div class="download-actions">
                <button onclick="confirmDownload(${app.id})" class="btn-primary">
                    <i class="fas fa-download"></i> تأكيد التحميل
                </button>
                <button onclick="closeDownloadModal()" class="btn-secondary">
                    <i class="fas fa-times"></i> إلغاء
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

let downloadRating = 0;

function selectDownloadRating(rating) {
    downloadRating = rating;
    const stars = document.querySelectorAll('#downloadRatingStars i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
}

function confirmDownload(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    // إضافة التقييم
    if (downloadRating > 0) {
        addRating(appId, downloadRating);
    }
    
    // إضافة التعليق
    const commentText = document.getElementById('downloadComment')?.value;
    if (commentText && commentText.trim()) {
        addComment(appId, commentText, downloadRating);
    }
    
    // زيادة عدد التحميلات
    app.downloads++;
    localStorage.setItem('apps', JSON.stringify(apps));
    
    // فتح رابط التحميل
    if (app.downloadLink) {
        window.open(app.downloadLink, '_blank');
        showNotification(`جاري تحميل ${app.name}... شكراً لتقييمك!`, 'success');
    } else {
        showNotification('رابط التحميل غير متوفر', 'error');
    }
    
    downloadRating = 0;
    closeDownloadModal();
    updateStats();
    
    // تحديث عرض التطبيقات
    if (document.getElementById('appsContainer')) {
        displayAllApps();
    }
    if (document.getElementById('featuredApps')) {
        displayFeaturedApps();
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) modal.style.display = 'none';
    downloadRating = 0;
}

// ==================== دوال التقييم والتعليقات ====================

function addRating(appId, rating) {
    if (!currentUser) {
        // للزوار، نستخدم مستخدم مؤقت
        const tempUser = { id: 0, name: 'زائر' };
        const app = apps.find(a => a.id === appId);
        if (app) {
            const totalRating = (app.rating * app.ratingCount) + rating;
            app.ratingCount++;
            app.rating = totalRating / app.ratingCount;
            localStorage.setItem('apps', JSON.stringify(apps));
            return true;
        }
        return false;
    }
    
    const app = apps.find(a => a.id === appId);
    if (app) {
        const totalRating = (app.rating * app.ratingCount) + rating;
        app.ratingCount++;
        app.rating = totalRating / app.ratingCount;
        localStorage.setItem('apps', JSON.stringify(apps));
        return true;
    }
    return false;
}

function addComment(appId, commentText, rating) {
    const comment = {
        id: Date.now(),
        userId: currentUser ? currentUser.id : 0,
        userName: currentUser ? currentUser.name : 'زائر',
        rating: rating || 0,
        text: commentText,
        date: new Date().toISOString().split('T')[0]
    };
    
    const app = apps.find(a => a.id === appId);
    if (app) {
        if (!app.comments) app.comments = [];
        app.comments.unshift(comment);
        localStorage.setItem('apps', JSON.stringify(apps));
        return true;
    }
    return false;
}

// ==================== دوال عرض التطبيقات ====================

function createAppCard(app) {
    const priceClass = app.price === 'paid' ? 'paid' : 'free';
    const priceText = app.priceText || (app.price === 'paid' ? 'مدفوع' : 'مجاني');
    const ratingStars = generateRatingStars(app.rating, true);
    const iconHtml = app.iconUrl ? 
        `<img src="${app.iconUrl}" alt="${app.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px;">` : 
        `<i class="fas ${app.icon}"></i>`;
    
    return `
        <div class="app-card" data-id="${app.id}">
            <div class="app-icon">
                ${iconHtml}
                <span class="app-platform">
                    <i class="fas ${app.platform === 'android' ? 'fa-android' : 'fa-apple'}"></i>
                    ${app.platformName}
                </span>
            </div>
            <div class="app-info">
                <h3>${app.name}</h3>
                <span class="app-category">${app.categoryName}</span>
                <p class="app-description">${app.description.substring(0, 80)}${app.description.length > 80 ? '...' : ''}</p>
                <div class="app-rating">
                    ${ratingStars}
                    <span class="rating-count">(${app.ratingCount})</span>
                </div>
                <div class="app-meta">
                    <span class="app-size"><i class="fas fa-database"></i> ${app.size} MB</span>
                    <span class="app-price ${priceClass}">${priceText}</span>
                </div>
                <div class="app-actions">
                    <button onclick="showDownloadModal(${app.id})" class="btn-download"><i class="fas fa-download"></i> تحميل (${app.downloads})</button>
                    <button onclick="showAppDetails(${app.id})" class="btn-details"><i class="fas fa-info-circle"></i> تفاصيل</button>
                </div>
            </div>
        </div>
    `;
}

function generateRatingStars(rating, isSmall = false) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return `<div class="stars-container">${stars}</div>`;
}

function showAppDetails(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    const modal = document.getElementById('appDetailsModal');
    const modalTitle = document.getElementById('modalAppTitle');
    const modalContent = document.getElementById('appDetailsContent');
    
    if (modalTitle) modalTitle.textContent = app.name;
    
    const ratingStars = generateRatingStars(app.rating);
    const iconHtml = app.iconUrl ? 
        `<img src="${app.iconUrl}" alt="${app.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 16px;">` : 
        `<i class="fas ${app.icon}"></i>`;
    
    // عرض صور الشاشة إن وجدت
    const screenshotsHtml = app.screenshots && app.screenshots.length > 0 ? `
        <div class="app-screenshots">
            <h3>صور الشاشة</h3>
            <div class="screenshots-grid">
                ${app.screenshots.map(img => `
                    <img src="${img}" alt="لقطة شاشة" onclick="window.open(this.src)">
                `).join('')}
            </div>
        </div>
    ` : '';
    
    modalContent.innerHTML = `
        <div class="app-details">
            <div class="app-details-header">
                <div class="app-details-icon">
                    ${iconHtml}
                </div>
                <div class="app-details-info">
                    <h2>${app.name}</h2>
                    <p class="developer">المطور: ${app.developer}</p>
                    <div class="app-details-rating">
                        ${ratingStars}
                        <span>(${app.ratingCount} تقييم)</span>
                    </div>
                    <div class="app-details-meta">
                        <span><i class="fas fa-tag"></i> ${app.categoryName}</span>
                        <span><i class="fas fa-mobile-alt"></i> ${app.platformName}</span>
                        <span><i class="fas fa-database"></i> ${app.size} MB</span>
                        <span><i class="fas fa-dollar-sign"></i> ${app.price === 'free' ? 'مجاني' : (app.priceText || 'مدفوع')}</span>
                        <span><i class="fas fa-download"></i> ${app.downloads} تحميل</span>
                        <span><i class="fas fa-calendar"></i> ${app.uploadDate}</span>
                    </div>
                    <button onclick="showDownloadModal(${app.id})" class="btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-download"></i> تحميل التطبيق (${app.downloads})
                    </button>
                </div>
            </div>
            <div class="app-details-description">
                <h3>عن التطبيق</h3>
                <p>${app.description}</p>
            </div>
            ${screenshotsHtml}
            
            <div class="comment-section">
                <h3><i class="fas fa-comments"></i> التعليقات (${app.comments?.length || 0})</h3>
                <div class="comment-list">
                    ${app.comments && app.comments.length > 0 ? app.comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <span class="comment-user"><i class="fas fa-user-circle"></i> ${comment.userName}</span>
                                <span class="comment-date">${comment.date}</span>
                                ${currentUser?.role === 'admin' ? `
                                    <button class="admin-delete-comment" onclick="deleteComment(${app.id}, ${comment.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                            ${comment.rating > 0 ? `
                                <div class="comment-rating">
                                    ${generateRatingStars(comment.rating, true)}
                                </div>
                            ` : ''}
                            <p class="comment-text">${comment.text}</p>
                        </div>
                    `).join('') : '<p style="text-align: center; color: var(--gray-color);">لا توجد تعليقات بعد. كن أول من يعلق!</p>'}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// ==================== باقي الدوال ====================

let currentApps = [...apps];
let currentPage = 1;
const appsPerPage = 6;

function displayAllApps() {
    const appsContainer = document.getElementById('appsContainer');
    if (!appsContainer) return;
    
    const start = 0;
    const end = currentPage * appsPerPage;
    const appsToShow = currentApps.slice(start, end);
    
    if (appsToShow.length === 0) {
        appsContainer.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>لا توجد تطبيقات</h3><p>لم يتم العثور على تطبيقات مطابقة لمعايير البحث</p></div>';
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    appsContainer.innerHTML = appsToShow.map(app => createAppCard(app)).join('');
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (currentApps.length <= end) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    } else {
        if (loadMoreBtn) loadMoreBtn.style.display = 'inline-flex';
    }
}

function displayFeaturedApps() {
    const featuredContainer = document.getElementById('featuredApps');
    if (featuredContainer) {
        const featuredApps = apps.slice(0, 3);
        featuredContainer.innerHTML = featuredApps.map(app => createAppCard(app)).join('');
    }
}

function filterApps() {
    const searchInput = document.getElementById('searchApps');
    const filterCategory = document.getElementById('filterCategory');
    const filterPlatform = document.getElementById('filterPlatform');
    
    if (!searchInput || !filterCategory || !filterPlatform) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = filterCategory.value;
    const platform = filterPlatform.value;
    
    currentApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm) ||
                             app.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || app.category === category;
        const matchesPlatform = platform === 'all' || app.platform === platform;
        
        return matchesSearch && matchesCategory && matchesPlatform;
    });
    
    currentPage = 1;
    displayAllApps();
}

function updateStats() {
    const appsCount = document.getElementById('appsCount');
    const usersCount = document.getElementById('usersCount');
    
    if (appsCount) appsCount.textContent = apps.length + '+';
    if (usersCount) usersCount.textContent = users.length + '+';
}

function getCategoryName(category) {
    const categories = {
        educational: 'تعليمي',
        entertainment: 'ترفيهي',
        productivity: 'إنتاجية',
        social: 'تواصل اجتماعي',
        games: 'ألعاب',
        business: 'أعمال',
        health: 'صحة ولياقة'
    };
    return categories[category] || category;
}

function getPlatformName(platform) {
    const platforms = {
        android: 'أندرويد',
        ios: 'iOS',
        both: 'أندرويد و iOS'
    };
    return platforms[platform] || platform;
}

function getCategoryIcon(category) {
    const icons = {
        educational: 'fa-graduation-cap',
        entertainment: 'fa-film',
        productivity: 'fa-chart-line',
        social: 'fa-users',
        games: 'fa-gamepad',
        business: 'fa-briefcase',
        health: 'fa-heartbeat'
    };
    return icons[category] || 'fa-mobile-alt';
}

// ==================== دوال النوافذ المنبثقة ====================

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'block';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'block';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
}

function closeAppDetailsModal() {
    const modal = document.getElementById('appDetailsModal');
    if (modal) modal.style.display = 'none';
}

function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// ==================== دوال إعداد النماذج ====================

function setupForms() {
    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
    }
    
    // نموذج التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            register(name, email, password, confirmPassword);
        });
    }
    
    // نموذج رفع التطبيق
    const uploadForm = document.getElementById('appUploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                showNotification('يجب تسجيل الدخول أولاً', 'warning');
                openLoginModal();
                return;
            }
            
            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                return;
            }
            
            const formData = new FormData(this);
            if (uploadApp(formData)) {
                this.reset();
                document.querySelectorAll('.file-name').forEach(el => {
                    el.textContent = 'لم يتم اختيار ملف';
                });
                setTimeout(() => {
                    window.location.href = 'apps.html';
                }, 1500);
            }
        });
    }
    
    // نموذج التواصل
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');
            this.reset();
        });
    }
}

function setupFileInputs() {
    document.querySelectorAll('.file-input-wrapper input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const fileName = this.files.length > 0 
                ? (this.files.length > 1 ? `${this.files.length} ملفات` : this.files[0].name)
                : 'لم يتم اختيار ملف';
            const fileNameSpan = this.parentElement.querySelector('.file-name');
            if (fileNameSpan) fileNameSpan.textContent = fileName;
        });
    });
}

function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
    
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            if (nav) nav.classList.remove('active');
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
    };
    
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.success};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function closeTopAd() {
    const ad = document.querySelector('.ad-top');
    if (ad) {
        ad.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            ad.style.display = 'none';
        }, 300);
    }
}

function closeBottomAd() {
    const ad = document.querySelector('.ad-bottom');
    if (ad) {
        ad.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            ad.style.display = 'none';
        }, 300);
    }
}

// ==================== تهيئة الصفحة ====================
document.addEventListener('DOMContentLoaded', function() {
    updateUIForUser();
    displayFeaturedApps();
    
    if (document.getElementById('appsContainer')) {
        displayAllApps();
    }
    
    setupFileInputs();
    setupMobileMenu();
    setupForms();
    
    const searchInput = document.getElementById('searchApps');
    const filterCategory = document.getElementById('filterCategory');
    const filterPlatform = document.getElementById('filterPlatform');
    
    if (searchInput) searchInput.addEventListener('input', filterApps);
    if (filterCategory) filterCategory.addEventListener('change', filterApps);
    if (filterPlatform) filterPlatform.addEventListener('change', filterApps);
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            displayAllApps();
        });
    }
    
    window.onclick = function(event) {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const appDetailsModal = document.getElementById('appDetailsModal');
        const adminPanelModal = document.getElementById('adminPanelModal');
        const downloadModal = document.getElementById('downloadModal');
        
        if (event.target === loginModal) closeLoginModal();
        if (event.target === registerModal) closeRegisterModal();
        if (event.target === appDetailsModal) closeAppDetailsModal();
        if (event.target === adminPanelModal) closeAdminPanel();
        if (event.target === downloadModal) closeDownloadModal();
    };
});



// التأكد من وجود حساب المدير في النظام
function ensureAdminExists() {
    let users = JSON.parse(localStorage.getItem('users'));
    if (!users) {
        users = [];
    }
    
    // التحقق من وجود حساب المدير
    const adminExists = users.some(user => user.email === 'admin@example.com');
    
    if (!adminExists) {
        users.push({
            id: users.length + 1,
            name: 'مدير النظام',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            joinDate: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('users', JSON.stringify(users));
        console.log('تم إضافة حساب المدير بنجاح');
    }
}

// استدعاء الدالة عند تحميل الصفحة
ensureAdminExists();

// جعل الدوال متاحة عالمياً
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.closeAppDetailsModal = closeAppDetailsModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.logout = logout;
window.showAdminPanel = showAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.showAdminTab = showAdminTab;
window.deleteApp = deleteApp;
window.deleteUser = deleteUser;
window.deleteComment = deleteComment;
window.showAppDetails = showAppDetails;
window.showDownloadModal = showDownloadModal;
window.selectDownloadRating = selectDownloadRating;
window.confirmDownload = confirmDownload;
window.closeDownloadModal = closeDownloadModal;
window.closeTopAd = closeTopAd;
window.closeBottomAd = closeBottomAd;