// app-details.js - صفحة تفاصيل التطبيق

let currentApp = null;
let selectedRating = 0;

function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function waitForApps() {
    return new Promise((resolve) => {
        let check = setInterval(() => {
            if (typeof apps !== "undefined" && apps.length > 0) {
                clearInterval(check);
                resolve();
            }
        }, 200);
    });
}

function renderStars(rating = 0) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? "⭐" : "☆";
    }
    return stars;
}

function getRatingDistribution(ratings) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
        let ratingValue = typeof r === 'object' ? r.rating : r;
        if (ratingValue >= 1 && ratingValue <= 5) {
            distribution[Math.floor(ratingValue)]++;
        }
    });
    return distribution;
}

function renderRatingBars(ratings) {
    const total = ratings.length;
    const distribution = getRatingDistribution(ratings);
    
    if (total === 0) {
        return '<p style="text-align:center;">لا توجد تقييمات بعد</p>';
    }
    
    let html = '';
    for (let star = 5; star >= 1; star--) {
        const count = distribution[star];
        const percentage = total > 0 ? (count / total) * 100 : 0;
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

function loadComments(appId) {
    const saved = localStorage.getItem("comments_" + appId);
    return saved ? JSON.parse(saved) : [];
}

function saveComment(appId, comment) {
    let comments = loadComments(appId);
    comments.unshift(comment);
    localStorage.setItem("comments_" + appId, JSON.stringify(comments));
}

function displayComments(appId) {
    let comments = loadComments(appId);
    let container = document.getElementById("commentsList");
    
    if (!container) return;
    
    if (!comments.length) {
        container.innerHTML = '<p style="text-align:center; padding:30px;">💬 لا توجد تعليقات بعد. كن أول من يعلق!</p>';
        return;
    }
    
    container.innerHTML = comments.map(c => `
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 10px; color: #64748b;">
                <span><strong>${escapeHtml(c.name)}</strong></span>
                <span style="color: #fbbf24;">${renderStars(c.rating)}</span>
                <span>${new Date(c.date).toLocaleDateString('ar-EG')}</span>
            </div>
            <div>${escapeHtml(c.text)}</div>
        </div>
    `).join("");
}

function addComment(appId) {
    const name = document.getElementById("userName")?.value.trim();
    const text = document.getElementById("commentText")?.value.trim();
    const rating = document.getElementById("rating")?.value;
    
    if (!name) {
        showAlert("يرجى إدخال اسمك", "error");
        return;
    }
    
    if (!text) {
        showAlert("يرجى كتابة تعليقك", "error");
        return;
    }
    
    const newComment = {
        name: name,
        text: text,
        rating: parseInt(rating),
        date: new Date().toISOString()
    };
    
    saveComment(appId, newComment);
    displayComments(appId);
    
    if (document.getElementById("commentText")) document.getElementById("commentText").value = "";
    if (document.getElementById("rating")) document.getElementById("rating").value = "5";
    
    showAlert("تم إضافة تعليقك بنجاح!", "success");
}

function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.rating-section span');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#fbbf24' : '#cbd5e1';
    });
}

