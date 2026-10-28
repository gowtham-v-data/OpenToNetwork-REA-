/**
 * app.js — OpenToNetwork Frontend Logic
 * Wired to real REA-captured API contracts from LinkedIn evidence capture.
 * Evidence ID: ev_0befe5b572cd75c45f024763f2f85ea0d413beca04f47333719fb6c86091e769
 */

const API = 'http://127.0.0.1:4000';
let currentUser = null;
let currentView = 'feed';
let authToken = localStorage.getItem('otn_token');

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
async function init() {
  // 1. Call REA-captured API: /litms/api/metadata/user
  try {
    const meta = await apiFetch('/litms/api/metadata/user');
    console.log('[REA] /litms/api/metadata/user:', meta);
  } catch(e) {}

  // 2. Check auth
  if (authToken) {
    try {
      const me = await apiFetch('/api/auth/me');
      currentUser = me;
      showApp();
    } catch {
      authToken = null;
      localStorage.removeItem('otn_token');
      showAuth();
    }
  } else {
    showAuth();
  }

  // 3. Fire REA-captured telemetry (exactly as LinkedIn does)
  fireREATelemetry();
}

async function fireREATelemetry() {
  // These mirror exact endpoints captured by REA from LinkedIn
  try {
    await fetch(`${API}/li/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageKey: 'd_homepage-guest-home_jsbeacon', eventType: 'pageview' }) });
    await fetch(`${API}/homepage-guest/api/ingraphs/gauge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageKey: 'd_homepage-guest-home_jsbeacon', metricsType: 'pageLoadTime', metricsValue: performance.now() | 0 }) });
    await fetch(`${API}/homepage-guest/api/ingraphs/counter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'page_view' }) });
  } catch(e) {}
}

// ══════════════════════════════════════════════════════
// API HELPER
// ══════════════════════════════════════════════════════
async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ══════════════════════════════════════════════════════
// SHOW / HIDE SCREENS
// ══════════════════════════════════════════════════════
function showAuth() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

function showApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  updateUserUI();
  loadStats();
  loadNotifications();
  showView('feed');
}

function updateUserUI() {
  if (!currentUser) return;
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  
  // Header circle
  const headerCircle = document.getElementById('userAvatarCircle');
  if (headerCircle) {
    if (currentUser.avatarUrl) {
      headerCircle.innerHTML = `<img src="${escHtml(currentUser.avatarUrl)}" class="w-full h-full rounded-full object-cover">`;
    } else {
      headerCircle.textContent = initials;
    }
  }

  // Dropdown Avatar & Info
  const dropAvatar = document.getElementById('dropdownAvatar');
  if (dropAvatar) {
    if (currentUser.avatarUrl) {
      dropAvatar.innerHTML = `<img src="${escHtml(currentUser.avatarUrl)}" class="w-full h-full rounded-full object-cover">`;
    } else {
      dropAvatar.textContent = initials;
    }
  }
  const dropName = document.getElementById('dropdownName');
  if (dropName) dropName.textContent = currentUser.name;
  const dropHeadline = document.getElementById('dropdownHeadline');
  if (dropHeadline) dropHeadline.textContent = currentUser.headline || '';

  // Left Sidebar
  document.getElementById('sidebarName').textContent = currentUser.name;
  document.getElementById('sidebarHeadline').textContent = currentUser.headline || 'Add a headline';
  const sidebarAvatar = document.getElementById('profileAvatarLg');
  if (sidebarAvatar) {
    if (currentUser.avatarUrl) {
      sidebarAvatar.innerHTML = `<img src="${escHtml(currentUser.avatarUrl)}" class="w-full h-full rounded-full object-cover ${currentUser.openToWork ? 'otw-avatar-ring' : ''}">`;
    } else {
      sidebarAvatar.textContent = initials;
    }
  }

  // Composers & Modals
  const compAvatar = document.getElementById('composerAvatar');
  if (compAvatar) {
    if (currentUser.avatarUrl) compAvatar.innerHTML = `<img src="${escHtml(currentUser.avatarUrl)}" class="w-full h-full rounded-full object-cover">`;
    else compAvatar.textContent = initials;
  }
  const modalAv = document.getElementById('modalAvatar');
  if (modalAv) {
    if (currentUser.avatarUrl) modalAv.innerHTML = `<img src="${escHtml(currentUser.avatarUrl)}" class="w-full h-full rounded-full object-cover">`;
    else modalAv.textContent = initials;
  }
  document.getElementById('modalName').textContent = currentUser.name;
}

// ══════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════
function showView(view) {
  const views = ['feed', 'jobs', 'network', 'notifications', 'profile', 'messaging', 'search'];
  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.add('hidden');
    const btn = document.getElementById('nav-' + v);
    if (btn) btn.classList.remove('nav-active');
  });
  document.getElementById('view-' + view)?.classList.remove('hidden');
  document.getElementById('nav-' + view)?.classList.add('nav-active');
  currentView = view;

  if (view === 'feed') loadFeed();
  if (view === 'jobs') loadJobs();
  if (view === 'network') loadNetwork();
  if (view === 'notifications') loadNotifications();
  if (view === 'profile') loadProfile();
  if (view === 'messaging') loadConversations();
}

// ══════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════
function switchAuthTab(tab) {
  document.getElementById('loginTab').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerTab').classList.toggle('hidden', tab !== 'register');
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return toast('Enter email and password', 'error');
  try {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    authToken = data.token;
    localStorage.setItem('otn_token', authToken);
    currentUser = data.user;
    toast(`Welcome back, ${currentUser.name.split(' ')[0]}! 👋`);
    showApp();
  } catch(e) { toast(e.message, 'error'); }
}

async function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const headline = document.getElementById('regHeadline').value.trim();
  const location = document.getElementById('regLocation').value.trim();
  if (!name || !email || !password) return toast('Name, email and password required', 'error');
  if (password.length < 6) return toast('Password must be at least 6 characters', 'error');
  try {
    const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, headline, location }) });
    authToken = data.token;
    localStorage.setItem('otn_token', authToken);
    currentUser = data.user;
    toast(`Account created! Welcome, ${currentUser.name.split(' ')[0]}! 🎉`);
    showApp();
  } catch(e) { toast(e.message, 'error'); }
}

function doLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('otn_token');
  toast('Signed out. See you soon!');
  showAuth();
}

// ══════════════════════════════════════════════════════
// FEED
// ══════════════════════════════════════════════════════
let cachedPosts = [];
let currentFeedSort = 'recent';

const REACTION_CONFIG = {
  like: { label: 'Like', icon: '👍', color: 'text-[#0a66c2]' },
  celebrate: { label: 'Celebrate', icon: '👏', color: 'text-[#057642]' },
  support: { label: 'Support', icon: '🤝', color: 'text-[#705da7]' },
  love: { label: 'Love', icon: '❤️', color: 'text-[#df704d]' },
  insightful: { label: 'Insightful', icon: '💡', color: 'text-[#c37d16]' },
  funny: { label: 'Funny', icon: '😂', color: 'text-[#0073b1]' }
};

function getMyReaction(post) {
  if (!post.reactions || !currentUser) return null;
  for (const [r, list] of Object.entries(post.reactions)) {
    if (Array.isArray(list) && list.includes(currentUser.id)) return r;
  }
  return null;
}

function renderAvatarHtml(user, sizeClass = 'w-10 h-10', textClass = 'text-sm') {
  if (!user) return `<div class="${sizeClass} rounded-full bg-slate-200 flex-shrink-0"></div>`;
  const initials = (user.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isOpenToWork = !!user.openToWork;
  const isLarge = sizeClass.includes('w-24') || sizeClass.includes('w-20') || sizeClass.includes('w-14');

  if (user.avatarUrl) {
    return `<div class="relative ${sizeClass} flex-shrink-0 inline-block">
      <img src="${escHtml(user.avatarUrl)}" class="${sizeClass} rounded-full object-cover ${isOpenToWork ? 'p-0.5 border-2 border-emerald-600' : ''}" onerror="this.parentElement.innerHTML='<div class=\\\'${sizeClass} rounded-full bg-li-blue flex items-center justify-center text-white font-bold ${textClass}\\\'>${initials}</div>'">
      ${isOpenToWork ? `<div class="absolute inset-0 rounded-full border-[2.5px] border-emerald-600 pointer-events-none"></div>
      <span class="absolute ${isLarge ? '-bottom-1.5' : '-bottom-1'} left-1/2 -translate-x-1/2 bg-emerald-600 text-[7px] text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-tight shadow pointer-events-none whitespace-nowrap">#OpenToWork</span>` : ''}
    </div>`;
  }
  return `<div class="relative ${sizeClass} flex-shrink-0 inline-block">
    <div class="${sizeClass} rounded-full bg-li-blue flex items-center justify-center text-white font-bold ${textClass} ${isOpenToWork ? 'border-2 border-emerald-600' : ''}">${initials}</div>
    ${isOpenToWork ? `<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-[7px] text-white px-1 rounded-full font-bold uppercase shadow">#OTW</span>` : ''}
  </div>`;
}

function renderVerifiedBadge(user) {
  if (!user || !user.verified) return '';
  return `<span class="inline-flex items-center text-li-blue ml-1" title="Verified Member">
    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.8-3.8 1.4-1.4 2.4 2.4 5.4-5.4 1.4 1.4-6.8 6.8z"/></svg>
  </span>`;
}

function renderPremiumBadge(user) {
  if (!user || !user.premium) return '';
  return `<span class="inline-flex items-center ml-1 bg-[#d4a017] text-white text-[8px] font-black px-1 py-0.2 rounded leading-none shadow-xs" title="LinkedIn Premium">IN</span>`;
}

function renderReactionSummary(post) {
  const r = post.reactions || {};
  const icons = [];
  if (r.like?.length) icons.push('👍');
  if (r.celebrate?.length) icons.push('👏');
  if (r.support?.length) icons.push('🤝');
  if (r.love?.length) icons.push('❤️');
  if (r.insightful?.length) icons.push('💡');
  if (r.funny?.length) icons.push('😂');
  if (!icons.length && (post.totalReactions > 0 || post.likes > 0)) icons.push('👍');

  const total = post.totalReactions || post.likes || 0;
  if (total === 0 && !post.comments && !post.shares) return '';

  return `
    <div class="px-4 pb-2 text-xs text-li-muted flex items-center justify-between border-t border-slate-100 pt-2">
      <div class="flex items-center space-x-1.5 cursor-pointer hover:underline" onclick="openReactionListModal('${post.id}')" title="View reactions">
        ${icons.length ? `<span class="flex items-center -space-x-1">${icons.slice(0, 3).map(ic => `<span class="inline-block text-xs bg-white rounded-full shadow-sm p-0.5">${ic}</span>`).join('')}</span>` : ''}
        <span class="font-medium text-slate-600">${total > 0 ? `${total} reaction${total !== 1 ? 's' : ''}` : ''}</span>
      </div>
      <div class="space-x-2 text-slate-500">
        <span class="hover:underline cursor-pointer" onclick="toggleComments('${post.id}')">${post.comments || 0} comments</span>
        <span>·</span>
        <span class="hover:underline cursor-pointer" onclick="openRepostModal('${post.id}')">${post.shares || 0} reposts</span>
      </div>
    </div>`;
}

async function loadFeed() {
  try {
    const posts = await apiFetch(`/api/feed?sort=${currentFeedSort}`);
    cachedPosts = posts;
    renderPosts(posts);
    renderSuggestions();
  } catch(e) { console.error('Feed error:', e); }
}

async function toggleFeedSort() {
  currentFeedSort = currentFeedSort === 'recent' ? 'top' : 'recent';
  const label = document.getElementById('feedSortLabel');
  if (label) label.textContent = currentFeedSort === 'recent' ? 'Recent' : 'Top';
  loadFeed();
}

function renderPosts(posts) {
  const container = document.getElementById('postsContainer');
  if (!posts.length) { container.innerHTML = '<div class="text-center text-li-muted py-10 text-sm">No posts yet. Be the first to post!</div>'; return; }
  container.innerHTML = posts.map(post => {
    const author = post.author || {};
    const timeAgo = relativeTime(post.createdAt);
    const myReaction = getMyReaction(post);
    const cfg = myReaction ? REACTION_CONFIG[myReaction] : { label: 'Like', icon: '👍', color: 'text-li-muted' };

    return `
    <article class="feed-post bg-white rounded-lg border border-li-border shadow-sm">
      <div class="p-4">
        <div class="flex items-start space-x-3 mb-3">
          ${renderAvatarHtml(author, 'w-12 h-12', 'text-base')}
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-1">
              <span class="font-bold text-sm hover:text-li-blue cursor-pointer truncate">${escHtml(author.name || 'Unknown')}</span>
              ${author.verified ? `<svg class="w-3.5 h-3.5 text-blue-500 fill-current inline flex-shrink-0" viewBox="0 0 24 24" title="Verified"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
              ${author.premium ? `<span class="bg-[#d4af37] text-white text-[9px] font-bold px-1 rounded flex-shrink-0" title="Premium">IN</span>` : ''}
            </div>
            <div class="text-xs text-li-muted truncate">${escHtml(author.headline || '')}</div>
            <div class="text-xs text-li-muted">${timeAgo} · 🌐</div>
          </div>
        </div>

        <p class="text-sm text-li-text whitespace-pre-wrap leading-relaxed">${formatPostContent(post.content)}</p>
        
        ${post.hashtags?.length ? `<div class="flex flex-wrap gap-1 mt-2">${post.hashtags.map(h => `<span class="text-li-blue text-xs font-medium cursor-pointer hover:underline" onclick="doGlobalSearch('${h.replace('#','')}')">${escHtml(h)}</span>`).join('')}</div>` : ''}
        
        ${post.imageUrl ? `<img src="${escHtml(post.imageUrl)}" class="mt-3 rounded-lg w-full object-cover max-h-80" onerror="this.remove()">` : ''}
        
        ${post.poll ? renderPollInline(post) : ''}

        ${post.repostOf ? `
          <div class="mt-3 p-3 rounded-lg border border-li-border bg-slate-50">
            <div class="flex items-center space-x-2 mb-2">
              ${renderAvatarHtml(post.repostOf.author, 'w-8 h-8', 'text-xs')}
              <div>
                <div class="font-bold text-xs">${escHtml(post.repostOf.author?.name || 'Unknown')}</div>
                <div class="text-[10px] text-li-muted">${escHtml(post.repostOf.author?.headline || '')}</div>
              </div>
            </div>
            <p class="text-xs text-li-text whitespace-pre-wrap">${formatPostContent(post.repostOf.content)}</p>
            ${post.repostOf.imageUrl ? `<img src="${escHtml(post.repostOf.imageUrl)}" class="mt-2 rounded w-full object-cover max-h-48" onerror="this.remove()">` : ''}
          </div>` : ''}
      </div>

      ${renderReactionSummary(post)}

      <!-- Action Bar -->
      <div class="flex border-t border-li-border mx-4 py-1 relative">
        <!-- Reaction Trigger -->
        <div class="reaction-trigger relative flex-1">
          <div class="reaction-picker items-center space-x-2">
            <button onclick="reactPost('${post.id}', 'like', event)" title="Like" class="reaction-icon text-2xl">👍</button>
            <button onclick="reactPost('${post.id}', 'celebrate', event)" title="Celebrate" class="reaction-icon text-2xl">👏</button>
            <button onclick="reactPost('${post.id}', 'support', event)" title="Support" class="reaction-icon text-2xl">🤝</button>
            <button onclick="reactPost('${post.id}', 'love', event)" title="Love" class="reaction-icon text-2xl">❤️</button>
            <button onclick="reactPost('${post.id}', 'insightful', event)" title="Insightful" class="reaction-icon text-2xl">💡</button>
            <button onclick="reactPost('${post.id}', 'funny', event)" title="Funny" class="reaction-icon text-2xl">😂</button>
          </div>
          <button onclick="reactPost('${post.id}', '${myReaction || 'like'}', event)" class="w-full flex items-center justify-center space-x-1.5 py-2 hover:bg-slate-100 rounded text-xs font-semibold ${cfg.color} transition">
            <span class="text-base">${cfg.icon}</span>
            <span>${cfg.label}</span>
          </button>
        </div>

        <!-- Comment -->
        <button onclick="toggleComments('${post.id}')" class="flex-1 flex items-center justify-center space-x-1.5 py-2 hover:bg-slate-100 rounded text-xs font-semibold text-li-muted transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span>Comment</span>
        </button>

        <!-- Repost -->
        <button onclick="openRepostModal('${post.id}')" class="flex-1 flex items-center justify-center space-x-1.5 py-2 hover:bg-slate-100 rounded text-xs font-semibold text-li-muted transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Repost</span>
        </button>

        <!-- Send -->
        <button onclick="openSendPostModal('${post.id}')" class="flex-1 flex items-center justify-center space-x-1.5 py-2 hover:bg-slate-100 rounded text-xs font-semibold text-li-muted transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          <span>Send</span>
        </button>
      </div>

      <!-- Comments Section (collapsed by default) -->
      <div id="comments-${post.id}" class="hidden border-t border-li-border">
        <div id="comments-list-${post.id}" class="max-h-60 overflow-y-auto px-4 py-2 space-y-2"></div>
        <div class="flex items-center space-x-2 px-4 py-2 border-t border-slate-100">
          ${renderAvatarHtml(currentUser, 'w-7 h-7', 'text-[10px]')}
          <input type="text" id="comment-input-${post.id}" placeholder="Add a comment..." onkeydown="if(event.key==='Enter')addComment('${post.id}')" class="flex-1 bg-[#f3f2f0] text-xs rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-li-blue">
          <button onclick="addComment('${post.id}')" class="text-li-blue text-xs font-semibold hover:underline">Post</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

async function reactPost(postId, reactionType, event) {
  if (event) event.stopPropagation();
  try {
    const data = await apiFetch(`/api/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reaction: reactionType })
    });
    const post = cachedPosts.find(p => p.id === postId);
    if (post) {
      post.reactions = data.reactions;
      post.totalReactions = data.totalReactions;
      post.likes = data.totalReactions;
      renderPosts(cachedPosts);
    }
  } catch(e) { toast(e.message, 'error'); }
}

