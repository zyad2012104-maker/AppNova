// app-detail.js - النسخة النهائية المصححة

console.log('🚀 بدء تحميل app-detail.js');

let currentApp = null;

// دالة للحصول على معرف التطبيق من الرابط
function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    console.log('🔍 معرف التطبيق من الرابط:', id);
    return id;
}

// دالة عرض تفاصيل التطبيق
function displayAppDetails() {
    console.log('🎨 بدء عرض تفاصيل التطبيق');
    console.log('📦 عدد التطبيقات:', apps ? apps.length : 0);
    
    const container = document.getElementById('appContent');
    if (!container) {
        console.error('❌ عنصر appContent غير موجود');
        return;
    }
    
    const appId = getAppIdFromURL();
    
    if (!appId) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <h1 style="font-size: 3rem;">😕</h1>
                <p style="color: #64748b;">معرّف التطبيق غير موجود في الرابط</p>
                <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px; margin-top: 20px;">📱 استعراض التطبيقات</a>
            </div>
        `;
        return;
    }
    
    // البحث عن التطبيق
    const app = apps.find(a => a.id == appId);
    
    if (!app) {
        console.error('❌ التطبيق غير موجود للمعرف:', appId);
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <h1 style="font-size: 3rem;">😕</h1>
                <p style="color: #64748b;">التطبيق غير موجود (ID: ${appId})</p>
                <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px; margin-top: 20px;">📱 استعراض التطبيقات</a>
            </div>
        `;
        return;
    }
    
    console.log('✅ تم العثور على التطبيق:', app.name);
    currentApp = app;
    
    // حساب متوسط التقييم
    const totalRatings = app.ratings.length;
    let avgRating = app.rating;
    if (totalRatings > 0) {
        const ratingsSum = app.ratings.reduce((sum, r) => sum + (typeof r === 'object' ? r.rating : r), 0);
        avgRating = (ratingsSum / totalRatings).toFixed(1);
    }
    
    // عرض النجوم
    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= Math.round(rating) ? '★' : '☆';
        }
        return stars;
    }
    
    // عرض أشرطة التقييمات
    function renderRatingBars() {
        const ratings = app.ratings;
        const total = ratings.length;
        if (total === 0) return '<p style="text-align:center;">لا توجد تقييمات بعد</p>';
        
        const distribution = {5:0,4:0,3:0,2:0,1:0};
        ratings.forEach(r => {
            const val = typeof r === 'object' ? r.rating : r;
            if (val >= 1 && val <= 5) distribution[Math.floor(val)]++;
        });
        
        let html = '';
        for (let star = 5; star >= 1; star--) {
            const count = distribution[star];
            const percent = (count / total) * 100;
            html += `
                <div class="rating-bar">
                    <div style="width: 60px; color: #fbbf24;">${'★'.repeat(star)}</div>
                    <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: #fbbf24; border-radius: 4px;"></div>
                    </div>
                    <div style="width: 40px; color: #64748b;">${count}</div>
                </div>
            `;
        }
        return html;
    }
    
    // معرض الصور
    let galleryHtml = '';
    if (app.gallery && app.gallery.length > 0) {
        galleryHtml = `
            <div style="margin: 30px 0;">
                <h3>📸 صور من التطبيق</h3>
                <div class="gallery-grid">
                    ${app.gallery.map(img => `
                        <img src="${img}" onclick="openImageModal('${img}')" onerror="this.style.display='none'">
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // التعليقات
    const appComments = comments.filter(c => c.appId === app.id);
    let commentsHtml = '';
    if (appComments.length === 0) {
        commentsHtml = '<p style="text-align:center; padding:30px; background:#f8fafc; border-radius:16px;">💬 لا توجد تعليقات بعد</p>';
    } else {
        commentsHtml = appComments.map(comment => `
            <div class="comment-card">
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
    
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    
    // عرض الصفحة
    container.innerHTML = `
        <div class="app-detail-container">
            <div class="app-header">
                <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                    <img src="${appIcon}" class="app-icon-large" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 10px;">${escapeHtml(app.name)}</h1>
                        <p>${escapeHtml(app.developer || app.userName || "مطور غير معروف")}</p>
                        <div class="stars">${renderStars(avgRating)}</div>
                        <div class="app-meta">
                            <span>⭐ ${avgRating}</span>
                            <span>📊 ${totalRatings} تقييم</span>
                            <span>📥 ${app.downloads} تحميل</span>
                            <span>📱 ${escapeHtml(app.version)}</span>
                            <span>💾 ${escapeHtml(app.size)}</span>
                            <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <div style="margin-bottom: 30px;">
                    <button onclick="downloadApp(${app.id})" class="download-btn">📥 تحميل التطبيق</button>
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
                            <div class="stars">${renderStars(avgRating)}</div>
                            <div style="color: #64748b;">${totalRatings} تقييم</div>
                        </div>
                        <div style="flex: 1;">
                            ${renderRatingBars()}
                        </div>
                    </div>
                </div>
                
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
                        <button onclick="addNewComment(${app.id})" class="submit-btn" style="width: auto; padding: 10px 25px;">📝 إرسال التعليق</button>
                    </div>
                    <div id="commentsList" style="margin-top: 20px;">${commentsHtml}</div>
                </div>
                
                ${similarAppsHtml}
            </div>
        </div>
    `;
}

// دالة إضافة تعليق جديد
async function addNewComment(appId) {
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
        appId: parseInt(appId),
        userId: currentUser?.id || null,
        username: name,
        comment: text,
        rating: parseInt(rating),
        date: new Date().toISOString()
    };
    
    comments.push(newComment);
    await saveComments();
    
    showAlert('تم إضافة تعليقك بنجاح!', 'success');
    document.getElementById('commentText').value = '';
    displayAppDetails(); // إعادة تحميل الصفحة
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

// انتظار تحميل البيانات
let checkInterval = setInterval(function() {
    console.log('⏳ انتظار تحميل البيانات... apps:', apps ? apps.length : 'undefined');
    
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(checkInterval);
        console.log('✅ البيانات جاهزة، عدد التطبيقات:', apps.length);
        displayAppDetails();
    } else if (typeof apps !== 'undefined' && apps.length === 0) {
        clearInterval(checkInterval);
        console.log('⚠️ لا توجد تطبيقات');
        const container = document.getElementById('appContent');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                    <h1 style="font-size: 3rem;">📱</h1>
                    <p style="color: #64748b;">لا توجد تطبيقات متاحة حالياً</p>
                    <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px; margin-top: 20px;">📱 استعراض التطبيقات</a>
                </div>
            `;
        }
    }
}, 500);

// timeout بعد 10 ثواني
setTimeout(function() {
    if (checkInterval) {
        clearInterval(checkInterval);
        if ((!apps || apps.length === 0)) {
            console.log('❌ timeout: لم يتم تحميل البيانات');
            const container = document.getElementById('appContent');
            if (container && container.innerHTML.includes('loading')) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                        <h1 style="font-size: 3rem;">⏰</h1>
                        <p style="color: #64748b;">انتهى وقت الانتظار. يرجى تحديث الصفحة</p>
                        <button onclick="location.reload()" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px; margin-top: 20px;">🔄 تحديث الصفحة</button>
                    </div>
                `;
            }
        }
    }
}, 10000);