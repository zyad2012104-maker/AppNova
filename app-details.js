// app-details.js
let currentApp = null;
let selectedRating = 0;

function getAppIdFromURL() { const params = new URLSearchParams(window.location.search); return params.get("id"); }

function waitForApps() { return new Promise((resolve) => { let check = setInterval(() => { if (typeof apps !== "undefined" && apps.length > 0) { clearInterval(check); resolve(); } }, 200); }); }

function renderStars(rating = 0) { let stars = ""; for (let i = 1; i <= 5; i++) { stars += i <= Math.round(rating) ? "⭐" : "☆"; } return stars; }

function getRatingDistribution(ratings) { const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }; ratings.forEach(r => { let ratingValue = typeof r === 'object' ? r.rating : r; if (ratingValue >= 1 && ratingValue <= 5) { distribution[Math.floor(ratingValue)]++; } }); return distribution; }

function renderRatingBars(ratings) {
    const total = ratings.length; const distribution = getRatingDistribution(ratings);
    if (total === 0) return '<p style="text-align:center;">لا توجد تقييمات بعد</p>';
    let html = '';
    for (let star = 5; star >= 1; star--) {
        const count = distribution[star]; const percentage = total > 0 ? (count / total) * 100 : 0;
        html += `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;"><div style="width: 60px; color: #fbbf24;">${'★'.repeat(star)}</div><div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;"><div style="width: ${percentage}%; height: 100%; background: #fbbf24; border-radius: 4px;"></div></div><div style="width: 40px; color: #64748b;">${count}</div></div>`;
    }
    return html;
}

function loadComments(appId) { const saved = localStorage.getItem("comments_" + appId); return saved ? JSON.parse(saved) : []; }
function saveComment(appId, comment) { let comments = loadComments(appId); comments.unshift(comment); localStorage.setItem("comments_" + appId, JSON.stringify(comments)); }

function displayComments(appId) {
    let comments = loadComments(appId); let container = document.getElementById("commentsList");
    if (!container) return;
    if (!comments.length) { container.innerHTML = '<p style="text-align:center; padding:30px;">💬 لا توجد تعليقات بعد. كن أول من يعلق!</p>'; return; }
    container.innerHTML = comments.map(c => `<div class="comment-card"><div class="comment-header"><span><strong>${escapeHtml(c.name)}</strong></span><span class="comment-rating">${renderStars(c.rating)}</span><span>${new Date(c.date).toLocaleDateString('ar-EG')}</span></div><div>${escapeHtml(c.text)}</div></div>`).join("");
}

function addComment(appId) {
    const name = document.getElementById("userName")?.value.trim(); const text = document.getElementById("commentText")?.value.trim(); const rating = document.getElementById("rating")?.value;
    if (!name) { showAlert("يرجى إدخال اسمك", "error"); return; }
    if (!text) { showAlert("يرجى كتابة تعليقك", "error"); return; }
    saveComment(appId, { name, text, rating: parseInt(rating), date: new Date().toISOString() });
    displayComments(appId);
    if (document.getElementById("commentText")) document.getElementById("commentText").value = "";
    showAlert("تم إضافة تعليقك بنجاح!", "success");
}

function setRating(rating) { selectedRating = rating; const stars = document.querySelectorAll('.rating-section span'); stars.forEach((star, index) => { star.style.color = index < rating ? '#fbbf24' : '#cbd5e1'; }); }

async function submitRating(appId) {
    if (!currentUser) { showAlert('يرجى تسجيل الدخول أولاً', 'error'); window.location.href = 'login.html'; return; }
    if (!selectedRating) { showAlert('يرجى اختيار التقييم بالنجوم', 'error'); return; }
    const app = apps.find(a => a.id == appId); if (!app) return;
    if (app.ratings.some(r => { if (typeof r === 'object') return r.userId === currentUser.id; return false; })) { showAlert('لقد قمت بتقييم هذا التطبيق بالفعل', 'error'); return; }
    app.ratings.push({ userId: currentUser.id, rating: selectedRating, date: new Date().toISOString() });
    const ratingsValues = app.ratings.map(r => typeof r === 'object' ? r.rating : r);
    app.rating = ratingsValues.reduce((sum, r) => sum + r, 0) / ratingsValues.length;
    await saveApps(); showAlert('تم إضافة تقييمك بنجاح!', 'success'); displayAppDetails();
}