async function submitRating(appId) {
    if (!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    if (!selectedRating) {
        showAlert('يرجى اختيار التقييم بالنجوم', 'error');
        return;
    }
    
    const app = apps.find(a => a.id == appId);
    if (!app) return;
    
    if (app.ratings.some(r => {
        if (typeof r === 'object') return r.userId === currentUser.id;
        return false;
    })) {
        showAlert('لقد قمت بتقييم هذا التطبيق بالفعل', 'error');
        return;
    }
    
    app.ratings.push({
        userId: currentUser.id,
        rating: selectedRating,
        date: new Date().toISOString()
    });
    
    const ratingsValues = app.ratings.map(r => typeof r === 'object' ? r.rating : r);
    const total = ratingsValues.reduce((sum, r) => sum + r, 0);
    app.rating = total / ratingsValues.length;
    
    await saveApps();
    showAlert('تم إضافة تقييمك بنجاح!', 'success');
    displayAppDetails();
}

function openImageModal(imgSrc) {
    const modal = document.getElementById('adModal');
    const content = document.getElementById('modalAdContent');
    if (modal && content) {
        content.innerHTML = `<img src="${imgSrc}" style="max-width:100%; border-radius:12px;">`;
        modal.style.display = 'flex';
    }
}

async function displayAppDetails() {
    await waitForApps();
    
    const appId = getAppIdFromURL();
    const app = apps.find(a => a.id == appId);
    const container = document.getElementById("appDetails");
    
    if (!app) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <h1 style="font-size: 3rem;">😕</h1>
                <p style="color: #64748b; margin: 15px 0;">التطبيق غير موجود</p>
                <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px;">📱 استعراض التطبيقات</a>
            </div>
        `;
        return;
    }
    
    currentApp = app;
    
    const ratingsValues = app.ratings.map(r => typeof r === 'object' ? r.rating : r);
    const totalRatings = ratingsValues.length;
    const avgRating = totalRatings > 0 ? (ratingsValues.reduce((a,b) => a + b, 0) / totalRatings).toFixed(1) : app.rating.toFixed(1);
    
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
    
    const hasUserRated = currentUser ? app.ratings.some(r => {
        if (typeof r === 'object') return r.userId === currentUser.id;
        return false;
    }) : false;
    
    let ratingSectionHtml = '';
    if (currentUser && !hasUserRated) {
        ratingSectionHtml = `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                <h3>⭐ قيم هذا التطبيق</h3>
                <div style="display: flex; gap: 10px; margin: 15px 0;">
                    ${[1,2,3,4,5].map(star => `
                        <span onclick="setRating(${star})" style="font-size: 2rem; cursor: pointer; color: ${selectedRating >= star ? '#fbbf24' : '#cbd5e1'};">★</span>
                    `).join('')}
                </div>
                <button onclick="submitRating(${app.id})" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 25px; border-radius: 12px; cursor: pointer;">إرسال التقييم</button>
            </div>
        `;
    } else if (currentUser && hasUserRated) {
        ratingSectionHtml = `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                <p style="color: #10b981; text-align: center;">✅ لقد قمت بتقييم هذا التطبيق بالفعل. شكراً لك!</p>
            </div>
        `;
    } else if (!currentUser) {
        ratingSectionHtml = `
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
                <p style="text-align: center;">🔐 <a href="login.html" style="color: #667eea;">سجل الدخول</a> لتقييم هذا التطبيق</p>
            </div>
        `;
    }
    
    let similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    let similarAppsHtml = '';
    if (similarApps.length > 0) {
        similarAppsHtml = `
            <div style="margin-top: 40px;">
                <h3>📱 تطبيقات مشابهة</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    ${similarApps.map(similar => `
                        <div onclick="openAppDetails(${similar.id})" style="background: #f8fafc; border-radius: 12px; padding: 10px; cursor: pointer; text-align: center;">
                            <img src="${similar.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://placehold.co/200x100/cccccc/white?text=No+Image'">
                            <div style="font-weight: bold; margin-top: 8px;">${escapeHtml(similar.name)}</div>
                            <div style="color: #fbbf24;">⭐ ${similar.rating.toFixed(1)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
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
            
            ${ratingSectionHtml}
            
            <div style="margin-top: 30px;">
                <h2>💬 التعليقات</h2>
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-top: 20px;">
                    <input type="text" id="userName" placeholder="اسمك" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 12px;" ${currentUser ? `value="${escapeHtml(currentUser.username)}"` : ''}>
                    <select id="rating" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 12px;">
                        <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                        <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                        <option value="3">⭐⭐⭐ جيد</option>
                        <option value="2">⭐⭐ مقبول</option>
                        <option value="1">⭐ ضعيف</option>
                    </select>
                    <textarea id="commentText" rows="3" placeholder="اكتب تعليقك..." style="width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit;"></textarea>
                    <button onclick="addComment('${app.id}')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 25px; border-radius: 12px; cursor: pointer;">📝 إرسال التعليق</button>
                </div>
                
                <div id="commentsList" style="margin-top: 20px;"></div>
            </div>
            
            ${similarAppsHtml}
        </div>
    `;
    
    displayComments(app.id);
}

displayAppDetails();