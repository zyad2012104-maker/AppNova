// app-detail.js - صفحة تفاصيل التطبيق

let currentApp = null;
let selectedRating = 0;
let appId = null;
let appContent = document.getElementById('appContent');

function showLoading() {
    if (appContent) {
        appContent.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <div style="width: 60px; height: 60px; border: 4px solid #e2e8f0; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h3>🔄 جاري تحميل بيانات التطبيق...</h3>
                <p style="color: #64748b; margin-top: 10px;">يرجى الانتظار قليلاً</p>
            </div>
        `;
    }
}

function showError(message) {
    if (appContent) {
        appContent.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <h1 style="font-size: 3rem;">😕</h1>
                <p style="color: #64748b; margin: 15px 0;">${message}</p>
                <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px;">📱 استعراض التطبيقات</a>
            </div>
        `;
    }
}

function getRatingDistribution(ratings) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
        if (r >= 1 && r <= 5) distribution[r]++;
    });
    return distribution;
}

function renderAppDetail() {
    if (!currentApp) {
        showError('لم يتم العثور على التطبيق');
        return;
    }
    
    console.log('🎨 عرض تفاصيل التطبيق:', currentApp.name);
    
    const totalRatings = currentApp.ratings.length;
    const distribution = getRatingDistribution(currentApp.ratings);
    
    const getPercentage = (count) => totalRatings === 0 ? 0 : (count / totalRatings) * 100;
    
    const ratingBarsHtml = [5, 4, 3, 2, 1].map(star => {
        const count = distribution[star];
        const percentage = getPercentage(count);
        return `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="width: 60px; color: #fbbf24;">${'★'.repeat(star)}</div>
                <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: #fbbf24; border-radius: 4px;"></div>
                </div>
                <div style="width: 40px; color: #64748b;">${count}</div>
            </div>
        `;
    }).join('');
    
    let galleryHtml = '';
    if (currentApp.gallery && currentApp.gallery.length > 0) {
        galleryHtml = `
            <div style="margin: 30px 0;">
                <h3>📸 صور من التطبيق</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                    ${currentApp.gallery.map(img => `<img src="${img}" onclick="openImageModal('${img}')" onerror="this.style.display='none'" style="width: 100%; height: 150px; object-fit: cover; border-radius: 12px; cursor: pointer;">`).join('')}
                </div>
            </div>
        `;
    }
    
    const appImage = currentApp.image && currentApp.image.startsWith('http') 
        ? currentApp.image 
        : 'https://placehold.co/300x300/667eea/white?text=' + encodeURIComponent(currentApp.name);
    
    const fullStars = Math.floor(currentApp.rating);
    const halfStar = (currentApp.rating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '★';
    if (halfStar) starsHtml += '½';
    for (let i = 0; i < emptyStars; i++) starsHtml += '☆';
    
    const appComments = comments.filter(c => c.appId === currentApp.id).reverse();
    let commentsHtml = '';
    
    if (appComments.length === 0) {
        commentsHtml = '<p style="text-align:center; padding:30px; background:#f8fafc; border-radius:16px;">📝 لا توجد تعليقات بعد. كن أول من يقيم هذا التطبيق!</p>';
    } else {
        commentsHtml = appComments.map(comment => `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 10px; color: #64748b;">
                    <span><strong>${escapeHtml(comment.username)}</strong></span>
                    <span style="color: #fbbf24;">${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</span>
                    <span>${new Date(comment.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div>${escapeHtml(comment.comment)}</div>
            </div>
        `).join('');
    }
    
    const hasUserRated = currentUser ? comments.some(c => c.appId === currentApp.id && c.userId === currentUser.id) : false;
    
    let writeReviewHtml = '';
    if (!hasUserRated && currentUser) {
        writeReviewHtml = `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-top: 20px;">
                <h3>✍️ اكتب تقييمك</h3>
                <textarea id="reviewText" rows="3" placeholder="شارك تجربتك مع هذا التطبيق..." style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit;"></textarea>
                <div style="display: flex; gap: 8px; margin: 15px 0;">
                    <span onclick="setSelectedRating(1)" style="font-size: 2rem; cursor: pointer; color: #cbd5e1;">★</span>
                    <span onclick="setSelectedRating(2)" style="font-size: 2rem; cursor: pointer; color: #cbd5e1;">★</span>
                    <span onclick="setSelectedRating(3)" style="font-size: 2rem; cursor: pointer; color: #cbd5e1;">★</span>
                    <span onclick="setSelectedRating(4)" style="font-size: 2rem; cursor: pointer; color: #cbd5e1;">★</span>
                    <span onclick="setSelectedRating(5)" style="font-size: 2rem; cursor: pointer; color: #cbd5e1;">★</span>
                </div>
                <button onclick="submitReview()" class="submit-btn" style="margin-top: 10px; width: auto; padding: 10px 25px;">📝 نشر التقييم</button>
            </div>
        `;
    } else if (!currentUser) {
        writeReviewHtml = `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-top: 20px; text-align: center;">
                <p>🔐 <a href="login.html" style="color: #667eea;">سجل الدخول</a> لتقييم هذا التطبيق</p>
            </div>
        `;
    } else if (hasUserRated) {
        writeReviewHtml = `
            <div style="background: #e6f7e6; border-radius: 16px; padding: 20px; margin-top: 20px;">
                <p style="color: #10b981; text-align: center;">✅ لقد قمت بتقييم هذا التطبيق بالفعل. شكراً لمشاركتك رأيك!</p>
            </div>
        `;
    }
    
    // اقتراح تطبيقات مشابهة
    let similarApps = apps.filter(a => a.category === currentApp.category && a.id !== currentApp.id).slice(0, 4);
    let similarAppsHtml = '';
    if (similarApps.length > 0) {
        similarAppsHtml = `
            <div style="margin-top: 40px;">
                <h3>📱 تطبيقات مشابهة</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    ${similarApps.map(app => `
                        <div onclick="openAppDetail(${app.id})" style="background: #f8fafc; border-radius: 12px; padding: 10px; cursor: pointer; text-align: center;">
                            <img src="${app.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://placehold.co/200x100/cccccc/white?text=No+Image'">
                            <div style="font-weight: bold; margin-top: 8px;">${escapeHtml(app.name)}</div>
                            <div style="color: #fbbf24; font-size: 0.8rem;">⭐ ${app.rating.toFixed(1)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    const html = `
        <div style="max-width: 1200px; margin: 0 auto; background: white; border-radius: 25px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white;">
                <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                    <div style="flex-shrink: 0;">
                        <img src="${appImage}" style="width: 120px; height: 120px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    </div>
                    <div style="flex: 1;">
                        <h1 style="font-size: 2rem; margin-bottom: 10px;">${escapeHtml(currentApp.name)}</h1>
                        <p style="opacity: 0.9;">${escapeHtml(currentApp.description.substring(0, 150))}${currentApp.description.length > 150 ? '...' : ''}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px;">
                            <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">⭐ ${currentApp.rating.toFixed(1)}</div>
                            <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">📊 ${totalRatings} تقييم</div>
                            <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">💬 ${appComments.length} تعليق</div>
                            <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">📥 ${currentApp.downloads} تحميل</div>
                            <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">📱 الإصدار ${escapeHtml(currentApp.version)}</div>
                            <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">💾 ${escapeHtml(currentApp.size)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 2;">
                        <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                            <h3>📝 وصف التطبيق</h3>
                            <p style="line-height: 1.8; margin-top: 10px;">${escapeHtml(currentApp.description)}</p>
                        </div>
                        
                        ${galleryHtml}
                        
                        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
                            <h3>💬 آراء المستخدمين</h3>
                            ${commentsHtml}
                            ${writeReviewHtml}
                        </div>
                    </div>
                    
                    <div style="flex: 1;">
                        <button onclick="downloadApp(${currentApp.id})" class="download-btn" style="width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 15px; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-bottom: 20px;">📥 تحميل التطبيق</button>
                        
                        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
                            <h3>📊 التقييمات</h3>
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="font-size: 3rem; font-weight: 800; color: #fbbf24;">${currentApp.rating.toFixed(1)}</div>
                                <div style="color: #fbbf24; font-size: 1.2rem;">${starsHtml}</div>
                                <div style="color: #64748b;">${totalRatings} تقييم</div>
                            </div>
                            ${ratingBarsHtml}
                        </div>
                        
                        <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-top: 20px;">
                            <h3>ℹ️ معلومات إضافية</h3>
                            <p><strong>📅 تاريخ النشر:</strong> ${new Date(currentApp.date).toLocaleDateString('ar-EG')}</p>
                            <p><strong>👨‍💻 المطور:</strong> ${escapeHtml(currentApp.userName)}</p>
                            <p><strong>🏷️ التصنيف:</strong> ${getCategoryIcon(currentApp.category)} ${getCategoryName(currentApp.category)}</p>
                            <p><strong>📱 نظام التشغيل:</strong> ${currentApp.deviceType === 'android' ? '🤖 Android' : currentApp.deviceType === 'ios' ? '🍎 iOS' : '📱 كلا النظامين'}</p>
                        </div>
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button onclick="shareApp()" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">📤 مشاركة</button>
                            <button onclick="copyAppLink()" style="flex: 1; background: #64748b; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">🔗 نسخ الرابط</button>
                        </div>
                    </div>
                </div>
                ${similarAppsHtml}
            </div>
        </div>
    `;
    
    appContent.innerHTML = html;
}

function setSelectedRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.write-review span');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#fbbf24' : '#cbd5e1';
    });
}

