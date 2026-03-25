// app-detail.js - صفحة تفاصيل التطبيق مع عرض الصور

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

// دوال معرض الصور
function openImageModal(index) {
    if (!galleryImages || galleryImages.length === 0) {
        console.log('⚠️ لا توجد صور للعرض');
        return;
    }
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
    if (galleryImages && galleryImages.length && currentImageIndex > 0) {
        currentImageIndex--;
        const modalImg = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');
        if (modalImg) modalImg.src = galleryImages[currentImageIndex];
        if (modalCaption) modalCaption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
    }
}

function nextImage() {
    if (galleryImages && galleryImages.length && currentImageIndex < galleryImages.length - 1) {
        currentImageIndex++;
        const modalImg = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');
        if (modalImg) modalImg.src = galleryImages[currentImageIndex];
        if (modalCaption) modalCaption.innerHTML = `صورة ${currentImageIndex + 1} من ${galleryImages.length}`;
    }
}

// دالة عرض معرض الصور
function renderGallery(images) {
    console.log('🎨 عرض معرض الصور، الصور المستلمة:', images);
    
    if (!images || images.length === 0) {
        console.log('⚠️ لا توجد صور لعرضها');
        return '<div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 16px; text-align: center; color: #64748b;">📸 لا توجد صور مضافة للتطبيق</div>';
    }
    
    // تصفية الصور الفارغة
    const validImages = images.filter(img => img && img.trim() !== '');
    
    if (validImages.length === 0) {
        return '<div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 16px; text-align: center; color: #64748b;">📸 لا توجد صور مضافة للتطبيق</div>';
    }
    
    galleryImages = validImages;
    console.log('✅ تم تحميل الصور بنجاح، عددها:', validImages.length);
    
    // إذا كانت صورة واحدة فقط
    if (validImages.length === 1) {
        return `
            <div style="margin: 20px 0 30px 0;">
                <h3 style="margin-bottom: 15px; color: #2d3748; font-size: 1.1rem;">📸 صور من التطبيق</h3>
                <div style="background: #f8fafc; border-radius: 16px; padding: 15px;">
                    <div style="cursor: pointer;" onclick="openImageModal(0)">
                        <img src="${validImages[0]}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;" onerror="this.src='https://placehold.co/600x300/cccccc/white?text=Image+Error'">
                    </div>
                </div>
            </div>
        `;
    }
    
    // عرض الصور على شكل شبكة
    let html = `
        <div style="margin: 20px 0 30px 0;">
            <h3 style="margin-bottom: 15px; color: #2d3748; font-size: 1.1rem;">📸 صور من التطبيق (${validImages.length} صور)</h3>
            <div style="background: #f8fafc; border-radius: 16px; padding: 15px;">
                <!-- الصورة الرئيسية الكبيرة -->
                <div style="margin-bottom: 15px; cursor: pointer;" onclick="openImageModal(0)">
                    <img src="${validImages[0]}" style="width: 100%; height: 350px; object-fit: cover; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" onerror="this.src='https://placehold.co/800x350/cccccc/white?text=Image+Error'">
                </div>
                
                <!-- الصور المصغرة -->
                <div style="display: flex; gap: 12px; overflow-x: auto; padding: 5px 0;">
    `;
    
    validImages.forEach((img, idx) => {
        html += `
            <div style="flex-shrink: 0; cursor: pointer;" onclick="openImageModal(${idx})">
                <img src="${img}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; border: ${idx === 0 ? '3px solid #667eea' : '2px solid #e2e8f0'}; transition: all 0.2s;" onerror="this.src='https://placehold.co/100x100/cccccc/white?text=Error'">
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// دالة عرض تفاصيل التطبيق
function displayAppDetails() {
    console.log('🎨 بدء عرض تفاصيل التطبيق');
    
    const container = document.getElementById('appContent');
    if (!container) {
        console.error('❌ عنصر appContent غير موجود');
        return;
    }
    
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
    
    console.log('✅ تم العثور على التطبيق:', app.name);
    console.log('📸 معرض الصور في التطبيق:', app.gallery);
    console.log('📸 عدد الصور:', app.gallery ? app.gallery.length : 0);
    
    currentApp = app;
    const totalRatings = app.ratings.length;
    const ratingsSum = app.ratings.reduce((sum, r) => sum + (typeof r === 'object' ? r.rating : r), 0);
    const avgRating = totalRatings > 0 ? (ratingsSum / totalRatings).toFixed(1) : app.rating.toFixed(1);
    
    // معرض الصور
    const galleryHtml = renderGallery(app.gallery);
    
    // التعليقات
    const appComments = comments.filter(c => c.appId === app.id);
    let commentsHtml = appComments.length === 0 ? 
        '<p style="text-align:center;padding:30px;background:#f8fafc;border-radius:16px;">💬 لا توجد تعليقات بعد. كن أول من يعلق!</p>' :
        appComments.map(c => `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 15px;">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px;color:#64748b;">
                    <span><strong>${escapeHtml(c.username)}</strong></span>
                    <span style="color:#fbbf24;">${renderStars(c.rating)}</span>
                    <span>${new Date(c.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div>${escapeHtml(c.comment)}</div>
            </div>
        `).join('');
    
    // تطبيقات مشابهة
    const similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    const similarHtml = similarApps.length ? `
        <div style="margin-top: 40px;">
            <h3 style="margin-bottom: 15px; color: #2d3748;">📱 تطبيقات مشابهة</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${similarApps.map(s => `
                    <div onclick="openAppDetail(${s.id})" style="background: #f8fafc; border-radius: 12px; padding: 10px; cursor: pointer; text-align: center; transition: all 0.3s;">
                        <img src="${s.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://placehold.co/200x100/cccccc/white?text=No+Image'">
                        <div style="font-weight: bold; margin-top: 8px;">${escapeHtml(s.name)}</div>
                        <div style="color: #fbbf24;">⭐ ${s.rating.toFixed(1)}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">📥 ${s.downloads}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    
    // عرض الصفحة الكاملة
    container.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white;">
                <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                    <img src="${appIcon}" style="width: 120px; height: 120px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); object-fit: cover;" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    <div style="flex: 1;">
                        <h1 style="font-size: 2rem; margin-bottom: 10px;">${escapeHtml(app.name)}</h1>
                        <p style="opacity: 0.9;">${escapeHtml(app.developer || app.userName || "مطور غير معروف")}</p>
                        <div style="color: #fbbf24; font-size: 1.2rem; margin: 10px 0;">${renderStars(avgRating)}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px;">⭐ ${avgRating}</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px;">📊 ${totalRatings} تقييم</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px;">📥 ${app.downloads} تحميل</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px;">📱 ${escapeHtml(app.version)}</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px;">💾 ${escapeHtml(app.size)}</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px;">${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <!-- زر التحميل -->
                <div style="margin-bottom: 30px;">
                    <button onclick="downloadApp(${app.id})" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 15px 50px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: all 0.3s; box-shadow: 0 5px 15px rgba(16,185,129,0.3); width: 100%;">
                        📥 تحميل التطبيق
                    </button>
                </div>
                
                <!-- معرض الصور -->
                ${galleryHtml}
                
                <!-- وصف التطبيق -->
                <div style="background: #f8fafc; border-radius: 16px; padding: 25px; margin: 25px 0;">
                    <h2 style="margin-bottom: 15px; color: #2d3748;">📄 وصف التطبيق</h2>
                    <p style="line-height: 1.8; color: #4a5568;">${escapeHtml(app.description)}</p>
                </div>
                
                <!-- إحصائيات التقييمات -->
                <div style="background: #f8fafc; border-radius: 16px; padding: 25px; margin: 25px 0;">
                    <h3 style="margin-bottom: 20px; color: #2d3748;">📊 إحصائيات التقييمات</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 4rem; font-weight: 800; color: #fbbf24;">${avgRating}</div>
                            <div style="color: #fbbf24; font-size: 1.2rem;">${renderStars(avgRating)}</div>
                            <div style="color: #64748b; margin-top: 5px;">${totalRatings} تقييم</div>
                        </div>
                        <div style="flex: 1;">
                            ${renderRatingBars(app.ratings)}
                        </div>
                    </div>
                </div>
                
                <!-- التعليقات -->
                <div style="margin-top: 30px;">
                    <h2 style="margin-bottom: 20px; color: #2d3748;">💬 آراء المستخدمين</h2>
                    
                    <!-- نموذج إضافة تعليق -->
                    <div style="background: #f8fafc; border-radius: 16px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="margin-bottom: 15px;">✍️ أضف تعليقك</h3>
                        <input type="text" id="commentName" placeholder="اسمك" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit;" ${currentUser ? `value="${escapeHtml(currentUser.username)}"` : ''}>
                        <select id="commentRating" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                            <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                            <option value="3">⭐⭐⭐ جيد</option>
                            <option value="2">⭐⭐ مقبول</option>
                            <option value="1">⭐ ضعيف</option>
                        </select>
                        <textarea id="commentText" rows="3" placeholder="اكتب تعليقك هنا..." style="width: 100%; padding: 12px; margin-bottom: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit;"></textarea>
                        <button onclick="addNewComment(${app.id})" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 12px; cursor: pointer; font-weight: bold;">📝 إرسال التعليق</button>
                    </div>
                    
                    <div id="commentsList">${commentsHtml}</div>
                </div>
                
                ${similarHtml}
            </div>
        </div>
    `;
    
    console.log('✅ تم عرض صفحة التفاصيل بنجاح');
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

// إضافة دالة لفتح الصور إلى النافذة العامة
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.prevImage = prevImage;
window.nextImage = nextImage;

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
        console.log('✅ البيانات جاهزة، عدد التطبيقات:', apps.length);
        displayAppDetails();
    } else {
        console.log('⏳ انتظار تحميل البيانات...');
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