// app-detail.js - صفحة تفاصيل التطبيق مع معرض صور أفقي

console.log('🚀 بدء تحميل app-detail.js');

let currentApp = null;
let galleryImages = [];
let currentImageIndex = 0;

function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

const appId = getAppIdFromURL();
if (!appId) {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    console.log('🔒 تم منع فهرسة الصفحة (لا يوجد ID)');
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
        let val = typeof r === 'object' ? r.rating : r;
        if (val >= 1 && val <= 5) distribution[Math.floor(val)]++;
    });
    
    let html = '';
    for (let star = 5; star >= 1; star--) {
        const count = distribution[star];
        const percent = total > 0 ? (count / total) * 100 : 0;
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

// دوال عرض الصور في النافذة المنبثقة
function openImageModal(index) {
    if (!galleryImages || galleryImages.length === 0) return;
    currentImageIndex = index;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    if (modal && modalImg) {
        modalImg.src = galleryImages[currentImageIndex];
        caption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
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

function nextImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    if (modalImg) {
        modalImg.src = galleryImages[currentImageIndex];
        caption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
    }
}

function prevImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    if (modalImg) {
        modalImg.src = galleryImages[currentImageIndex];
        caption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
    }
}

// دالة استخراج صور المعرض من التطبيق (تدعم عدة تنسيقات)
function extractGalleryImages(app) {
    let images = [];
    
    // محاولة الحصول على الصور من مصادر مختلفة
    if (app.gallery && Array.isArray(app.gallery) && app.gallery.length > 0) {
        console.log('✅ تم العثور على صور في app.gallery:', app.gallery);
        images = app.gallery;
    }
    // إذا كان هناك صور منفصلة (screenshots)
    else if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
        console.log('✅ تم العثور على صور في app.screenshots:', app.screenshots);
        images = app.screenshots;
    }
    // إذا كان هناك صور منفصلة (images)
    else if (app.images && Array.isArray(app.images) && app.images.length > 0) {
        console.log('✅ تم العثور على صور في app.images:', app.images);
        images = app.images;
    }
    // إذا كانت الصورة الرئيسية موجودة، نضيفها كصورة افتراضية
    else if (app.image && app.image.startsWith('http')) {
        console.log('⚠️ لا توجد صور معرض، سيتم استخدام الصورة الرئيسية');
        images = [app.image];
    }
    // إذا كان هناك أيقونة
    else if (app.icon && app.icon.startsWith('http')) {
        console.log('⚠️ لا توجد صور معرض، سيتم استخدام الأيقونة');
        images = [app.icon];
    }
    
    // تنظيف الصور (إزالة الروابط الفارغة أو غير الصالحة)
    images = images.filter(img => img && img.trim() !== '' && (img.startsWith('http') || img.startsWith('https') || img.startsWith('data:')));
    
    console.log(`📸 تم استخراج ${images.length} صورة للتطبيق:`, images);
    
    return images;
}