async function submitReview() {
    if (!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const comment = document.getElementById('reviewText')?.value.trim();
    if (!comment) {
        showAlert('يرجى كتابة تعليقك', 'error');
        return;
    }
    
    if (!selectedRating) {
        showAlert('يرجى اختيار التقييم بالنجوم', 'error');
        return;
    }
    
    if (comments.some(c => c.appId === currentApp.id && c.userId === currentUser.id)) {
        showAlert('لقد قمت بتقييم هذا التطبيق بالفعل', 'error');
        return;
    }
    
    currentApp.ratings.push(selectedRating);
    currentApp.rating = currentApp.ratings.reduce((s, r) => s + r, 0) / currentApp.ratings.length;
    
    comments.push({
        id: Date.now(),
        appId: currentApp.id,
        userId: currentUser.id,
        username: currentUser.username,
        comment: comment,
        rating: selectedRating,
        date: new Date().toISOString()
    });
    
    await saveApps();
    await saveComments();
    
    showAlert('تم إضافة تقييمك بنجاح!', 'success');
    renderAppDetail();
}

function openImageModal(imgSrc) {
    const modal = document.getElementById('adModal');
    const content = document.getElementById('modalAdContent');
    if (modal && content) {
        content.innerHTML = `<img src="${imgSrc}" style="max-width:100%; border-radius:12px;">`;
        modal.style.display = 'flex';
    }
}

function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: currentApp.name,
            text: currentApp.description,
            url: window.location.href
        });
    } else {
        copyAppLink();
    }
}

function copyAppLink() {
    navigator.clipboard.writeText(window.location.href);
    showAlert('تم نسخ رابط التطبيق', 'success');
}

function loadApp() {
    const urlParams = new URLSearchParams(window.location.search);
    appId = parseInt(urlParams.get('id'));
    
    console.log('🔍 معرف التطبيق:', appId);
    console.log('📱 عدد التطبيقات:', apps.length);
    
    if (!appId || isNaN(appId)) {
        showError('معرّف التطبيق غير صحيح');
        return;
    }
    
    currentApp = apps.find(a => a.id === appId);
    
    if (!currentApp) {
        showError(`لم نتمكن من العثور على التطبيق المطلوب`);
        return;
    }
    
    renderAppDetail();
}

// الانتظار حتى يتم تحميل البيانات
showLoading();
let detailInterval = setInterval(() => {
    if (typeof apps !== 'undefined' && jsonbinReady) {
        clearInterval(detailInterval);
        loadApp();
    }
}, 100);