async function likePost(postId, btn) {
  try {
    const data = await apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
    // Re-render feed with updated data
    const post = cachedPosts.find(p => p.id === postId);
    if (post) {
      post.likes = data.likes;
      if (!post.likedBy) post.likedBy = [];
      if (data.liked) post.likedBy.push(currentUser.id);
      else post.likedBy = post.likedBy.filter(id => id !== currentUser.id);
      renderPosts(cachedPosts);
    }
  } catch(e) { toast(e.message, 'error'); }
}

function renderSuggestions() {
  apiFetch('/api/people').then(people => {
    const el = document.getElementById('suggestionsRail');
    const top3 = people.slice(0, 3);
    el.innerHTML = `<h3 class="font-bold text-sm text-li-text mb-2">Add to your feed</h3>` + top3.map(p => {
      const initials = p.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return `
      <div class="flex items-center space-x-2">
        <div class="w-9 h-9 rounded-full bg-li-blue flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">${initials}</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-xs truncate">${escHtml(p.name)}</div>
          <div class="text-[10px] text-li-muted truncate">${escHtml(p.headline || '')}</div>
        </div>
        <button onclick="sendConnect('${p.id}', this)" class="text-xs text-li-blue border border-li-blue px-2 py-0.5 rounded-full hover:bg-blue-50 whitespace-nowrap">+ Follow</button>
      </div>`;
    }).join('');
  }).catch(() => {});
}

