// app-detail.js - النسخة النهائية المصححة

let currentApp = null;
let selectedRating = 0;
let appId = null;

// دالة للحصول على معرف التطبيق من الرابط
function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// دالة عرض رسالة تحميل
function showLoading() {
    const container = document.getElementById('appContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <div style="width: 60px; height: 60px; border: 4px solid #e2e8f0; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h3>🔄 جاري تحميل بيانات التطبيق...</h3>
                <p style="color: #64748b; margin-top: 10px;">يرجى الانتظار قليلاً</p>
            </div>
        `;
    }
}

// دالة عرض خطأ
function showError(message) {
    const container = document.getElementById('appContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <h1 style="font-size: 3rem;">😕</h1>
                <p style="color: #64748b; margin: 15px 0;">${message}</p>
                <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px;">📱 استعراض التطبيقات</a>
            </div>
        `;
    }
}

// دالة عرض النجوم
function renderStars(rating = 0) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? "★" : "☆";
    }
    return stars;
}

// دالة عرض أشرطة التقييمات
function renderRatingBars(ratings) {
    const total = ratings.length;
    if (total === 0) return '<p style="text-align:center;">لا توجد تقييمات بعد</p>';
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
        let val = typeof r === 'object' ? r.rating : r;
        if (val >= 1 && val <= 5) distribution[Math.floor(val)]++;
    });
    
    let html = '';
    for (let star = 5; star >= 1; star--) {
        const count = distribution[star];
        const percentage = (count / total) * 100;
        html += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="width: 60px; color: #fbbf24;">${'★'.repeat(star)}</div>
                <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: #fbbf24; border-radius: 4px;"></div>
                </div>
                <div style="width: 40px; color: #64748b;">${count}</div>
            </div>
        `;
    }
    return html;
}

// دالة عرض تفاصيل التطبيق
function renderAppDetail(app) {
    console.log('🎨 جاري عرض تفاصيل التطبيق:', app.name);
    
    const container = document.getElementById('appContent');
    if (!container) {
        console.error('❌ عنصر appContent غير موجود');
        return;
    }
    
    const totalRatings = app.ratings.length;
    const ratingsValues = app.ratings.map(r => typeof r === 'object' ? r.rating : r);
    const avgRating = totalRatings > 0 ? (ratingsValues.reduce((a,b) => a + b, 0) / totalRatings).toFixed(1) : app.rating.toFixed(1);
    
    // معرض الصور
    let galleryHtml = '';
    if (app.gallery && app.gallery.length > 0) {
        galleryHtml = `
            <div style="margin: 30px 0;">
                <h3>📸 صور من التطبيق</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                    ${app.gallery.map(img => `<img src="${img}" onclick="openImageModal('${img}')" onerror="this.style.display='none'" style="width: 100%; height: 150px; object-fit: cover; border-radius: 12px; cursor: pointer;">`).join('')}
                </div>
            </div>
        `;
    }
    
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    
    // التحقق من أن المستخدم قد قيم
    const hasUserRated = currentUser ? app.ratings.some(r => {
        if (typeof r === 'object') return r.userId === currentUser.id;
        return false;
    }) : false;
    
    // نموذج التقييم
    let ratingFormHtml = '';
    if (currentUser && !hasUserRated) {
        ratingFormHtml = `
            <div class="rating-section" style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                <h3>⭐ قيم هذا التطبيق</h3>
                <div style="display: flex; gap: 10px; margin: 15px 0;">
                    ${[1,2,3,4,5].map(star => `
                        <span onclick="setRatingValue(${star})" style="font-size: 2rem; cursor: pointer; color: #cbd5e1;">★</span>
                    `).join('')}
                </div>
                <button onclick="submitAppRating(${app.id})" class="submit-btn" style="width: auto; padding: 10px 25px;">إرسال التقييم</button>
            </div>
        `;
    } else if (currentUser && hasUserRated) {
        ratingFormHtml = `
            <div style="background: #e6f7e6; border-radius: 16px; padding: 20px; margin: 20px 0;">
                <p style="color: #10b981; text-align: center;">✅ لقد قمت بتقييم هذا التطبيق بالفعل. شكراً لك!</p>
            </div>
        `;
    } else if (!currentUser) {
        ratingFormHtml = `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                <p style="text-align: center;">🔐 <a href="login.html" style="color: #667eea;">سجل الدخول</a> لتقييم هذا التطبيق</p>
            </div>
        `;
    }
    
    // التعليقات
    const appComments = comments.filter(c => c.appId === app.id);
    let commentsHtml = '';
    if (appComments.length === 0) {
        commentsHtml = '<p style="text-align:center; padding:30px; background:#f8fafc; border-radius:16px;">💬 لا توجد تعليقات بعد. كن أول من يعلق!</p>';
    } else {
        commentsHtml = appComments.map(comment => `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 10px; color: #64748b;">
                    <span><strong>${escapeHtml(comment.username)}</strong></span>
                    <span style="color: #fbbf24;">${renderStars(comment.rating)}</span>
                    <span>${new Date(comment.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div>${escapeHtml(comment.comment)}</div>
            </div>
        `).join('');
    }
    
    // تطبيقات مشابهة
    let similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    let similarAppsHtml = '';
    if (similarApps.length > 0) {
        similarAppsHtml = `
            <div style="margin-top: 40px;">
                <h3>📱 تطبيقات مشابهة</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    ${similarApps.map(similar => `
                        <div onclick="openAppDetail(${similar.id})" style="background: #f8fafc; border-radius: 12px; padding: 10px; cursor: pointer; text-align: center;">
                            <img src="${similar.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://placehold.co/200x100/cccccc/white?text=No+Image'">
                            <div style="font-weight: bold; margin-top: 8px;">${escapeHtml(similar.name)}</div>
                            <div style="color: #fbbf24;">⭐ ${similar.rating.toFixed(1)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // عرض الصفحة الكاملة
    const html = `
        <div style="max-width: 1200px; margin: 0 auto; background: white; border-radius: 25px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white;">
                <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                    <img src="${appIcon}" style="width: 120px; height: 120px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); object-fit: cover;" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 10px;">${escapeHtml(app.name)}</h1>
                        <p>${escapeHtml(app.developer || app.userName || "مطور غير معروف")}</p>
                        <div style="color: #fbbf24; font-size: 1.2rem;">${renderStars(avgRating)}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
                            <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">⭐ ${avgRating}</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">📊 ${totalRatings} تقييم</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">📥 ${app.downloads} تحميل</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">📱 ${escapeHtml(app.version)}</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">💾 ${escapeHtml(app.size)}</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <div style="margin-bottom: 30px;">
                    <button onclick="downloadApp(${app.id})" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 15px 40px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; cursor: pointer;">📥 تحميل التطبيق</button>
                </div>
                
                ${galleryHtml}
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                    <h2>📄 وصف التطبيق</h2>
                    <p style="line-height: 1.8; margin-top: 10px;">${escapeHtml(app.description)}</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                    <h3>📊 إحصائيات التقييمات</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; font-weight: 800; color: #fbbf24;">${avgRating}</div>
                            <div style="color: #fbbf24;">${renderStars(avgRating)}</div>
                            <div style="color: #64748b;">${totalRatings} تقييم</div>
                        </div>
                        <div style="flex: 1;">
                            ${renderRatingBars(app.ratings)}
                        </div>
                    </div>
                </div>
                
                ${ratingFormHtml}
                
                <div style="margin-top: 30px;">
                    <h2>💬 التعليقات</h2>
                    <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-top: 20px;">
                        <input type="text" id="commentName" placeholder="اسمك" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 12px;" ${currentUser ? `value="${escapeHtml(currentUser.username)}"` : ''}>
                        <select id="commentRating" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                            <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                            <option value="3">⭐⭐⭐ جيد</option>
                            <option value="2">⭐⭐ مقبول</option>
                            <option value="1">⭐ ضعيف</option>
                        </select>
                        <textarea id="commentText" rows="3" placeholder="اكتب تعليقك..." style="width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit;"></textarea>
                        <button onclick="submitComment(${app.id})" class="submit-btn" style="width: auto; padding: 10px 25px;">📝 إرسال التعليق</button>
                    </div>
                    <div id="commentsList" style="margin-top: 20px;">${commentsHtml}</div>
                </div>
                
                ${similarAppsHtml}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// دالة إرسال التقييم
let tempRating = 0;
function setRatingValue(rating) {
    tempRating = rating;
    const stars = document.querySelectorAll('.rating-section span');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#fbbf24' : '#cbd5e1';
    });
}

async function submitAppRating(appId) {
    if (!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    if (!tempRating) {
        showAlert('يرجى اختيار التقييم بالنجوم', 'error');
        return;
    }
    
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    // التحقق من عدم وجود تقييم سابق
    if (app.ratings.some(r => {
        if (typeof r === 'object') return r.userId === currentUser.id;
        return false;
    })) {
        showAlert('لقد قمت بتقييم هذا التطبيق بالفعل', 'error');
        return;
    }
    
    // إضافة التقييم
    app.ratings.push({
        userId: currentUser.id,
        rating: tempRating,
        date: new Date().toISOString()
    });
    
    // تحديث متوسط التقييم
    const ratingsValues = app.ratings.map(r => typeof r === 'object' ? r.rating : r);
    app.rating = ratingsValues.reduce((sum, r) => sum + r, 0) / ratingsValues.length;
    
    await saveApps();
    showAlert('تم إضافة تقييمك بنجاح!', 'success');
    tempRating = 0;
    location.reload(); // إعادة تحميل الصفحة
}

// دالة إرسال تعليق
async function submitComment(appId) {
    const name = document.getElementById('commentName')?.value.trim();
    const rating = document.getElementById('commentRating')?.value;
    const text = document.getElementById('commentText')?.value.trim();
    
    if (!name) {
        showAlert('يرجى إدخال اسمك', 'error');
        return;
    }
    
    if (!text) {
        showAlert('يرجى كتابة تعليقك', 'error');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        appId: appId,
        userId: currentUser?.id || null,
        username: name,
        comment: text,
        rating: parseInt(rating),
        date: new Date().toISOString()
    };
    
    comments.push(newComment);
    await saveComments();
    
    showAlert('تم إضافة تعليقك بنجاح!', 'success');
    
    // تفريغ الحقول
    if (document.getElementById('commentText')) document.getElementById('commentText').value = '';
    
    location.reload(); // إعادة تحميل الصفحة
}

// دالة فتح الصورة
function openImageModal(imgSrc) {
    const modal = document.getElementById('adModal');
    const content = document.getElementById('modalAdContent');
    if (modal && content) {
        content.innerHTML = `<img src="${imgSrc}" style="max-width:100%; border-radius:12px;">`;
        modal.style.display = 'flex';
    }
}

// الدالة الرئيسية لتحميل التطبيق
function loadApp() {
    const urlParams = new URLSearchParams(window.location.search);
    appId = parseInt(urlParams.get('id'));
    
    console.log('🔍 معرف التطبيق:', appId);
    console.log('📱 عدد التطبيقات:', apps ? apps.length : 0);
    
    if (!appId || isNaN(appId)) {
        showError('معرّف التطبيق غير صحيح');
        return;
    }
    
    if (!apps || apps.length === 0) {
        showError('لم يتم تحميل البيانات بعد. يرجى تحديث الصفحة');
        return;
    }
    
    const app = apps.find(a => a.id === appId);
    
    if (!app) {
        showError(`لم نتمكن من العثور على التطبيق المطلوب (ID: ${appId})`);
        return;
    }
    
    currentApp = app;
    renderAppDetail(app);
}

// بدء تحميل الصفحة
showLoading();

// التحقق من وجود البيانات
let checkCount = 0;
let loadInterval = setInterval(function() {
    checkCount++;
    console.log(`⏳ انتظار تحميل البيانات... (${checkCount}) apps: ${apps ? apps.length : 'undefined'}`);
    
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(loadInterval);
        console.log('✅ البيانات جاهزة، بدء تحميل التطبيق');
        loadApp();
    } else if (checkCount > 30) {
        // بعد 15 ثانية (30 * 500ms)
        clearInterval(loadInterval);
        console.log('❌ انتهى وقت الانتظار');
        showError('حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة أو التحقق من اتصال الإنترنت');
    }
}, 500);