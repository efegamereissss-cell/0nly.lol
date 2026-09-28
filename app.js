/**
 * 0NLY.LOL | CORE ENGINE
 * Single Page App Router, Real-time Profile Studio, 3D Tilt Physics, Local Database
 */

// ================= 1. PROFİL VERİTABANI & LOCAL STORAGE =================
const DEFAULT_PROFILES = {
  jason: {
    handle: "jason",
    displayName: "Jason",
    pronouns: "he/him",
    location: "Miami, FL",
    bio: "Sanalın en prestijli köşesi • Hard Roleplay Enthusiast • \"The world belongs to the silent few.\"",
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80",
    theme: "theme-purple",
    ring: "ring-neon",
    verified: true,
    badges: ["og", "vip", "verified", "sanalci"],
    status: "online",
    discord: {
      title: "Multi Theft Auto: San Andreas",
      sub: "Retro Roleplay (Miami 1986)",
      time: "02:40:15 geçen süre"
    },
    socials: {
      discord: "https://discord.gg/retrorp",
      telegram: "https://t.me",
      steam: "https://steamcommunity.com",
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      github: "https://github.com",
      x: "https://x.com",
      youtube: "https://youtube.com"
    }
  }
};

function getProfileDatabase() {
  const saved = localStorage.getItem('0nly_profiles_db');
  if (saved) {
    try {
      return { ...DEFAULT_PROFILES, ...JSON.parse(saved) };
    } catch (e) {
      return DEFAULT_PROFILES;
    }
  }
  return DEFAULT_PROFILES;
}

function saveProfileToDatabase(profile) {
  const db = getProfileDatabase();
  db[profile.handle] = profile;
  localStorage.setItem('0nly_profiles_db', JSON.stringify(db));
  localStorage.setItem('0nly_last_my_profile', profile.handle);
}