// ══════════════════════════════════════════════════════
// JOBS
// ══════════════════════════════════════════════════════
async function loadJobs(q = '', location = '') {
  try {
    const jobs = await apiFetch(`/api/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}`);
    renderJobs(jobs);
  } catch(e) {}
}

function renderJobs(jobs) {
  const container = document.getElementById('jobsList');
  if (!jobs.length) { container.innerHTML = '<div class="text-center text-li-muted py-10 text-sm bg-white rounded-lg border border-li-border">No jobs found matching your search.</div>'; return; }
  container.innerHTML = jobs.map(j => `
    <div class="bg-white rounded-lg border border-li-border shadow-sm p-4 flex items-start space-x-4 hover:shadow-md transition cursor-pointer">
      <div class="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-li-blue font-bold text-lg flex-shrink-0">${j.company[0]}</div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-sm hover:text-li-blue cursor-pointer">${escHtml(j.title)}</div>
        <div class="text-sm text-li-muted">${escHtml(j.company)}</div>
        <div class="text-xs text-li-muted mt-1">${escHtml(j.location)} · ${escHtml(j.type)} · ${escHtml(j.remote)}</div>
        <div class="flex flex-wrap gap-1 mt-2">
          ${(j.skills || []).map(s => `<span class="bg-blue-50 text-li-blue text-[10px] px-2 py-0.5 rounded-full">${escHtml(s)}</span>`).join('')}
        </div>
      </div>
      <div class="flex-shrink-0 text-right">
        <div class="text-[10px] text-li-muted mb-2">${relativeTime(j.postedAt)}</div>
        <button onclick="applyJob('${j.id}', this)" class="bg-li-blue hover:bg-li-hover text-white text-xs font-semibold px-4 py-1.5 rounded-full transition">Apply</button>
        <div class="text-[10px] text-li-muted mt-1">${j.applicants} applicants</div>
      </div>
    </div>`).join('');
}

function searchJobs() {
  const q = document.getElementById('jobTitleInput').value;
  const loc = document.getElementById('jobLocationInput').value;
  loadJobs(q, loc);
}

function applyJob(id, btn) {
  btn.textContent = '✓ Applied';
  btn.disabled = true;
  btn.classList.remove('bg-li-blue', 'hover:bg-li-hover');
  btn.classList.add('bg-emerald-500', 'cursor-default');
  toast('Application submitted! 🎉');
}

// ══════════════════════════════════════════════════════
// NETWORK
// ══════════════════════════════════════════════════════
async function loadNetwork() {
  try {
    const people = await apiFetch('/api/people');
    const container = document.getElementById('peopleList');
    container.innerHTML = people.map(p => {
      const initials = p.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return `
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-li-blue flex items-center justify-center text-white font-bold">${initials}</div>
          <div>
            <div class="font-bold text-sm">${escHtml(p.name)}</div>
            <div class="text-xs text-li-muted">${escHtml(p.headline || '')}</div>
            <div class="text-xs text-li-muted">${escHtml(p.location || '')} · ${p.connections || 0} connections</div>
          </div>
        </div>
        <div class="space-x-2 flex-shrink-0">
          <button onclick="sendConnect('${p.id}', this)" class="text-xs text-li-blue border border-li-blue px-4 py-1.5 rounded-full hover:bg-blue-50">Connect</button>
        </div>
      </div>`;
    }).join('');

    document.getElementById('networkStats').innerHTML = `
      <div class="flex justify-between"><span>Your connections</span><span class="font-semibold text-li-text">${currentUser?.connections || 0}</span></div>
      <div class="flex justify-between"><span>People in your feed</span><span class="font-semibold text-li-text">${people.length}</span></div>
      <div class="flex justify-between"><span>Profile views (7d)</span><span class="font-semibold text-li-text">${Math.floor(Math.random()*100 + 10)}</span></div>`;
  } catch(e) {}
}

