// app-detail.js - صفحة تفاصيل التطبيق

console.log('🚀 بدء تحميل app-detail.js');

let currentApp = null;
let currentImageIndex = 0;
let galleryImages = [];

function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    console.log('🔍 معرف التطبيق:', id);
    return id;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? '★' : '☆';
    }
    return stars;
}

function renderRatingBars(ratings) {
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
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
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

function openImageModal(index) {
    if (!galleryImages.length) return;
    currentImageIndex = index;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    if (modal && modalImg) {
        modalImg.src = galleryImages[currentImageIndex];
        modalCaption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function prevImage() {
    if (galleryImages.length && currentImageIndex > 0) {
        currentImageIndex--;
        const modalImg = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');
        if (modalImg) modalImg.src = galleryImages[currentImageIndex];
        if (modalCaption) modalCaption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
    }
}

function nextImage() {
    if (galleryImages.length && currentImageIndex < galleryImages.length - 1) {
        currentImageIndex++;
        const modalImg = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');
        if (modalImg) modalImg.src = galleryImages[currentImageIndex];
        if (modalCaption) modalCaption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
    }
}

function renderGallery(images) {
    if (!images || images.length === 0) return '';
    galleryImages = images;
    
    let html = `
        <div style="margin: 30px 0;">
            <h3 style="margin-bottom: 15px; color: #2d3748;">📸 صور من التطبيق</h3>
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <img src="${images[0]}" class="main-gallery-image" onclick="openImageModal(0)" onerror="this.src='https://placehold.co/800x400/cccccc/white?text=No+Image'">
                </div>
                <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px;">
    `;
    
    images.forEach((img, idx) => {
        html += `
            <div style="flex-shrink: 0;" onclick="openImageModal(${idx})">
                <img src="${img}" class="thumbnail-image" onerror="this.src='https://placehold.co/100x100/cccccc/white?text=No+Image'">
            </div>
        `;
    });
    
    html += `</div></div></div>`;
    return html;
}

function displayAppDetails() {
    console.log('🎨 عرض تفاصيل التطبيق');
    const container = document.getElementById('appContent');
    if (!container) return;
    
    const appId = getAppIdFromURL();
    if (!appId) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><h1>😕</h1><p>معرّف التطبيق غير موجود</p><a href="apps.html" class="submit-btn">📱 استعراض التطبيقات</a></div>`;
        return;
    }
    
    const app = apps.find(a => a.id == appId);
    if (!app) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><h1>😕</h1><p>التطبيق غير موجود</p><a href="apps.html" class="submit-btn">📱 استعراض التطبيقات</a></div>`;
        return;
    }
    
    currentApp = app;
    const totalRatings = app.ratings.length;
    const ratingsSum = app.ratings.reduce((sum, r) => sum + (typeof r === 'object' ? r.rating : r), 0);
    const avgRating = totalRatings > 0 ? (ratingsSum / totalRatings).toFixed(1) : app.rating.toFixed(1);
    
    const galleryHtml = renderGallery(app.gallery);
    
    const appComments = comments.filter(c => c.appId === app.id);
    let commentsHtml = appComments.length === 0 ? 
        '<p style="text-align:center;padding:30px;background:#f8fafc;">💬 لا توجد تعليقات بعد</p>' :
        appComments.map(c => `
            <div class="comment-card">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px;color:#64748b;">
                    <span><strong>${escapeHtml(c.username)}</strong></span>
                    <span style="color:#fbbf24;">${renderStars(c.rating)}</span>
                    <span>${new Date(c.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div>${escapeHtml(c.comment)}</div>
            </div>
        `).join('');
    
    const similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    const similarHtml = similarApps.length ? `
        <div style="margin-top:40px;">
            <h3>📱 تطبيقات مشابهة</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;margin-top:15px;">
                ${similarApps.map(s => `
                    <div onclick="openAppDetail(${s.id})" style="background:#f8fafc;border-radius:12px;padding:10px;cursor:pointer;text-align:center;">
                        <img src="${s.image}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;">
                        <div style="font-weight:bold;margin-top:8px;">${escapeHtml(s.name)}</div>
                        <div style="color:#fbbf24;">⭐ ${s.rating.toFixed(1)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    
    container.innerHTML = `
        <div class="app-detail-container">
            <div class="app-header">
                <div style="display:flex;flex-wrap:wrap;gap:30px;align-items:center;">
                    <img src="${appIcon}" class="app-icon-large" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    <div style="flex:1;">
                        <h1 style="font-size:2rem;margin-bottom:10px;">${escapeHtml(app.name)}</h1>
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
            <div style="padding:30px;">
                <div style="margin-bottom:30px;text-align:center;">
                    <button onclick="downloadApp(${app.id})" class="download-btn">📥 تحميل التطبيق</button>
                </div>
                ${galleryHtml}
                <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:25px 0;">
                    <h2>📄 وصف التطبيق</h2>
                    <p style="line-height:1.8;">${escapeHtml(app.description)}</p>
                </div>
                <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:25px 0;">
                    <h3>📊 إحصائيات التقييمات</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:40px;align-items:center;">
                        <div style="text-align:center;">
                            <div style="font-size:4rem;font-weight:800;color:#fbbf24;">${avgRating}</div>
                            <div class="stars">${renderStars(avgRating)}</div>
                            <div style="color:#64748b;">${totalRatings} تقييم</div>
                        </div>
                        <div style="flex:1;">${renderRatingBars(app.ratings)}</div>
                    </div>
                </div>
                <div style="margin-top:30px;">
                    <h2>💬 آراء المستخدمين</h2>
                    <div style="background:#f8fafc;border-radius:16px;padding:25px;margin-bottom:25px;">
                        <h3>✍️ أضف تعليقك</h3>
                        <input type="text" id="commentName" placeholder="اسمك" style="width:100%;padding:12px;margin-bottom:12px;border:2px solid #e2e8f0;border-radius:12px;" ${currentUser ? `value="${escapeHtml(currentUser.username)}"` : ''}>
                        <select id="commentRating" style="width:100%;padding:12px;margin-bottom:12px;border:2px solid #e2e8f0;border-radius:12px;">
                            <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                            <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                            <option value="3">⭐⭐⭐ جيد</option>
                            <option value="2">⭐⭐ مقبول</option>
                            <option value="1">⭐ ضعيف</option>
                        </select>
                        <textarea id="commentText" rows="3" placeholder="اكتب تعليقك..." style="width:100%;padding:12px;margin-bottom:12px;border:2px solid #e2e8f0;border-radius:12px;"></textarea>
                        <button onclick="addNewComment(${app.id})" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;padding:12px 30px;border-radius:12px;cursor:pointer;">📝 إرسال التعليق</button>
                    </div>
                    <div id="commentsList">${commentsHtml}</div>
                </div>
                ${similarHtml}
            </div>
        </div>
    `;
}

async function addNewComment(appId) {
    const name = document.getElementById('commentName')?.value.trim();
    const rating = document.getElementById('commentRating')?.value;
    const text = document.getElementById('commentText')?.value.trim();
    
    if (!name) { showAlert('يرجى إدخال اسمك', 'error'); return; }
    if (!text) { showAlert('يرجى كتابة تعليقك', 'error'); return; }
    
    comments.push({
        id: Date.now(),
        appId: parseInt(appId),
        userId: currentUser?.id || null,
        username: name,
        comment: text,
        rating: parseInt(rating),
        date: new Date().toISOString()
    });
    await saveComments();
    showAlert('تم إضافة تعليقك بنجاح!', 'success');
    document.getElementById('commentText').value = '';
    displayAppDetails();
}

document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (modal && modal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') prevImage();
        else if (e.key === 'ArrowRight') nextImage();
        else if (e.key === 'Escape') closeImageModal();
    }
});

let checkInterval = setInterval(function() {
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(checkInterval);
        displayAppDetails();
    }
}, 500);

setTimeout(function() {
    if (checkInterval) {
        clearInterval(checkInterval);
        const container = document.getElementById('appContent');
        if (container && container.innerHTML.includes('spinner')) {
            container.innerHTML = `<div style="text-align:center;padding:60px;"><h1>⏰</h1><p>انتهى وقت الانتظار. يرجى تحديث الصفحة</p><button onclick="location.reload()" class="submit-btn">🔄 تحديث</button></div>`;
        }
    }
}, 10000);