// دالة عرض معرض الصور الأفقي (مثل جوجل بلاي)
function renderHorizontalGallery(images) {
    if (!images || images.length === 0) {
        return `
            <div class="screenshots-section">
                <h3>📸 لقطات الشاشة</h3>
                <div style="background: #f8fafc; border-radius: 16px; padding: 40px; text-align: center; color: #64748b;">
                    📸 لا توجد صور مضافة للتطبيق
                    <br>
                    <small style="display: block; margin-top: 10px;">يمكن للمطور إضافة صور من خلال صفحة رفع التطبيق</small>
                </div>
            </div>
        `;
    }
    
    galleryImages = images;
    
    let html = `
        <div class="screenshots-section">
            <h3>📸 لقطات الشاشة (${images.length} صورة)</h3>
            <div class="screenshots-scroll">
    `;
    
    images.forEach((img, idx) => {
        html += `
            <div class="screenshot-item" onclick="openImageModal(${idx})">
                <img src="${img}" 
                     onerror="this.src='https://placehold.co/280x500/ef4444/white?text=خطأ+في+تحميل+الصورة'"
                     alt="لقطة شاشة ${idx + 1}">
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// عرض تفاصيل التطبيق
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
    
    console.log('✅ التطبيق:', app);
    console.log('📦 بيانات التطبيق الكاملة:', JSON.stringify(app, null, 2));
    
    currentApp = app;
    
    // استخراج صور المعرض
    const galleryImagesList = extractGalleryImages(app);
    
    const totalRatings = app.ratings ? app.ratings.length : 0;
    let avgRating = app.rating || 0;
    if (totalRatings > 0 && app.ratings) {
        const sum = app.ratings.reduce((s, r) => s + (typeof r === 'object' ? r.rating : r), 0);
        avgRating = (sum / totalRatings).toFixed(1);
    }
    
    // عرض معرض الصور الأفقي
    const galleryHtml = renderHorizontalGallery(galleryImagesList);
    
    const appComments = comments.filter(c => c.appId === app.id);
    let commentsHtml = appComments.length === 0 ? 
        '<p style="text-align:center;padding:30px;background:#f8fafc;border-radius:16px;">💬 لا توجد تعليقات بعد</p>' :
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
    
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    
    container.innerHTML = `
        <div class="app-detail-container">
            <div class="app-header">
                <div style="display:flex;flex-wrap:wrap;gap:30px;align-items:center;">
                    <img src="${appIcon}" class="app-icon-large" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    <div>
                        <h1 style="font-size:2rem;margin-bottom:10px;">${escapeHtml(app.name)}</h1>
                        <p style="opacity:0.9;">${escapeHtml(app.developer || app.userName || "مطور")}</p>
                        <div style="color:#fbbf24;font-size:1.2rem;margin:10px 0;">${renderStars(avgRating)}</div>
                        <div class="app-meta">
                            <span>⭐ ${avgRating}</span>
                            <span>📊 ${totalRatings} تقييم</span>
                            <span>📥 ${app.downloads || 0} تحميل</span>
                            <span>📱 ${escapeHtml(app.version || '1.0')}</span>
                            <span>💾 ${escapeHtml(app.size || 'غير محدد')}</span>
                            <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding:30px;">
                <button onclick="downloadApp(${app.id})" class="download-btn">📥 تحميل التطبيق</button>
                
                ${galleryHtml}
                
                <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:20px 0;">
                    <h2>📄 وصف التطبيق</h2>
                    <p style="line-height:1.8;">${escapeHtml(app.description || 'لا يوجد وصف للتطبيق')}</p>
                </div>
                
                <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:20px 0;">
                    <h3>📊 إحصائيات التقييمات</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:40px;align-items:center;">
                        <div style="text-align:center;">
                            <div style="font-size:4rem;font-weight:800;color:#fbbf24;">${avgRating}</div>
                            <div>${renderStars(avgRating)}</div>
                            <div>${totalRatings} تقييم</div>
                        </div>
                        <div style="flex:1;">${renderRatingBars(app.ratings || [])}</div>
                    </div>
                </div>
                
                <div>
                    <h2>💬 التعليقات</h2>
                    <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:20px 0;">
                        <input type="text" id="commentName" placeholder="اسمك" style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;" value="${currentUser ? escapeHtml(currentUser.username) : ''}">
                        <select id="commentRating" style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;">
                            <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                            <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                            <option value="3">⭐⭐⭐ جيد</option>
                            <option value="2">⭐⭐ مقبول</option>
                            <option value="1">⭐ ضعيف</option>
                        </select>
                        <textarea id="commentText" rows="3" placeholder="اكتب تعليقك..." style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;"></textarea>
                        <button onclick="addComment(${app.id})" class="submit-btn" style="width:auto;padding:10px 25px;">📝 إرسال</button>
                    </div>
                    <div id="commentsList">${commentsHtml}</div>
                </div>
            </div>
        </div>
    `;
}

async function addComment(appId) {
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
    showAlert('تم إضافة تعليقك!', 'success');
    document.getElementById('commentText').value = '';
    displayAppDetails();
}

// ربط الدوال بالـ window لاستخدامها في HTML
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.nextImage = nextImage;
window.prevImage = prevImage;
window.addComment = addComment;
window.downloadApp = downloadApp;

// انتظار تحميل البيانات
let checkInterval = setInterval(function() {
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(checkInterval);
        console.log('✅ تم تحميل البيانات، بدء عرض تفاصيل التطبيق');
        displayAppDetails();
    } else if (typeof apps !== 'undefined') {
        console.log('⏳ انتظار تحميل البيانات... عدد التطبيقات:', apps.length);
    } else {
        console.log('⏳ انتظار تحميل المتغير apps...');
    }
}, 500);