// ================= 2. SES MOTORU (Sadece Minimal UI Tıklama Sesleri) =================
let audioCtx = null;
function playUiClick(freq = 800, duration = 0.04) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// ================= 3. TEK SAYFA YÖNLENDİRİCİSİ (SPA ROUTER) =================
function navigateTo(route) {
  playUiClick(700, 0.03);
  window.location.hash = route;
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  
  // Tüm görünümleri kapat
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  if (hash === '#/' || hash === '' || hash === '#/home') {
    // 1. Ana Sayfa (Home)
    document.getElementById('view-home').classList.add('active');
    document.getElementById('navHomeBtn').classList.add('active');
    document.title = "0NLY.LOL | Sanalın En Havalı VIP Kimliği";
  } 
  else if (hash === '#/profilecreate' || hash.startsWith('#/profilecreate')) {
    // 2. Profil Oluşturma Stüdyosu
    document.getElementById('view-profilecreate').classList.add('active');
    document.getElementById('navCreateBtn').classList.add('active');
    document.title = "0NLY.LOL / Stüdyo | VIP Profil Mimarı";
    initStudioWithCurrentValues();
  } 
  else {
    // 3. Halka Açık Özel Profil Görünümü (#/{username})
    const username = hash.replace('#/', '').replace('#', '');
    const db = getProfileDatabase();
    const profile = db[username];

    if (profile) {
      document.getElementById('view-public-profile').classList.add('active');
      renderPublicProfile(profile);
      document.title = `${profile.displayName} (@${profile.handle}) | 0NLY.LOL VIP`;
    } else {
      // Bulunamadıysa stüdyoya yönlendir ve handle'ı ayarla
      showOnlyToast("Profil Bulunamadı", `@${username} henüz oluşturulmamış. Hemen ilk sen ol!`);
      navigateTo('#/profilecreate');
      document.getElementById('inputHandle').value = username;
      updateLivePreview();
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  handleRoute();
  setup3dTilt();
  initAmbientCanvas();
});

// ================= 4. STÜDYO DÜZENLEYİCİ MANTIĞI =================
let selectedTheme = 'theme-obsidian';
let selectedRing = 'ring-neon';

function switchEditorTab(tabId) {
  playUiClick(850, 0.03);
  document.querySelectorAll('.editor-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.editor-content-tab').forEach(tab => tab.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function pickTheme(themeClass) {
  playUiClick(900, 0.04);
  selectedTheme = themeClass;

  document.querySelectorAll('.theme-card').forEach(c => {
    if (c.getAttribute('data-theme') === themeClass) c.classList.add('active');
    else c.classList.remove('active');
  });

  document.getElementById('appBody').className = themeClass;
}

function pickRingStyle(ringClass) {
  playUiClick(850, 0.03);
  selectedRing = ringClass;

  document.querySelectorAll('.ring-choice-btn').forEach(btn => {
    if (btn.getAttribute('data-ring') === ringClass) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const ringEl = document.getElementById('cardAvatarRing');
  ringEl.className = `avatar-ring ${ringClass}`;
}

const RANDOM_AVATARS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80"
];

function generateRandomAvatar() {
  playUiClick(1000, 0.05);
  const randomPic = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
  document.getElementById('inputAvatarUrl').value = randomPic;
  updateLivePreview();
}

function initStudioWithCurrentValues() {
  const db = getProfileDatabase();
  const lastHandle = localStorage.getItem('0nly_last_my_profile') || 'jason';
  const data = db[lastHandle] || db.jason;

  document.getElementById('inputHandle').value = data.handle || '';
  document.getElementById('inputDisplayName').value = data.displayName || '';
  document.getElementById('inputPronouns').value = data.pronouns || '';
  document.getElementById('inputLocation').value = data.location || '';
  document.getElementById('inputAvatarUrl').value = data.avatarUrl || '';
  document.getElementById('inputBio').value = data.bio || '';

  if (data.discord) {
    document.getElementById('inputDiscordTitle').value = data.discord.title || '';
    document.getElementById('inputDiscordSub').value = data.discord.sub || '';
    document.getElementById('inputDiscordTime').value = data.discord.time || '';
  }

  if (data.socials) {
    document.getElementById('linkDiscord').value = data.socials.discord || '';
    document.getElementById('linkTelegram').value = data.socials.telegram || '';
    document.getElementById('linkSteam').value = data.socials.steam || '';
    document.getElementById('linkSpotify').value = data.socials.spotify || '';
    document.getElementById('linkInstagram').value = data.socials.instagram || '';
    document.getElementById('linkGithub').value = data.socials.github || '';
    document.getElementById('linkX').value = data.socials.x || '';
    document.getElementById('linkYoutube').value = data.socials.youtube || '';
  }

  if (data.theme) pickTheme(data.theme);
  if (data.ring) pickRingStyle(data.ring);

  updateLivePreview();
}

// CANLI ÖNİZLEME MOTORU (Her tuşa basışta çalışır)
function updateLivePreview() {
  const handle = document.getElementById('inputHandle').value.trim() || 'kullanici';
  const name = document.getElementById('inputDisplayName').value.trim() || 'VIP Sanalcı';
  const pronouns = document.getElementById('inputPronouns').value.trim() || 'sanal';
  const location = document.getElementById('inputLocation').value.trim() || 'Earth';
  const bio = document.getElementById('inputBio').value.trim() || 'Sanalın en havalı profil alanı.';
  const avatar = document.getElementById('inputAvatarUrl').value.trim() || RANDOM_AVATARS[0];
  const isVerified = document.getElementById('checkVerifiedBadge').checked;
  const status = document.getElementById('selectOnlineStatus').value;

  // Stüdyo üst bar URL önizleme
  document.getElementById('liveUrlPreview').textContent = handle;

  // Kart metinleri
  document.getElementById('cardDisplayName').textContent = name;
  document.getElementById('cardHandleText').textContent = '0nly.lol/' + handle;
  document.getElementById('cardPronounsText').textContent = pronouns;
  document.getElementById('cardLocationText').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${location}`;
  document.getElementById('cardBioText').textContent = bio;
  document.getElementById('cardAvatarImg').src = avatar;

  // Verified Badge
  const verBadge = document.getElementById('cardVerified');
  verBadge.style.display = isVerified ? 'inline-block' : 'none';

  // Online Durumu
  const indicator = document.getElementById('cardStatusIndicator');
  indicator.className = `online-indicator ${status}`;

  // Rozetler
  const badgesRack = document.getElementById('cardBadges');
  badgesRack.innerHTML = '';
  const selectedBadgeInputs = document.querySelectorAll('.badge-checkbox input:checked');
  selectedBadgeInputs.forEach(input => {
    const val = input.value;
    const badgeMap = {
      og: { icon: "fa-solid fa-crown", class: "og" },
      vip: { icon: "fa-solid fa-gem", class: "vip" },
      verified: { icon: "fa-solid fa-shield-halved", class: "verified" },
      dev: { icon: "fa-solid fa-code", class: "dev" },
      staff: { icon: "fa-solid fa-bolt", class: "staff" },
      booster: { icon: "fa-solid fa-rocket", class: "booster" },
      sanalci: { icon: "fa-solid fa-skull", class: "sanalci" }
    };
    if (badgeMap[val]) {
      const bEl = document.createElement('div');
      bEl.className = `card-badge-icon ${badgeMap[val].class}`;
      bEl.innerHTML = `<i class="${badgeMap[val].icon}"></i>`;
      badgesRack.appendChild(bEl);
    }
  });

  // Discord Kutusu
  const dTitle = document.getElementById('inputDiscordTitle').value.trim();
  const dSub = document.getElementById('inputDiscordSub').value.trim();
  const dTime = document.getElementById('inputDiscordTime').value.trim();
  const dBox = document.getElementById('cardDiscordBox');

  if (dTitle || dSub) {
    dBox.style.display = 'block';
    document.getElementById('cardDiscordTitle').textContent = dTitle || 'Visual Studio Code';
    document.getElementById('cardDiscordSub').textContent = dSub || 'Coding';
    document.getElementById('cardDiscordTime').textContent = dTime || 'Çevrimiçi';
  } else {
    dBox.style.display = 'none';
  }

  // Sosyal Medya İkonları
  const socialsGrid = document.getElementById('cardSocialsGrid');
  socialsGrid.innerHTML = '';

  const socialFields = [
    { id: 'linkDiscord', icon: 'fa-brands fa-discord', label: 'Discord' },
    { id: 'linkTelegram', icon: 'fa-brands fa-telegram', label: 'Telegram' },
    { id: 'linkSteam', icon: 'fa-brands fa-steam', label: 'Steam' },
    { id: 'linkSpotify', icon: 'fa-brands fa-spotify', label: 'Spotify' },
    { id: 'linkInstagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
    { id: 'linkGithub', icon: 'fa-brands fa-github', label: 'GitHub' },
    { id: 'linkX', icon: 'fa-brands fa-x-twitter', label: 'X' },
    { id: 'linkYoutube', icon: 'fa-brands fa-youtube', label: 'YouTube' }
  ];

  socialFields.forEach(f => {
    const val = document.getElementById(f.id).value.trim();
    if (val) {
      const btn = document.createElement('a');
      btn.href = val.startsWith('http') ? val : 'https://' + val;
      btn.target = '_blank';
      btn.className = 'card-social-btn';
      btn.innerHTML = `<i class="${f.icon}"></i> <span>${f.label}</span>`;
      socialsGrid.appendChild(btn);
    }
  });
}

function resetStudioForm() {
  playUiClick(600, 0.05);
  document.getElementById('inputHandle').value = '';
  document.getElementById('inputDisplayName').value = '';
  document.getElementById('inputBio').value = '';
  document.getElementById('inputPronouns').value = '';
  document.getElementById('inputLocation').value = '';
  document.getElementById('inputDiscordTitle').value = '';
  document.getElementById('inputDiscordSub').value = '';
  document.getElementById('inputDiscordTime').value = '';
  updateLivePreview();
  showOnlyToast("Form Sıfırlandı", "Tüm alanlar temizlendi.");
}

// PROFİLİ YAYINLA & LİNK AL
function publishProfile() {
  playUiClick(1100, 0.08);

  const rawHandle = document.getElementById('inputHandle').value.trim();
  if (!rawHandle) {
    showOnlyToast("Hata!", "Lütfen profiliniz için bir handle (kullanıcı linki) belirleyin.");
    document.getElementById('inputHandle').focus();
    return;
  }

  const cleanHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  const badges = [];
  document.querySelectorAll('.badge-checkbox input:checked').forEach(c => badges.push(c.value));

  const profileData = {
    handle: cleanHandle,
    displayName: document.getElementById('inputDisplayName').value.trim() || cleanHandle,
    pronouns: document.getElementById('inputPronouns').value.trim() || 'they/them',
    location: document.getElementById('inputLocation').value.trim() || 'Cyberspace',
    bio: document.getElementById('inputBio').value.trim() || '0nly.lol VIP Member',
    avatarUrl: document.getElementById('inputAvatarUrl').value.trim() || RANDOM_AVATARS[0],
    theme: selectedTheme,
    ring: selectedRing,
    verified: document.getElementById('checkVerifiedBadge').checked,
    status: document.getElementById('selectOnlineStatus').value,
    badges: badges,
    discord: {
      title: document.getElementById('inputDiscordTitle').value.trim(),
      sub: document.getElementById('inputDiscordSub').value.trim(),
      time: document.getElementById('inputDiscordTime').value.trim()
    },
    socials: {
      discord: document.getElementById('linkDiscord').value.trim(),
      telegram: document.getElementById('linkTelegram').value.trim(),
      steam: document.getElementById('linkSteam').value.trim(),
      spotify: document.getElementById('linkSpotify').value.trim(),
      instagram: document.getElementById('linkInstagram').value.trim(),
      github: document.getElementById('linkGithub').value.trim(),
      x: document.getElementById('linkX').value.trim(),
      youtube: document.getElementById('linkYoutube').value.trim()
    }
  };

  // Veritabanına kaydet
  saveProfileToDatabase(profileData);

  // Link kopyala
  const profileUrl = `${window.location.origin}${window.location.pathname}#/${cleanHandle}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(profileUrl);
  }

  showOnlyToast("0NLY.LOL Profilin Yayında! 🔥", `0nly.lol/${cleanHandle} linki panoya kopyalandı.`);

  // Yeni oluşturulan profile git
  setTimeout(() => {
    navigateTo(`#/${cleanHandle}`);
  }, 600);
}

// ================= 5. HALKA AÇIK PROFİL RENDER =================
function renderPublicProfile(profile) {
  // Temayı uygula
  document.getElementById('appBody').className = profile.theme || 'theme-obsidian';

  const mount = document.getElementById('publicCardMount');
  
  // Sosyal link butonları
  let socialsHtml = '';
  if (profile.socials) {
    for (const [key, url] of Object.entries(profile.socials)) {
      if (url) {
        const iconClass = key === 'x' ? 'fa-brands fa-x-twitter' : `fa-brands fa-${key}`;
        const cleanUrl = url.startsWith('http') ? url : 'https://' + url;
        socialsHtml += `<a href="${cleanUrl}" target="_blank" class="card-social-btn"><i class="${iconClass}"></i> <span>${key.toUpperCase()}</span></a>`;
      }
    }
  }

  // Rozetler
  let badgesHtml = '';
  if (profile.badges) {
    const badgeMap = {
      og: { icon: "fa-solid fa-crown", class: "og" },
      vip: { icon: "fa-solid fa-gem", class: "vip" },
      verified: { icon: "fa-solid fa-shield-halved", class: "verified" },
      dev: { icon: "fa-solid fa-code", class: "dev" },
      staff: { icon: "fa-solid fa-bolt", class: "staff" },
      booster: { icon: "fa-solid fa-rocket", class: "booster" },
      sanalci: { icon: "fa-solid fa-skull", class: "sanalci" }
    };
    profile.badges.forEach(bKey => {
      if (badgeMap[bKey]) {
        badgesHtml += `<div class="card-badge-icon ${badgeMap[bKey].class}"><i class="${badgeMap[bKey].icon}"></i></div>`;
      }
    });
  }

  // Discord Kutusu
  let discordHtml = '';
  if (profile.discord && (profile.discord.title || profile.discord.sub)) {
    discordHtml = `
      <div class="card-discord-box">
        <div class="discord-head">
          <i class="fa-brands fa-discord"></i>
          <span>DISCORD AKTİVİTESİ</span>
          <span class="discord-dot"></span>
        </div>
        <div class="discord-body">
          <div class="discord-icon-frame"><i class="fa-solid fa-gamepad"></i></div>
          <div class="discord-info">
            <h5>${profile.discord.title}</h5>
            <p>${profile.discord.sub}</p>
            <span>${profile.discord.time || 'Aktif'}</span>
          </div>
        </div>
      </div>
    `;
  }

  mount.innerHTML = `
    <div class="only-card" id="publicTiltCard">
      <div class="card-head-row">
        <div class="card-uid-pill">UID: #0NLY</div>
        <div class="card-badges-rack">${badgesHtml}</div>
      </div>

      <div class="card-avatar-wrap">
        <div class="avatar-ring ${profile.ring || 'ring-neon'}"></div>
        <img src="${profile.avatarUrl}" alt="Avatar">
        <span class="online-indicator ${profile.status || 'online'}"></span>
      </div>

      <div class="card-identity-box">
        <div class="card-name-line">
          <h3>${profile.displayName}</h3>
          ${profile.verified ? '<span class="verified-gem"><i class="fa-solid fa-circle-check"></i></span>' : ''}
        </div>
        <div class="card-sub-line">
          <span class="card-handle">0nly.lol/${profile.handle}</span>
          <span class="sep">•</span>
          <span class="card-pronouns">${profile.pronouns}</span>
          <span class="sep">•</span>
          <span class="card-location"><i class="fa-solid fa-location-dot"></i> ${profile.location}</span>
        </div>
      </div>

      <div class="card-bio-plate">
        <p>${profile.bio}</p>
      </div>

      ${discordHtml}

      <div class="card-socials-grid">
        ${socialsHtml}
      </div>

      <div class="card-footer-branding">
        <span>0nly.lol Elite Member</span>
      </div>
    </div>
  `;

  // 3D Tilt'i genel profile bağla
  attachTilt('publicTiltContainer', 'publicTiltCard');
}

function copyCurrentProfileUrl() {
  playUiClick(1000, 0.05);
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  }
  showOnlyToast("Bağlantı Kopyalandı! 🚀", url);
}

function openMySavedProfile() {
  const lastHandle = localStorage.getItem('0nly_last_my_profile');
  if (lastHandle) {
    navigateTo(`#/${lastHandle}`);
  } else {
    navigateTo('#/profilecreate');
  }
}

function loadFeaturedProfile(handle) {
  navigateTo(`#/${handle}`);
}

// ================= 6. 3D EĞİM FİZİĞİ (TILT ENGINE) =================
function setup3dTilt() {
  attachTilt('previewTiltContainer', 'previewOnlyCard');
}

function attachTilt(containerId, cardId) {
  const container = document.getElementById(containerId);
  const card = document.getElementById(cardId);

  if (!container || !card) return;

  container.addEventListener('mousemove', (e) => {
    const tiltEnabled = document.getElementById('check3dTilt') ? document.getElementById('check3dTilt').checked : true;
    if (!tiltEnabled) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  container.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// ================= 7. KANVAS AMBİYANS PARTİKÜLLERİ =================
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ================= 8. TOAST BİLDİRİMİ =================
let toastTimer = null;
function showOnlyToast(title, msg) {
  const toast = document.getElementById('onlyToast');
  const tTitle = document.getElementById('toastTitle');
  const tMsg = document.getElementById('toastMessage');

  if (!toast) return;

  tTitle.textContent = title;
  tMsg.textContent = msg;

  toast.classList.add('active');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 3600);
}