async function sendConnect(toId, btn) {
  try {
    await apiFetch('/api/connections', { method: 'POST', body: JSON.stringify({ toId }) });
    btn.textContent = 'Pending';
    btn.disabled = true;
    btn.classList.remove('text-li-blue', 'border-li-blue');
    btn.classList.add('text-li-muted', 'border-slate-300', 'cursor-default');
    toast('Connection request sent!');
  } catch(e) { toast(e.message === 'Already connected or pending' ? 'Already sent!' : e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════
async function loadNotifications() {
  try {
    const notifs = await apiFetch('/api/notifications');
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (unread > 0) { badge.textContent = unread; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');

    if (currentView !== 'notifications') return;
    const container = document.getElementById('notifList');
    if (!notifs.length) { container.innerHTML = '<div class="px-5 py-8 text-sm text-li-muted text-center">No notifications yet.</div>'; return; }
    container.innerHTML = notifs.map(n => {
      const fromInitials = n.fromUser ? n.fromUser.name.split(' ').map(c=>c[0]).join('').slice(0,2).toUpperCase() : '?';
      return `<div class="flex items-start space-x-3 px-5 py-4 ${n.read ? '' : 'bg-blue-50'}">
        <div class="w-10 h-10 rounded-full bg-li-blue flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">${fromInitials}</div>
        <div>
          <div class="text-sm">${escHtml(n.message)}</div>
          <div class="text-xs text-li-muted mt-0.5">${relativeTime(n.createdAt)}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {}
}

async function markAllRead() {
  try {
    await apiFetch('/api/notifications/read-all', { method: 'POST' });
    document.getElementById('notifBadge').classList.add('hidden');
    loadNotifications();
    toast('All marked as read');
  } catch(e) {}
}

// ══════════════════════════════════════════════════════
// STATS (mirrors LinkedIn /homepage-guest/api/ingraphs/gauge)
// ══════════════════════════════════════════════════════
async function loadStats() {
  try {
    const stats = await apiFetch('/api/stats');
    document.getElementById('statViewers').textContent = stats.viewers?.toLocaleString() || '—';
    document.getElementById('statImpressions').textContent = stats.impressions?.toLocaleString() || '—';
  } catch(e) {}
}

// ══════════════════════════════════════════════════════
// PROFILE (Full LinkedIn-style with sections)
// ══════════════════════════════════════════════════════
let profileData = null;

async function loadProfile() {
  if (!currentUser) return;
  try {
    profileData = await apiFetch(`/api/profile/${currentUser.id}`);
  } catch(e) {
    profileData = { ...currentUser, experience: [], education: [], skills: [], certifications: [], languages: [] };
  }

  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('profileBigAvatar').textContent = initials;
  document.getElementById('profileName').textContent = profileData.name;
  document.getElementById('profileHeadline').textContent = profileData.headline || 'Add a headline';
  document.getElementById('profileLocation').querySelector('span').textContent = profileData.location || 'Add location';
  document.getElementById('profileConnections').textContent = profileData.connections || 0;
  document.getElementById('profileJoinDate').textContent = profileData.joinedAt ? `Joined ${profileData.joinedAt}` : '';

  // Industry
  const indEl = document.getElementById('profileIndustry');
  if (profileData.industry) { indEl.textContent = profileData.industry; indEl.classList.remove('hidden'); }
  else indEl.classList.add('hidden');

  // Open to work banner
  const otwBanner = document.getElementById('openToWorkBanner');
  if (profileData.openToWork) otwBanner.classList.remove('hidden');
  else otwBanner.classList.add('hidden');

  // About
  if (profileData.about) {
    document.getElementById('profileAbout').textContent = profileData.about;
  }

  // Experience
  renderExperience(profileData.experience || []);
  // Education
  renderEducation(profileData.education || []);
  // Skills
  renderSkills(profileData.skills || []);
  // Certifications
  renderCertifications(profileData.certifications || []);
  // Languages
  renderLanguages(profileData.languages || []);

  // Activity (own posts)
  try {
    const posts = await apiFetch('/api/feed');
    const mine = posts.filter(p => p.authorId === currentUser.id || p.author?.id === currentUser.id);
    const el = document.getElementById('profilePosts');
    if (!mine.length) { el.innerHTML = '<div class="text-li-muted text-sm">No posts yet.</div>'; return; }
    el.innerHTML = mine.map(p => `
      <div class="border border-li-border rounded p-3 text-sm">
        <p class="text-li-text line-clamp-3">${escHtml(p.content)}</p>
        ${p.hashtags?.length ? `<div class="flex flex-wrap gap-1 mt-1">${p.hashtags.map(h => `<span class="text-li-blue text-xs">${escHtml(h)}</span>`).join('')}</div>` : ''}
        <div class="text-xs text-li-muted mt-2">${p.likes} likes · ${p.comments} comments · ${relativeTime(p.createdAt)}</div>
      </div>`).join('');
  } catch(e) {}
}

function renderExperience(list) {
  const el = document.getElementById('experienceList');
  if (!list.length) { el.innerHTML = '<div class="text-sm text-li-muted">No experience added. <button onclick="openAddExperience()" class="text-li-blue hover:underline">Add your work history.</button></div>'; return; }
  el.innerHTML = list.map(exp => `
    <div class="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div class="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-li-blue font-bold flex-shrink-0">${(exp.company || '?')[0].toUpperCase()}</div>
      <div class="flex-1">
        <div class="font-semibold text-sm">${escHtml(exp.title)}</div>
        <div class="text-sm text-li-muted">${escHtml(exp.company)} · ${escHtml(exp.employmentType || '')}</div>
        <div class="text-xs text-li-muted">${escHtml(exp.startDate || '')} — ${exp.current ? 'Present' : escHtml(exp.endDate || '')}</div>
        <div class="text-xs text-li-muted">${escHtml(exp.location || '')}</div>
        ${exp.description ? `<p class="text-xs text-li-text mt-2 leading-relaxed">${escHtml(exp.description)}</p>` : ''}
      </div>
      ${exp.userId === currentUser?.id ? `<button onclick="deleteExperience('${exp.id}')" class="text-li-muted hover:text-red-500 flex-shrink-0" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>` : ''}
    </div>`).join('');
}

function renderEducation(list) {
  const el = document.getElementById('educationList');
  if (!list.length) { el.innerHTML = '<div class="text-sm text-li-muted">No education added. <button onclick="openAddEducation()" class="text-li-blue hover:underline">Add your education.</button></div>'; return; }
  el.innerHTML = list.map(edu => `
    <div class="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div class="w-10 h-10 rounded bg-amber-50 flex items-center justify-center text-amber-600 font-bold flex-shrink-0">🎓</div>
      <div class="flex-1">
        <div class="font-semibold text-sm">${escHtml(edu.school)}</div>
        <div class="text-sm text-li-muted">${escHtml(edu.degree || '')}${edu.fieldOfStudy ? `, ${escHtml(edu.fieldOfStudy)}` : ''}</div>
        <div class="text-xs text-li-muted">${edu.startYear || '?'} — ${edu.endYear || '?'}</div>
        ${edu.grade ? `<div class="text-xs text-li-muted">Grade: ${escHtml(edu.grade)}</div>` : ''}
        ${edu.activities ? `<div class="text-xs text-li-text mt-1">${escHtml(edu.activities)}</div>` : ''}
      </div>
      ${edu.userId === currentUser?.id ? `<button onclick="deleteEducation('${edu.id}')" class="text-li-muted hover:text-red-500 flex-shrink-0" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>` : ''}
    </div>`).join('');
}

function renderSkills(list) {
  const el = document.getElementById('skillsList');
  if (!list.length) { el.innerHTML = '<div class="text-sm text-li-muted">No skills added. <button onclick="openAddSkill()" class="text-li-blue hover:underline">Add your skills.</button></div>'; return; }
  el.innerHTML = list.map(s => {
    const isOwn = s.userId === currentUser?.id;
    return `<div class="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
      <span class="text-sm font-medium">${escHtml(s.name)}</span>
      <span class="text-xs text-li-muted">· ${s.endorsements || 0}</span>
      ${isOwn ? `<button onclick="deleteSkill('${s.id}')" class="text-li-muted hover:text-red-500"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>` : `<button onclick="endorseSkill('${s.id}')" class="text-li-blue text-[10px] hover:underline">Endorse</button>`}
    </div>`;
  }).join('');
}

function renderCertifications(list) {
  const el = document.getElementById('certificationsList');
  if (!list.length) { el.innerHTML = '<div class="text-sm text-li-muted">No certifications. <button onclick="openAddCertification()" class="text-li-blue hover:underline">Add one.</button></div>'; return; }
  el.innerHTML = list.map(c => `
    <div class="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-li-blue font-bold flex-shrink-0">📜</div>
      <div class="flex-1">
        <div class="font-semibold text-sm">${escHtml(c.name)}</div>
        <div class="text-sm text-li-muted">${escHtml(c.organization)}</div>
        <div class="text-xs text-li-muted">${c.issueDate ? `Issued ${c.issueDate}` : ''}${c.expirationDate ? ` · Expires ${c.expirationDate}` : ''}</div>
        ${c.credentialId ? `<div class="text-xs text-li-muted">ID: ${escHtml(c.credentialId)}</div>` : ''}
      </div>
    </div>`).join('');
}

function renderLanguages(list) {
  const el = document.getElementById('languagesList');
  if (!list.length) { el.innerHTML = '<div class="text-sm text-li-muted">No languages added.</div>'; return; }
  el.innerHTML = list.map(l => `
    <div class="flex items-center justify-between py-1">
      <span class="text-sm font-medium">${escHtml(l.name)}</span>
      <span class="text-xs text-li-muted">${escHtml(l.proficiency || '')}</span>
    </div>`).join('');
}

// Profile Modal Openers
function openAddExperience() { document.getElementById('addExpModal').classList.remove('hidden'); }
function openAddEducation() { document.getElementById('addEduModal').classList.remove('hidden'); }
function openAddSkill() { document.getElementById('addSkillModal').classList.remove('hidden'); }
function openAddCertification() { document.getElementById('addCertModal').classList.remove('hidden'); }

// Save Experience
async function saveExperience() {
  const body = {
    title: document.getElementById('expTitle').value.trim(),
    company: document.getElementById('expCompany').value.trim(),
    employmentType: document.getElementById('expType').value,
    location: document.getElementById('expLocation').value.trim(),
    startDate: document.getElementById('expStart').value,
    endDate: document.getElementById('expEnd').value,
    current: document.getElementById('expCurrent').checked,
    description: document.getElementById('expDesc').value.trim()
  };
  if (!body.title || !body.company) return toast('Title and company required', 'error');
  try {
    await apiFetch('/api/profile/experience', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('addExpModal').classList.add('hidden');
    ['expTitle','expCompany','expLocation','expStart','expEnd','expDesc'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('expCurrent').checked = false;
    loadProfile();
    toast('Experience added! ✓');
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteExperience(id) {
  if (!confirm('Delete this experience?')) return;
  try { await apiFetch(`/api/profile/experience/${id}`, { method: 'DELETE' }); loadProfile(); toast('Deleted'); } catch(e) { toast(e.message, 'error'); }
}

// Save Education
async function saveEducation() {
  const body = {
    school: document.getElementById('eduSchool').value.trim(),
    degree: document.getElementById('eduDegree').value.trim(),
    fieldOfStudy: document.getElementById('eduField').value.trim(),
    startYear: document.getElementById('eduStartYear').value,
    endYear: document.getElementById('eduEndYear').value,
    grade: document.getElementById('eduGrade').value.trim(),
    activities: document.getElementById('eduActivities').value.trim()
  };
  if (!body.school) return toast('School is required', 'error');
  try {
    await apiFetch('/api/profile/education', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('addEduModal').classList.add('hidden');
    ['eduSchool','eduDegree','eduField','eduStartYear','eduEndYear','eduGrade','eduActivities'].forEach(id => document.getElementById(id).value = '');
    loadProfile();
    toast('Education added! ✓');
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteEducation(id) {
  if (!confirm('Delete this education?')) return;
  try { await apiFetch(`/api/profile/education/${id}`, { method: 'DELETE' }); loadProfile(); toast('Deleted'); } catch(e) { toast(e.message, 'error'); }
}

// Save Skill
async function saveSkill() {
  const name = document.getElementById('skillName').value.trim();
  if (!name) return toast('Enter a skill name', 'error');
  try {
    await apiFetch('/api/profile/skills', { method: 'POST', body: JSON.stringify({ name }) });
    document.getElementById('addSkillModal').classList.add('hidden');
    document.getElementById('skillName').value = '';
    loadProfile();
    toast('Skill added! ✓');
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteSkill(id) {
  try { await apiFetch(`/api/profile/skills/${id}`, { method: 'DELETE' }); loadProfile(); toast('Skill removed'); } catch(e) { toast(e.message, 'error'); }
}

async function endorseSkill(id) {
  try { await apiFetch(`/api/profile/skills/${id}/endorse`, { method: 'POST' }); loadProfile(); toast('Endorsed! 👍'); } catch(e) { toast(e.message, 'error'); }
}

// Save Certification
async function saveCertification() {
  const body = {
    name: document.getElementById('certName').value.trim(),
    organization: document.getElementById('certOrg').value.trim(),
    issueDate: document.getElementById('certIssue').value,
    expirationDate: document.getElementById('certExpire').value,
    credentialId: document.getElementById('certId').value.trim(),
    credentialUrl: document.getElementById('certUrl').value.trim()
  };
  if (!body.name || !body.organization) return toast('Name and organization required', 'error');
  try {
    await apiFetch('/api/profile/certifications', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('addCertModal').classList.add('hidden');
    ['certName','certOrg','certIssue','certExpire','certId','certUrl'].forEach(id => document.getElementById(id).value = '');
    loadProfile();
    toast('Certification added! ✓');
  } catch(e) { toast(e.message, 'error'); }
}

// Toggle Open to Work
async function toggleOpenToWork() {
  const newVal = !currentUser.openToWork;
  try {
    const updated = await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ openToWork: newVal }) });
    currentUser = { ...currentUser, ...updated };
    loadProfile();
    toast(newVal ? '#OpenToWork badge added! 🟢' : 'Open to Work removed');
  } catch(e) { toast(e.message, 'error'); }
}

function openEditProfile() {
  document.getElementById('editName').value = currentUser?.name || '';
  document.getElementById('editHeadline').value = currentUser?.headline || '';
  document.getElementById('editLocation').value = currentUser?.location || '';
  document.getElementById('editIndustry').value = currentUser?.industry || '';
  document.getElementById('editWebsite').value = currentUser?.website || '';
  document.getElementById('editPronouns').value = currentUser?.pronouns || '';
  document.getElementById('editAbout').value = currentUser?.about || '';
  document.getElementById('editProfileModal').classList.remove('hidden');
}
function closeEditProfile() { document.getElementById('editProfileModal').classList.add('hidden'); }

async function saveProfile() {
  const body = {
    name: document.getElementById('editName').value.trim(),
    headline: document.getElementById('editHeadline').value.trim(),
    location: document.getElementById('editLocation').value.trim(),
    industry: document.getElementById('editIndustry').value.trim(),
    website: document.getElementById('editWebsite').value.trim(),
    pronouns: document.getElementById('editPronouns').value,
    about: document.getElementById('editAbout').value.trim()
  };
  try {
    const updated = await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(body) });
    currentUser = { ...currentUser, ...updated };
    updateUserUI();
    loadProfile();
    closeEditProfile();
    toast('Profile updated! ✓');
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// POST MODAL (Rich Content: Polls, Hashtags, Media)
// ══════════════════════════════════════════════════════
let postHasPoll = false;

function openPostModal(type) {
  document.getElementById('postModal').classList.remove('hidden');
  if (type === 'photo') toggleMediaInput();
  updatePostPreview();
}
function closePostModal() {
  document.getElementById('postModal').classList.add('hidden');
  document.getElementById('postContentInput').value = '';
  document.getElementById('postImageInput').value = '';
  document.getElementById('mediaSection').classList.add('hidden');
  document.getElementById('pollSection').classList.add('hidden');
  document.getElementById('hashtagRow').classList.add('hidden');
  document.getElementById('imagePreview').classList.add('hidden');
  postHasPoll = false;
  // Reset poll options
  document.getElementById('pollQuestion').value = '';
  document.getElementById('pollOptions').innerHTML = `
    <input type="text" class="poll-option w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-li-blue" placeholder="Option 1">
    <input type="text" class="poll-option w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-li-blue" placeholder="Option 2">`;
  updatePostPreview();
}

function toggleMediaInput() {
  document.getElementById('mediaSection').classList.toggle('hidden');
  document.getElementById('pollSection').classList.add('hidden');
  postHasPoll = false;
}

function togglePoll() {
  document.getElementById('pollSection').classList.toggle('hidden');
  postHasPoll = !document.getElementById('pollSection').classList.contains('hidden');
  document.getElementById('mediaSection').classList.add('hidden');
  updatePostPreview();
}

function removePoll() {
  document.getElementById('pollSection').classList.add('hidden');
  postHasPoll = false;
  updatePostPreview();
}

function toggleHashtags() {
  document.getElementById('hashtagRow').classList.toggle('hidden');
}

function addPollOption() {
  const container = document.getElementById('pollOptions');
  const count = container.querySelectorAll('.poll-option').length;
  if (count >= 4) return toast('Max 4 options', 'error');
  const input = document.createElement('input');
  input.type = 'text'; input.className = 'poll-option w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-li-blue';
  input.placeholder = `Option ${count + 1}`;
  container.appendChild(input);
}

function addHashtag(tag) {
  const input = document.getElementById('postContentInput');
  if (!input.value.includes(tag)) {
    input.value = input.value.trimEnd() + ' ' + tag;
    updatePostPreview();
  }
}

function addEmoji() {
  const emojis = ['🚀','💡','🎉','👏','🔥','💼','🎯','✨','📊','🤝'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const input = document.getElementById('postContentInput');
  input.value += emoji;
  updatePostPreview();
}

function previewImage() {
  const url = document.getElementById('postImageInput').value.trim();
  const preview = document.getElementById('imagePreview');
  if (url) {
    document.getElementById('imagePreviewImg').src = url;
    preview.classList.remove('hidden');
  } else {
    preview.classList.add('hidden');
  }
}

function updatePostPreview() {
  const content = document.getElementById('postContentInput').value;
  const charCount = document.getElementById('postCharCount');
  const submitBtn = document.getElementById('postSubmitBtn');
  charCount.textContent = `${content.length}/3000`;
  charCount.classList.toggle('text-red-500', content.length > 3000);
  submitBtn.disabled = !content.trim() && !postHasPoll;
}

async function submitPost() {
  const content = document.getElementById('postContentInput').value.trim();
  const imageUrl = document.getElementById('postImageInput')?.value?.trim() || '';
  
  // Extract hashtags
  const hashtags = [...new Set((content.match(/#\w+/g) || []))];

  // Build poll if active
  let poll = null;
  if (postHasPoll) {
    const question = document.getElementById('pollQuestion').value.trim();
    const options = [...document.querySelectorAll('.poll-option')].map(i => i.value.trim()).filter(Boolean);
    if (!question) return toast('Poll question required', 'error');
    if (options.length < 2) return toast('At least 2 poll options required', 'error');
    poll = { question, options, duration: document.getElementById('pollDuration').value };
  }

  if (!content && !poll) return toast('Write something or create a poll!', 'error');

  try {
    const post = await apiFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content, imageUrl: imageUrl || null, poll, postType: poll ? 'poll' : 'post', hashtags })
    });
    cachedPosts.unshift({ ...post });
    renderPosts(cachedPosts);
    closePostModal();
    toast(poll ? 'Poll published! 📊' : 'Post published! 🚀');
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════
let searchDebounceTimer = null;
function handleSearch(val) {
  clearTimeout(searchDebounceTimer);
  const dropdown = document.getElementById('searchAutocompleteDropdown');
  const resultsContainer = document.getElementById('searchAutocompleteResults');

  if (currentView === 'feed') {
    if (!val.trim()) { renderPosts(cachedPosts); }
    else {
      const filtered = cachedPosts.filter(p =>
        p.content?.toLowerCase().includes(val.toLowerCase()) ||
        p.author?.name?.toLowerCase().includes(val.toLowerCase())
      );
      renderPosts(filtered);
    }
  }

  if (!val || val.trim().length < 2) {
    if (dropdown) dropdown.classList.add('hidden');
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await apiFetch('/api/search?q=' + encodeURIComponent(val) + '&type=all');
      if (!dropdown || !resultsContainer) return;

      const people = (res.people || []).slice(0, 3);
      const jobs = (res.jobs || []).slice(0, 2);
      const posts = (res.posts || []).slice(0, 2);

      if (!people.length && !jobs.length && !posts.length) {
        resultsContainer.innerHTML = '<div class="p-3 text-li-muted text-center">No quick results found.</div>';
        dropdown.classList.remove('hidden');
        return;
      }

      let out = '';
      if (people.length) {
        out += '<div class="px-3 py-1 font-bold text-[10px] text-li-muted uppercase bg-slate-50">People</div>';
        people.forEach(p => {
          out += `<div onclick="document.getElementById('searchInput').value='';document.getElementById('searchAutocompleteDropdown').classList.add('hidden');currentProfileUserId='${p.id}';showView('profile');" class="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-2.5">
            ${renderAvatarHtml(p, 'w-7 h-7 text-xs')}
            <div class="truncate">
              <div class="font-semibold text-xs text-li-text">${escHtml(p.name)} ${renderVerifiedBadge(p)}</div>
              <div class="text-[10px] text-li-muted truncate">${escHtml(p.headline || '')}</div>
            </div>
          </div>`;
        });
      }

      if (jobs.length) {
        out += '<div class="px-3 py-1 font-bold text-[10px] text-li-muted uppercase bg-slate-50">Jobs</div>';
        jobs.forEach(j => {
          out += `<div onclick="document.getElementById('searchInput').value='';document.getElementById('searchAutocompleteDropdown').classList.add('hidden');showView('jobs');" class="px-3 py-2 hover:bg-blue-50 cursor-pointer">
            <div class="font-semibold text-xs text-li-text">${escHtml(j.title)}</div>
            <div class="text-[10px] text-li-muted">${escHtml(j.company)} · ${escHtml(j.location)}</div>
          </div>`;
        });
      }

      resultsContainer.innerHTML = out;
      dropdown.classList.remove('hidden');
    } catch (e) {
      console.warn('Search autocomplete error:', e);
    }
  }, 200);
}

// ══════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════

function formatPostContent(text) {
  if (!text) return '';
  let safe = escHtml(text);
  // Highlight hashtags
  safe = safe.replace(/#(\w+)/g, '<span class="text-li-blue font-medium cursor-pointer hover:underline" onclick="doGlobalSearch(\'$1\')">#$1</span>');
  // Highlight @mentions (bold)
  safe = safe.replace(/@(\w+)/g, '<span class="font-semibold text-li-blue">@$1</span>');
  // Auto-link URLs
  safe = safe.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="text-li-blue hover:underline">$1</a>');
  return safe;
}

function renderPollInline(post) {
  if (!post.poll) return '';
  const poll = post.poll;
  const myVote = poll.voters && poll.voters[currentUser?.id];
  const hasVoted = myVote !== undefined;
  const total = poll.totalVotes || 0;

  return `<div class="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
    <div class="font-semibold text-sm mb-3">${escHtml(poll.question)}</div>
    <div class="space-y-2">${poll.options.map((opt, i) => {
      const votes = opt.votes || 0;
      const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
      const isMyVote = hasVoted && myVote === i;
      if (hasVoted) {
        return `<div class="relative rounded overflow-hidden border ${isMyVote ? 'border-li-blue' : 'border-slate-200'}">
          <div class="absolute inset-0 bg-blue-50" style="width:${pct}%"></div>
          <div class="relative flex items-center justify-between px-3 py-2 text-sm">
            <span class="${isMyVote ? 'font-semibold' : ''}">${escHtml(opt.text)} ${isMyVote ? '✓' : ''}</span>
            <span class="font-semibold text-xs">${pct}%</span>
          </div>
        </div>`;
      } else {
        return `<button onclick="votePoll('${post.id}',${i})" class="w-full text-left border border-li-blue text-li-blue rounded px-3 py-2 text-sm hover:bg-blue-50 transition">${escHtml(opt.text)}</button>`;
      }
    }).join('')}</div>
    <div class="text-xs text-li-muted mt-2">${total} vote${total !== 1 ? 's' : ''} · ${escHtml(poll.duration)}</div>
  </div>`;
}

async function votePoll(postId, optionIndex) {
  try {
    const result = await apiFetch(`/api/posts/${postId}/vote`, { method: 'POST', body: JSON.stringify({ optionIndex }) });
    const post = cachedPosts.find(p => p.id === postId);
    if (post) { post.poll = result.poll; renderPosts(cachedPosts); }
    toast('Vote recorded! 📊');
  } catch(e) { toast(e.message, 'error'); }
}

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.background = type === 'error' ? '#ef4444' : '#191919';
  el.style.opacity = '1';
  el.classList.remove('pointer-events-none');
  setTimeout(() => { el.style.opacity = '0'; el.classList.add('pointer-events-none'); }, 3000);
}

function escHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ══════════════════════════════════════════════════════
// COMMENTS
// ══════════════════════════════════════════════════════
async function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  if (!section) return;
  const isHidden = section.classList.contains('hidden');
  section.classList.toggle('hidden');
  if (isHidden) loadComments(postId);
}

async function loadComments(postId) {
  try {
    const comments = await apiFetch(`/api/posts/${postId}/comments`);
    const container = document.getElementById(`comments-list-${postId}`);
    if (!comments.length) { container.innerHTML = '<div class="text-xs text-li-muted py-2">No comments yet. Be the first!</div>'; return; }
    container.innerHTML = comments.map(c => {
      const author = c.author || {};
      const initials = (author.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      const liked = c.likedBy?.includes(currentUser?.id);
      return `<div class="comment-item flex items-start space-x-2 py-1">
        <div class="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">${initials}</div>
        <div class="flex-1 bg-[#f3f2f0] rounded-lg px-3 py-1.5">
          <div class="font-semibold text-xs">${escHtml(author.name || 'Unknown')}</div>
          <div class="text-xs text-li-muted">${escHtml(author.headline || '')}</div>
          <p class="text-xs mt-1">${escHtml(c.content)}</p>
          <div class="flex items-center space-x-3 mt-1 text-[10px] text-li-muted">
            <button onclick="likeComment('${c.id}','${postId}')" class="hover:text-li-blue ${liked ? 'text-li-blue font-semibold' : ''}">${liked ? 'Liked' : 'Like'} · ${c.likes || 0}</button>
            <span>${relativeTime(c.createdAt)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  } catch(e) { console.error('Comments error:', e); }
}

async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const content = input.value.trim();
  if (!content) return;
  try {
    await apiFetch(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
    input.value = '';
    loadComments(postId);
    // Update comment count in cached posts
    const post = cachedPosts.find(p => p.id === postId);
    if (post) { post.comments = (post.comments || 0) + 1; renderPosts(cachedPosts); }
    toast('Comment added!');
  } catch(e) { toast(e.message, 'error'); }
}

async function likeComment(commentId, postId) {
  try {
    await apiFetch(`/api/comments/${commentId}/like`, { method: 'POST' });
    loadComments(postId);
  } catch(e) { toast(e.message, 'error'); }
}

function sharePost(postId) {
  const post = cachedPosts.find(p => p.id === postId);
  if (post) {
    navigator.clipboard?.writeText(`Check out this post: "${post.content.substring(0,100)}..." on OpenToNetwork`);
    toast('Link copied to clipboard! 📋');
  }
}

// ══════════════════════════════════════════════════════
// MESSAGING
// ══════════════════════════════════════════════════════
let currentChatUserId = null;
let cachedConversations = [];

async function loadConversations() {
  try {
    const convs = await apiFetch('/api/conversations');
    cachedConversations = convs;
    renderConversations(convs);
    // Update badge
    const totalUnread = convs.reduce((sum, c) => sum + (c.unread || 0), 0);
    const badge = document.getElementById('msgBadge');
    if (badge) {
      if (totalUnread > 0) { badge.textContent = totalUnread; badge.classList.remove('hidden'); }
      else badge.classList.add('hidden');
    }
  } catch(e) { console.error('Conversations error:', e); }
}

function renderConversations(convs) {
  const container = document.getElementById('conversationList');
  if (!convs.length) {
    container.innerHTML = '<div class="text-center text-li-muted text-sm py-8 px-4">No conversations yet.<br><button onclick="openNewMessageModal()" class="text-li-blue hover:underline mt-2">Start a conversation</button></div>';
    return;
  }
  container.innerHTML = convs.map(c => {
    const user = c.withUser || {};
    const initials = (user.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    const active = currentChatUserId === user.id ? 'bg-blue-50 border-l-2 border-li-blue' : 'hover:bg-slate-50';
    const lastMsg = c.lastMessage?.content || '';
    return `<div onclick="openChat('${user.id}')" class="flex items-center space-x-3 px-4 py-3 cursor-pointer ${active} transition">
      <div class="w-10 h-10 rounded-full bg-li-blue flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">${initials}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm truncate ${c.unread ? 'text-li-text' : 'text-li-muted'}">${escHtml(user.name || 'Unknown')}</span>
          <span class="text-[10px] text-li-muted flex-shrink-0">${relativeTime(c.lastMessage?.createdAt)}</span>
        </div>
        <p class="text-xs truncate ${c.unread ? 'text-li-text font-medium' : 'text-li-muted'}">${escHtml(lastMsg.substring(0,50))}${lastMsg.length > 50 ? '...' : ''}</p>
      </div>
      ${c.unread ? `<span class="w-5 h-5 bg-li-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">${c.unread}</span>` : ''}
    </div>`;
  }).join('');
}

function filterConversations(q) {
  if (!q.trim()) { renderConversations(cachedConversations); return; }
  const filtered = cachedConversations.filter(c =>
    c.withUser?.name?.toLowerCase().includes(q.toLowerCase()) ||
    c.lastMessage?.content?.toLowerCase().includes(q.toLowerCase())
  );
  renderConversations(filtered);
}

async function openChat(userId) {
  currentChatUserId = userId;
  try {
    const msgs = await apiFetch(`/api/messages/${userId}`);
    const user = msgs.length > 0 ? (msgs[0].from === userId ? msgs[0].fromUser : msgs[0].toUser) : null;
    const userName = user?.name || 'Unknown';
    const initials = userName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

    document.getElementById('msgThreadHeader').innerHTML = `
      <div class="w-10 h-10 rounded-full bg-li-blue flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">${initials}</div>
      <div><div class="font-semibold text-sm">${escHtml(userName)}</div><div class="text-xs text-li-muted">${escHtml(user?.headline || '')}</div></div>`;

    const thread = document.getElementById('msgThread');
    if (!msgs.length) {
      thread.innerHTML = '<div class="text-center text-li-muted text-sm py-12">Start a conversation!</div>';
    } else {
      thread.innerHTML = msgs.map(m => {
        const isMine = m.from === currentUser.id;
        return `<div class="max-w-[70%] ${isMine ? 'msg-mine' : 'msg-theirs'} rounded-xl px-4 py-2 shadow-sm">
          <p class="text-sm">${escHtml(m.content)}</p>
          <div class="text-[10px] text-li-muted mt-1 ${isMine ? 'text-right' : ''}">${relativeTime(m.createdAt)}</div>
        </div>`;
      }).join('');
      thread.scrollTop = thread.scrollHeight;
    }

    document.getElementById('msgComposer').classList.remove('hidden');
    document.getElementById('msgInput').focus();
    loadConversations(); // refresh unread counts
  } catch(e) { console.error('Chat error:', e); }
}

async function sendMessage() {
  if (!currentChatUserId) return;
  const input = document.getElementById('msgInput');
  const content = input.value.trim();
  if (!content) return;
  try {
    await apiFetch(`/api/messages/${currentChatUserId}`, { method: 'POST', body: JSON.stringify({ content }) });
    input.value = '';
    openChat(currentChatUserId); // refresh
    toast('Message sent!');
  } catch(e) { toast(e.message, 'error'); }
}

function openNewMessageModal() {
  // Populate user list
  apiFetch('/api/people').then(people => {
    const select = document.getElementById('newMsgTo');
    select.innerHTML = people.map(p => `<option value="${p.id}">${escHtml(p.name)} — ${escHtml(p.headline || '')}</option>`).join('');
  });
  document.getElementById('newMsgModal').classList.remove('hidden');
}
function closeNewMessageModal() { document.getElementById('newMsgModal').classList.add('hidden'); }

async function sendNewMessage() {
  const toId = document.getElementById('newMsgTo').value;
  const content = document.getElementById('newMsgContent').value.trim();
  if (!toId || !content) return toast('Select a recipient and write a message', 'error');
  try {
    await apiFetch(`/api/messages/${toId}`, { method: 'POST', body: JSON.stringify({ content }) });
    closeNewMessageModal();
    document.getElementById('newMsgContent').value = '';
    currentChatUserId = toId;
    showView('messaging');
    openChat(toId);
    toast('Message sent! 💬');
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// GLOBAL SEARCH
// ══════════════════════════════════════════════════════
let currentSearchQuery = '';
let currentSearchTab = 'all';
let cachedSearchResults = {};

async function doGlobalSearch(query) {
  const q = query.trim();
  if (!q) return;
  currentSearchQuery = q;
  currentSearchTab = 'all';
  showView('search');
  document.getElementById('searchQueryDisplay').textContent = q;
  
  try {
    cachedSearchResults = await apiFetch(`/api/search?q=${encodeURIComponent(q)}&type=all`);
    switchSearchTab('all');
  } catch(e) { console.error('Search error:', e); }
}

function switchSearchTab(tab) {
  currentSearchTab = tab;
  ['all','people','posts','jobs'].forEach(t => {
    const btn = document.getElementById(`searchTab-${t}`);
    if (btn) btn.classList.toggle('search-tab-active', t === tab);
  });
  renderSearchResults();
}

function renderSearchResults() {
  const container = document.getElementById('searchResults');
  const r = cachedSearchResults;
  let html = '';

  if (currentSearchTab === 'all' || currentSearchTab === 'people') {
    const people = r.people || [];
    if (people.length || currentSearchTab === 'people') {
      html += `<div class="bg-white rounded-lg border border-li-border shadow-sm p-4">
        <h3 class="font-bold text-sm mb-3">People (${people.length})</h3>
        ${people.length ? people.map(p => {
          const initials = p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
          return `<div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-li-blue flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">${initials}</div>
              <div><div class="font-semibold text-sm">${escHtml(p.name)}</div><div class="text-xs text-li-muted">${escHtml(p.headline || '')}</div><div class="text-xs text-li-muted">${escHtml(p.location || '')}</div></div>
            </div>
            <div class="flex space-x-2">
              <button onclick="sendConnect('${p.id}',this)" class="text-xs text-li-blue border border-li-blue px-3 py-1 rounded-full hover:bg-blue-50">Connect</button>
              <button onclick="currentChatUserId='${p.id}';showView('messaging');openChat('${p.id}')" class="text-xs text-li-muted border border-li-border px-3 py-1 rounded-full hover:bg-slate-50">Message</button>
            </div>
          </div>`;
        }).join('') : '<div class="text-sm text-li-muted">No people found.</div>'}
      </div>`;
    }
  }

  if (currentSearchTab === 'all' || currentSearchTab === 'posts') {
    const posts = r.posts || [];
    if (posts.length || currentSearchTab === 'posts') {
      html += `<div class="bg-white rounded-lg border border-li-border shadow-sm p-4">
        <h3 class="font-bold text-sm mb-3">Posts (${posts.length})</h3>
        ${posts.length ? posts.map(p => {
          const author = p.author || {};
          return `<div class="py-3 border-b border-slate-100 last:border-0">
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-semibold text-xs">${escHtml(author.name || 'Unknown')}</span>
              <span class="text-[10px] text-li-muted">· ${relativeTime(p.createdAt)}</span>
            </div>
            <p class="text-sm line-clamp-3">${escHtml(p.content)}</p>
            <div class="text-xs text-li-muted mt-1">${p.likes} likes · ${p.comments} comments</div>
          </div>`;
        }).join('') : '<div class="text-sm text-li-muted">No posts found.</div>'}
      </div>`;
    }
  }

  if (currentSearchTab === 'all' || currentSearchTab === 'jobs') {
    const jobs = r.jobs || [];
    if (jobs.length || currentSearchTab === 'jobs') {
      html += `<div class="bg-white rounded-lg border border-li-border shadow-sm p-4">
        <h3 class="font-bold text-sm mb-3">Jobs (${jobs.length})</h3>
        ${jobs.length ? jobs.map(j => `<div class="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-0">
            <div class="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-li-blue font-bold flex-shrink-0">${j.company[0]}</div>
            <div class="flex-1">
              <div class="font-semibold text-sm">${escHtml(j.title)}</div>
              <div class="text-xs text-li-muted">${escHtml(j.company)} · ${escHtml(j.location)}</div>
              <div class="text-xs text-li-muted">${escHtml(j.type)} · ${escHtml(j.remote)}</div>
            </div>
            <button onclick="applyJob('${j.id}',this)" class="bg-li-blue hover:bg-li-hover text-white text-xs font-semibold px-4 py-1.5 rounded-full transition flex-shrink-0">Apply</button>
          </div>`).join('') : '<div class="text-sm text-li-muted">No jobs found.</div>'}
      </div>`;
    }
  }

  if (!html) html = '<div class="bg-white rounded-lg border border-li-border shadow-sm p-8 text-center text-li-muted">No results found.</div>';
  container.innerHTML = html;
}

// ══════════════════════════════════════════════════════
// DROPDOWNS & MENUS (Me dropdown, For Business)
// ══════════════════════════════════════════════════════
function toggleMeDropdown() {
  const el = document.getElementById('meDropdown');
  if (el) el.classList.toggle('hidden');
  document.getElementById('businessDropdown')?.classList.add('hidden');
}

function toggleBusinessDropdown() {
  const el = document.getElementById('businessDropdown');
  if (el) el.classList.toggle('hidden');
  document.getElementById('meDropdown')?.classList.add('hidden');
}

document.addEventListener('click', (e) => {
  const meMenu = document.getElementById('meDropdown');
  const bizMenu = document.getElementById('businessDropdown');
  if (meMenu && !e.target.closest('#meDropdown') && !e.target.closest('[onclick="toggleMeDropdown()"]')) {
    meMenu.classList.add('hidden');
  }
  if (bizMenu && !e.target.closest('#businessDropdown') && !e.target.closest('[onclick="toggleBusinessDropdown()"]')) {
    bizMenu.classList.add('hidden');
  }
});

// ══════════════════════════════════════════════════════
// REPOST & SEND TO CHAT
// ══════════════════════════════════════════════════════
let currentRepostTargetId = null;

function openRepostModal(postId) {
  currentRepostTargetId = postId;
  const post = cachedPosts.find(p => p.id === postId);
  if (!post) return;
  const prev = document.getElementById('repostOriginalPreview');
  const author = post.author || {};
  prev.innerHTML = `
    <div class="flex items-center space-x-2 mb-1.5">
      ${renderAvatarHtml(author, 'w-6 h-6', 'text-[10px]')}
      <span class="font-bold text-xs">${escHtml(author.name || 'Unknown')}</span>
      <span class="text-li-muted text-[10px]">· ${relativeTime(post.createdAt)}</span>
    </div>
    <p class="line-clamp-2 text-xs">${escHtml(post.content)}</p>`;
  document.getElementById('repostThoughts').value = '';
  document.getElementById('repostModal').classList.remove('hidden');
}

function closeRepostModal() {
  document.getElementById('repostModal').classList.add('hidden');
}

async function submitRepost(withThoughts) {
  if (!currentRepostTargetId) return;
  const content = withThoughts ? document.getElementById('repostThoughts').value.trim() : '';
  try {
    const newPost = await apiFetch(`/api/posts/${currentRepostTargetId}/repost`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    cachedPosts.unshift(newPost);
    renderPosts(cachedPosts);
    closeRepostModal();
    toast('Reposted to your network! 🚀');
  } catch(e) { toast(e.message, 'error'); }
}

let currentSendPostId = null;

function openSendPostModal(postId) {
  currentSendPostId = postId;
  apiFetch('/api/people').then(people => {
    const sel = document.getElementById('sendPostRecipient');
    sel.innerHTML = people.map(p => `<option value="${p.id}">${escHtml(p.name)} (${escHtml(p.headline || '')})</option>`).join('');
    document.getElementById('sendPostNote').value = '';
    document.getElementById('sendPostModal').classList.remove('hidden');
  });
}

function closeSendPostModal() {
  document.getElementById('sendPostModal').classList.add('hidden');
}

async function submitSendPost() {
  if (!currentSendPostId) return;
  const toId = document.getElementById('sendPostRecipient').value;
  const note = document.getElementById('sendPostNote').value.trim();
  const post = cachedPosts.find(p => p.id === currentSendPostId);
  const snippet = post ? `\n\n[Shared post by ${post.author?.name || 'someone'}]: "${post.content.substring(0, 120)}..."` : '';
  const msgContent = (note ? note + snippet : `Check out this post:` + snippet).trim();
  try {
    await apiFetch(`/api/messages/${toId}`, { method: 'POST', body: JSON.stringify({ content: msgContent }) });
    closeSendPostModal();
    toast('Post sent in message! 💬');
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════
init();


// ── EMOJI PICKER DRAWER ────────────────────────────────────────────────────
const EMOJI_SETS = {
  work: ['💼','🚀','💡','📈','🎯','🤝','📊','🏆','💻','🧠','⚡','🌟','💰','🔍','📝','📅','📌','🏷️','🏢','🔑','🛠️','📚','🎓','🌐'],
  react: ['👍','👏','🤝','❤️','💡','😂','🙌','🔥','✨','💯','🚀','👊','🙏','👀','✌️','🎉','💪','🥂','🥳','🌟','🤩','💬','✍️','⭐'],
  smile: ['😊','😃','😎','🤔','🤩','🥳','🤓','😇','🧐','☕','🍕','🥑','🌈','☀️','🏖️','✈️','🎉','🎈','🎁','🎊'],
  tags: ['🟢','🔴','🟡','🔵','🟣','🥇','🥈','🥉','🏅','🎖️','🔖','📌','📍','🚩','🏁','🚀','💎','🔔','📢','⭐']
};
let currentEmojiTab = 'work';

function toggleEmojiDrawer() {
  const drawer = document.getElementById('emojiPickerDrawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
  if (!drawer.classList.contains('hidden')) {
    switchEmojiTab(currentEmojiTab);
  }
}

function switchEmojiTab(tab) {
  currentEmojiTab = tab;
  ['work', 'react', 'smile', 'tags'].forEach(t => {
    const btn = document.getElementById('emojiTab-' + t);
    if (btn) {
      if (t === tab) {
        btn.className = 'emoji-tab px-2 py-0.5 rounded font-semibold bg-li-blue text-white';
      } else {
        btn.className = 'emoji-tab px-2 py-0.5 rounded text-li-muted hover:bg-slate-200';
      }
    }
  });

  const grid = document.getElementById('emojiGrid');
  if (!grid) return;
  const list = EMOJI_SETS[tab] || EMOJI_SETS.work;
  grid.innerHTML = list.map(em => `<button onclick="insertEmoji('${em}')" class="p-1 hover:bg-slate-100 rounded text-center transition hover:scale-125 transform">${em}</button>`).join('');
}

function insertEmoji(em) {
  const textarea = document.getElementById('postContentInput');
  if (!textarea) return;
  const start = textarea.selectionStart || textarea.value.length;
  const end = textarea.selectionEnd || textarea.value.length;
  textarea.value = textarea.value.substring(0, start) + em + textarea.value.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + em.length;
  textarea.focus();
  updatePostPreview();
}

// ── REACTION DETAILS MODAL ─────────────────────────────────────────────────
let cachedCurrentPostReactors = [];

async function openReactionListModal(postId) {
  const modal = document.getElementById('reactionListModal');
  const tabs = document.getElementById('reactionTabs');
  const userList = document.getElementById('reactionUsersList');
  if (!modal || !tabs || !userList) return;

  modal.classList.remove('hidden');
  userList.innerHTML = '<div class="p-6 text-center text-li-muted">Loading reactions…</div>';

  try {
    const res = await apiFetch('/api/posts/' + postId + '/reactors');
    const reactors = res.reactors || [];
    cachedCurrentPostReactors = reactors;

    // Render tabs: All, 👍 Like, 👏 Celebrate, etc.
    const reactionEmojis = { like: '👍', celebrate: '👏', support: '🤝', love: '❤️', insightful: '💡', funny: '😂' };
    const counts = { all: reactors.length };
    reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] || 0) + 1; });

    let tabsHtml = `<button onclick="filterReactionModalUsers('all')" class="rx-filter-tab px-3 py-1 font-bold text-li-blue border-b-2 border-li-blue">All (${reactors.length})</button>`;
    for (const [key, em] of Object.entries(reactionEmojis)) {
      if (counts[key]) {
        tabsHtml += `<button onclick="filterReactionModalUsers('${key}')" class="rx-filter-tab px-3 py-1 text-li-muted hover:text-li-text">${em} (${counts[key]})</button>`;
      }
    }
    tabs.innerHTML = tabsHtml;
    renderReactionModalUsers(reactors);
  } catch (err) {
    userList.innerHTML = '<div class="p-6 text-center text-red-500">Failed to load reactions</div>';
  }
}

function filterReactionModalUsers(type) {
  const tabs = document.querySelectorAll('.rx-filter-tab');
  tabs.forEach(t => {
    t.className = 'rx-filter-tab px-3 py-1 text-li-muted hover:text-li-text';
  });
  if (event && event.target) {
    event.target.className = 'rx-filter-tab px-3 py-1 font-bold text-li-blue border-b-2 border-li-blue';
  }

  const filtered = type === 'all' ? cachedCurrentPostReactors : cachedCurrentPostReactors.filter(r => r.reaction === type);
  renderReactionModalUsers(filtered);
}

function renderReactionModalUsers(list) {
  const userList = document.getElementById('reactionUsersList');
  if (!userList) return;
  if (!list.length) {
    userList.innerHTML = '<div class="p-6 text-center text-li-muted">No reactions in this category.</div>';
    return;
  }
  const reactionEmojis = { like: '👍', celebrate: '👏', support: '🤝', love: '❤️', insightful: '💡', funny: '😂' };

  userList.innerHTML = list.map(r => `
    <div class="flex items-center justify-between py-2.5">
      <div class="flex items-center space-x-3">
        <div class="relative">
          ${renderAvatarHtml(r, 'w-10 h-10', 'text-sm')}
          <span class="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow">${reactionEmojis[r.reaction] || '👍'}</span>
        </div>
        <div>
          <div class="font-bold text-xs text-li-text flex items-center">
            ${escHtml(r.name)}
            ${renderVerifiedBadge(r)}
            ${renderPremiumBadge(r)}
          </div>
          <div class="text-[11px] text-li-muted truncate max-w-xs">${escHtml(r.headline || '')}</div>
        </div>
      </div>
      <button onclick="currentChatUserId='${r.id}';closeReactionListModal();showView('messaging');openChat('${r.id}')" class="border border-li-blue text-li-blue text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-50 transition">Message</button>
    </div>
  `).join('');
}

function closeReactionListModal() {
  document.getElementById('reactionListModal')?.classList.add('hidden');
}