async function displayAppDetails() {
    await waitForApps();
    const appId = getAppIdFromURL(); const app = apps.find(a => a.id == appId); const container = document.getElementById("appDetails");
    if (!app) { container.innerHTML = `<div style="text-align: center; padding: 60px;"><h1>😕</h1><p>التطبيق غير موجود</p><a href="apps.html" class="submit-btn">📱 استعراض التطبيقات</a></div>`; return; }
    currentApp = app;
    const ratingsValues = app.ratings.map(r => typeof r === 'object' ? r.rating : r);
    const totalRatings = ratingsValues.length;
    const avgRating = totalRatings > 0 ? (ratingsValues.reduce((a,b) => a + b, 0) / totalRatings).toFixed(1) : app.rating.toFixed(1);
    let galleryHtml = '';
    if (app.gallery && app.gallery.length > 0) { galleryHtml = `<div style="margin: 30px 0;"><h3>📸 صور من التطبيق</h3><div class="gallery-grid">${app.gallery.map(img => `<img src="${img}" onclick="openImageModal('${img}')" onerror="this.style.display='none'">`).join('')}</div></div>`; }
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    const hasUserRated = currentUser ? app.ratings.some(r => { if (typeof r === 'object') return r.userId === currentUser.id; return false; }) : false;
    let ratingSectionHtml = '';
    if (currentUser && !hasUserRated) { ratingSectionHtml = `<div class="rating-section" style="background:#f8fafc;border-radius:16px;padding:20px;margin:20px 0;"><h3>⭐ قيم هذا التطبيق</h3><div style="display:flex;gap:10px;margin:15px 0;">${[1,2,3,4,5].map(star => `<span onclick="setRating(${star})" style="font-size:2rem;cursor:pointer;color:${selectedRating >= star ? '#fbbf24' : '#cbd5e1'};">★</span>`).join('')}</div><button onclick="submitRating(${app.id})" class="submit-btn" style="width:auto;padding:10px 25px;">إرسال التقييم</button></div>`; }
    else if (currentUser && hasUserRated) { ratingSectionHtml = `<div style="background:#f8fafc;border-radius:16px;padding:20px;margin:20px 0;"><p style="color:#10b981;text-align:center;">✅ لقد قمت بتقييم هذا التطبيق بالفعل. شكراً لك!</p></div>`; }
    else if (!currentUser) { ratingSectionHtml = `<div style="background:#f8fafc;border-radius:16px;padding:20px;margin:20px 0;"><p style="text-align:center;">🔐 <a href="login.html" style="color:#667eea;">سجل الدخول</a> لتقييم هذا التطبيق</p></div>`; }
    let similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    let similarAppsHtml = '';
    if (similarApps.length > 0) { similarAppsHtml = `<div style="margin-top:40px;"><h3>📱 تطبيقات مشابهة</h3><div class="similar-grid">${similarApps.map(similar => `<div class="similar-card" onclick="openAppDetails(${similar.id})"><img src="${similar.image}" onerror="this.src='https://placehold.co/200x100/cccccc/white?text=No+Image'"><div style="font-weight:bold;margin-top:8px;">${escapeHtml(similar.name)}</div><div style="color:#fbbf24;">⭐ ${similar.rating.toFixed(1)}</div></div>`).join('')}</div></div>`; }
    container.innerHTML = `<div class="app-header"><div class="app-header-content"><img src="${appIcon}" class="app-icon-large" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'"><div class="app-info"><h1>${escapeHtml(app.name)}</h1><p>${escapeHtml(app.developer || app.userName || "مطور غير معروف")}</p><div class="stars">${renderStars(avgRating)}</div><div class="app-meta"><span>⭐ ${avgRating}</span><span>📊 ${totalRatings} تقييم</span><span>📥 ${app.downloads} تحميل</span><span>📱 ${escapeHtml(app.version)}</span><span>💾 ${escapeHtml(app.size)}</span><span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span></div></div></div></div><div class="app-body"><div style="margin-bottom:30px;"><button onclick="downloadApp(${app.id})" class="download-btn">📥 تحميل التطبيق</button></div>${galleryHtml}<div style="background:#f8fafc;border-radius:16px;padding:20px;margin:20px 0;"><h2>📄 وصف التطبيق</h2><p style="line-height:1.8;margin-top:10px;">${escapeHtml(app.description)}</p></div><div style="background:#f8fafc;border-radius:16px;padding:20px;margin:20px 0;"><h3>📊 إحصائيات التقييمات</h3><div style="display:flex;flex-wrap:wrap;gap:30px;align-items:center;"><div style="text-align:center;"><div style="font-size:3rem;font-weight:800;color:#fbbf24;">${avgRating}</div><div style="color:#fbbf24;">${renderStars(avgRating)}</div><div style="color:#64748b;">${totalRatings} تقييم</div></div><div style="flex:1;">${renderRatingBars(app.ratings)}</div></div></div>${ratingSectionHtml}<div style="margin-top:30px;"><h2>💬 التعليقات</h2><div class="add-comment"><input type="text" id="userName" placeholder="اسمك" ${currentUser ? `value="${escapeHtml(currentUser.username)}"` : ''}><select id="rating"><option value="5">⭐⭐⭐⭐⭐ ممتاز</option><option value="4">⭐⭐⭐⭐ جيد جداً</option><option value="3">⭐⭐⭐ جيد</option><option value="2">⭐⭐ مقبول</option><option value="1">⭐ ضعيف</option></select><textarea id="commentText" rows="3" placeholder="اكتب تعليقك..."></textarea><button onclick="addComment('${app.id}')">📝 إرسال التعليق</button></div><div id="commentsList"></div></div>${similarAppsHtml}</div>`;
    displayComments(app.id);
}
displayAppDetails();