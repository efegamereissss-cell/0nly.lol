/**
 * 0NLY.LOL | CORE ENGINE V2
 * Clean Slate Architecture, File Upload, Unlimited Custom Links,
 * Cursor Spotlight, Specular Glare & Futuristic Audio Feedback.
 */

// ================= 1. VERİTABANI & LOCAL STORAGE =================
function getProfileDatabase() {
  const saved = localStorage.getItem('0nly_profiles_db');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveProfileToDatabase(profile) {
  const db = getProfileDatabase();
  db[profile.handle] = profile;
  localStorage.setItem('0nly_profiles_db', JSON.stringify(db));
  localStorage.setItem('0nly_last_my_profile', profile.handle);
}

// ================= 2. SES MOTORU (Fütüristik Siber UI Sesleri) =================
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playCyberClick(pitch = 1200) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

function playSuccessChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.2);
    });
  } catch (e) {}
}

function toggleSoundFx() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById('soundIcon');
  if (soundEnabled) {
    icon.className = 'fa-solid fa-volume-high';
    playCyberClick(1400);
    showOnlyToast("Ses Açık 🔊", "Arayüz ses efektleri aktifleştirildi.");
  } else {
    icon.className = 'fa-solid fa-volume-xmark';
    showOnlyToast("Ses Kapalı 🔇", "Arayüz sessize alındı.");
  }
}

// ================= 3. TEK SAYFA YÖNLENDİRİCİSİ (SPA ROUTER) =================
function navigateTo(route) {
  playCyberClick(900);
  window.location.hash = route;
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  
  // Tüm sayfaları gizle
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  if (hash === '#/' || hash === '' || hash === '#/home') {
    // 1. Ana Sayfa
    document.getElementById('view-home').classList.add('active');
    document.getElementById('navHomeBtn').classList.add('active');
    document.title = "0NLY.LOL | Sanalın En Havalı VIP Kimliği";
  } 
  else if (hash === '#/profilecreate' || hash.startsWith('#/profilecreate')) {
    // 2. Profil Stüdyosu
    document.getElementById('view-profilecreate').classList.add('active');
    document.getElementById('navCreateBtn').classList.add('active');
    document.title = "0NLY.LOL / Stüdyo | Kendi Alanını Yarat";
    initStudioCleanSlate();
  } 
  else {
    // 3. Halka Açık Özel Profil (#/{username})
    const username = hash.replace('#/', '').replace('#', '');
    const db = getProfileDatabase();
    const profile = db[username];

    if (profile) {
      document.getElementById('view-public-profile').classList.add('active');
      renderPublicProfile(profile);
      document.title = `${profile.displayName || profile.handle} | 0NLY.LOL`;
    } else {
      showOnlyToast("Profil Henüz Yok!", `@${username} alanı boş. Hemen oluştur!`);
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
  setupCursorSpotlight();
  setup3dTiltPhysics();
  initAmbientCanvas();
});

// ================= 4. FARE İMLECİ IŞIK TAKİP MOTORU (SPOTLIGHT) =================
function setupCursorSpotlight() {
  const spotlight = document.getElementById('cursorSpotlight');
  if (!spotlight) return;

  window.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  });
}

// ================= 5. STÜDYO DÜZENLEYİCİ & TEMİZ BAŞLANGIÇ =================
let selectedTheme = 'theme-void-nebula';
let selectedRing = 'ring-pulsing-neon';
let customAvatarBase64 = null;
let customLinksData = [];

function switchEditorTab(tabId) {
  playCyberClick(1100);
  document.querySelectorAll('.editor-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.editor-content-tab').forEach(tab => tab.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function pickTheme(themeClass) {
  playCyberClick(1300);
  selectedTheme = themeClass;

  document.querySelectorAll('.theme-card').forEach(c => {
    if (c.getAttribute('data-theme') === themeClass) c.classList.add('active');
    else c.classList.remove('active');
  });

  document.getElementById('appBody').className = themeClass;
}

function pickRingStyle(ringClass) {
  playCyberClick(1150);
  selectedRing = ringClass;

  document.querySelectorAll('.ring-choice-btn').forEach(btn => {
    if (btn.getAttribute('data-ring') === ringClass) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const ringEl = document.getElementById('cardAvatarRing');
  ringEl.className = `avatar-ring ${ringClass}`;
}

function toggleScanlinesFx() {
  const isChecked = document.getElementById('checkScanlines').checked;
  const overlay = document.getElementById('scanlinesFx');
  if (isChecked) overlay.classList.remove('disabled');
  else overlay.classList.add('disabled');
}

// FOTOĞRAF DOSYASI YÜKLEME (Bilgisayardan)
function handleAvatarFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showOnlyToast("Hata", "Lütfen geçerli bir resim dosyası seçin.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    customAvatarBase64 = e.target.result;
    document.getElementById('inputAvatarUrl').value = ''; // URL'yi temizle
    updateLivePreview();
    playSuccessChime();
    showOnlyToast("Fotoğraf Yüklendi! 📷", "Profil resmin başarıyla uygulandı.");
  };
  reader.readAsDataURL(file);
}

// DİNAMİK ÖZEL LİNKLER
const SOCIAL_ICONS_MAP = {
  discord: "fa-brands fa-discord",
  telegram: "fa-brands fa-telegram",
  steam: "fa-brands fa-steam",
  spotify: "fa-brands fa-spotify",
  instagram: "fa-brands fa-instagram",
  github: "fa-brands fa-github",
  x: "fa-brands fa-x-twitter",
  youtube: "fa-brands fa-youtube",
  tiktok: "fa-brands fa-tiktok",
  twitch: "fa-brands fa-twitch",
  kick: "fa-solid fa-gamepad",
  roblox: "fa-solid fa-cube",
  website: "fa-solid fa-globe"
};

function addCustomLinkItem(type = 'discord', title = '', url = '') {
  playCyberClick(1050);
  const id = 'link_' + Date.now() + Math.floor(Math.random() * 1000);
  const linkObj = { id, type, title, url };
  customLinksData.push(linkObj);
  renderCustomLinksForm();
  updateLivePreview();
}

function removeCustomLinkItem(id) {
  playCyberClick(750);
  customLinksData = customLinksData.filter(item => item.id !== id);
  renderCustomLinksForm();
  updateLivePreview();
}

function renderCustomLinksForm() {
  const container = document.getElementById('customLinksList');
  if (!container) return;

  container.innerHTML = '';
  customLinksData.forEach((link, idx) => {
    const row = document.createElement('div');
    row.className = 'custom-link-row-card';
    row.innerHTML = `
      <select class="link-type-select" onchange="updateLinkType('${link.id}', this.value)">
        <option value="discord" ${link.type === 'discord' ? 'selected' : ''}>Discord</option>
        <option value="telegram" ${link.type === 'telegram' ? 'selected' : ''}>Telegram</option>
        <option value="steam" ${link.type === 'steam' ? 'selected' : ''}>Steam</option>
        <option value="spotify" ${link.type === 'spotify' ? 'selected' : ''}>Spotify</option>
        <option value="instagram" ${link.type === 'instagram' ? 'selected' : ''}>Instagram</option>
        <option value="github" ${link.type === 'github' ? 'selected' : ''}>GitHub</option>
        <option value="x" ${link.type === 'x' ? 'selected' : ''}>X (Twitter)</option>
        <option value="youtube" ${link.type === 'youtube' ? 'selected' : ''}>YouTube</option>
        <option value="tiktok" ${link.type === 'tiktok' ? 'selected' : ''}>TikTok</option>
        <option value="twitch" ${link.type === 'twitch' ? 'selected' : ''}>Twitch</option>
        <option value="kick" ${link.type === 'kick' ? 'selected' : ''}>Kick</option>
        <option value="roblox" ${link.type === 'roblox' ? 'selected' : ''}>Roblox</option>
        <option value="website" ${link.type === 'website' ? 'selected' : ''}>Özel Web Sitesi</option>
      </select>
      <input type="text" class="link-title-input" placeholder="Görünen İsim" value="${link.title}" oninput="updateLinkTitle('${link.id}', this.value)">
      <input type="text" class="link-url-input" placeholder="Bağlantı URL'si (https://...)" value="${link.url}" oninput="updateLinkUrl('${link.id}', this.value)">
      <button class="btn-remove-link" onclick="removeCustomLinkItem('${link.id}')" title="Linki Sil"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
  });
}

function updateLinkType(id, val) {
  const item = customLinksData.find(l => l.id === id);
  if (item) item.type = val;
  updateLivePreview();
}
function updateLinkTitle(id, val) {
  const item = customLinksData.find(l => l.id === id);
  if (item) item.title = val;
  updateLivePreview();
}
function updateLinkUrl(id, val) {
  const item = customLinksData.find(l => l.id === id);
  if (item) item.url = val;
  updateLivePreview();
}

// STÜDYO SIFIRDAN BAŞLATICI (Örnek Metin Yok, Tamamen Temiz)
function initStudioCleanSlate() {
  const lastHandle = localStorage.getItem('0nly_last_my_profile');
  const db = getProfileDatabase();

  if (lastHandle && db[lastHandle]) {
    // Kullanıcının daha önce kaydettiği kendi profili varsa onu getir
    const data = db[lastHandle];
    document.getElementById('inputHandle').value = data.handle || '';
    document.getElementById('inputDisplayName').value = data.displayName || '';
    document.getElementById('inputPronouns').value = data.pronouns || '';
    document.getElementById('inputLocation').value = data.location || '';
    document.getElementById('inputAvatarUrl').value = data.avatarUrl && !data.avatarUrl.startsWith('data:') ? data.avatarUrl : '';
    customAvatarBase64 = data.avatarUrl || null;
    document.getElementById('inputBio').value = data.bio || '';

    if (data.discord) {
      document.getElementById('inputDiscordTitle').value = data.discord.title || '';
      document.getElementById('inputDiscordSub').value = data.discord.sub || '';
      document.getElementById('inputDiscordTime').value = data.discord.time || '';
    }

    customLinksData = data.links || [];
    if (data.theme) pickTheme(data.theme);
    if (data.ring) pickRingStyle(data.ring);
  } else {
    // Tamamen boş başlangıç
    document.getElementById('inputHandle').value = '';
    document.getElementById('inputDisplayName').value = '';
    document.getElementById('inputPronouns').value = '';
    document.getElementById('inputLocation').value = '';
    document.getElementById('inputAvatarUrl').value = '';
    customAvatarBase64 = null;
    document.getElementById('inputBio').value = '';
    document.getElementById('inputDiscordTitle').value = '';
    document.getElementById('inputDiscordSub').value = '';
    document.getElementById('inputDiscordTime').value = '';

    // Varsayılan 2 boş link ekle
    customLinksData = [
      { id: 'def_1', type: 'discord', title: 'Discord', url: '' },
      { id: 'def_2', type: 'instagram', title: 'Instagram', url: '' }
    ];
  }

  renderCustomLinksForm();
  updateLivePreview();
}

// CANLI ÖNİZLEME MOTORU (Her tuş vuruşunda çalışır)
function updateLivePreview() {
  const handle = document.getElementById('inputHandle').value.trim();
  const name = document.getElementById('inputDisplayName').value.trim();
  const pronouns = document.getElementById('inputPronouns').value.trim();
  const location = document.getElementById('inputLocation').value.trim();
  const bio = document.getElementById('inputBio').value.trim();
  const urlAvatar = document.getElementById('inputAvatarUrl').value.trim();
  const avatar = customAvatarBase64 || urlAvatar;
  const isVerified = document.getElementById('checkVerifiedBadge').checked;
  const status = document.getElementById('selectOnlineStatus').value;

  // Stüdyo üst bar URL
  document.getElementById('liveUrlPreview').textContent = handle || '...';

  // Kart isim ve handle
  document.getElementById('cardDisplayName').textContent = name || 'Kullanıcı Adı';
  document.getElementById('cardHandleText').textContent = handle ? '0nly.lol/' + handle : '0nly.lol/link';

  // Zamirler & Konum
  const pEl = document.getElementById('cardPronounsText');
  const lEl = document.getElementById('cardLocationText');
  const sP = document.getElementById('sepPronouns');
  const sL = document.getElementById('sepLocation');

  if (pronouns) {
    pEl.textContent = pronouns;
    pEl.style.display = 'inline';
    sP.style.display = 'inline';
  } else {
    pEl.style.display = 'none';
    sP.style.display = 'none';
  }

  if (location) {
    lEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${location}`;
    lEl.style.display = 'inline';
    sL.style.display = 'inline';
  } else {
    lEl.style.display = 'none';
    sL.style.display = 'none';
  }

  // Biyografi
  const bioPlate = document.getElementById('cardBioPlate');
  const bioText = document.getElementById('cardBioText');
  if (bio) {
    bioPlate.style.display = 'block';
    bioText.textContent = bio;
  } else {
    bioPlate.style.display = 'none';
  }

  // Avatar Resmi / İkon
  const imgEl = document.getElementById('cardAvatarImg');
  const placeholderEl = document.getElementById('avatarPlaceholder');
  if (avatar) {
    imgEl.src = avatar;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';
  } else {
    imgEl.style.display = 'none';
    placeholderEl.style.display = 'flex';
  }

  // Verified Badge
  document.getElementById('cardVerified').style.display = isVerified ? 'inline-block' : 'none';

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
      sanalci: { icon: "fa-solid fa-skull", class: "sanalci" },
      vip: { icon: "fa-solid fa-gem", class: "vip" },
      og: { icon: "fa-solid fa-crown", class: "og" },
      verified: { icon: "fa-solid fa-shield-halved", class: "verified" },
      dev: { icon: "fa-solid fa-code", class: "dev" },
      staff: { icon: "fa-solid fa-bolt", class: "staff" },
      booster: { icon: "fa-solid fa-rocket", class: "booster" }
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

  if (dTitle) {
    dBox.style.display = 'block';
    document.getElementById('cardDiscordTitle').textContent = dTitle;
    document.getElementById('cardDiscordSub').textContent = dSub || 'Aktif';
    document.getElementById('cardDiscordTime').textContent = dTime || 'Çevrimiçi';
  } else {
    dBox.style.display = 'none';
  }

  // Dinamik Sosyal / Özel Linkler
  const socialsGrid = document.getElementById('cardSocialsGrid');
  socialsGrid.innerHTML = '';

  customLinksData.forEach(link => {
    if (link.url && link.url.trim()) {
      const btn = document.createElement('a');
      btn.href = link.url.startsWith('http') ? link.url : 'https://' + link.url;
      btn.target = '_blank';
      btn.className = 'card-social-btn';
      const iconClass = SOCIAL_ICONS_MAP[link.type] || "fa-solid fa-link";
      btn.innerHTML = `<i class="${iconClass}"></i> <span>${link.title || link.type}</span>`;
      socialsGrid.appendChild(btn);
    }
  });
}

function resetStudioForm() {
  playCyberClick(700);
  document.getElementById('inputHandle').value = '';
  document.getElementById('inputDisplayName').value = '';
  document.getElementById('inputBio').value = '';
  document.getElementById('inputPronouns').value = '';
  document.getElementById('inputLocation').value = '';
  document.getElementById('inputAvatarUrl').value = '';
  customAvatarBase64 = null;
  document.getElementById('inputDiscordTitle').value = '';
  document.getElementById('inputDiscordSub').value = '';
  document.getElementById('inputDiscordTime').value = '';
  customLinksData = [];
  renderCustomLinksForm();
  updateLivePreview();
  showOnlyToast("Temizlendi 🧹", "Tüm alanlar sıfırlandı.");
}

// PROFİLİ YAYINLA & CANLI LİNKİ AL
function publishProfile() {
  const rawHandle = document.getElementById('inputHandle').value.trim();
  if (!rawHandle) {
    showOnlyToast("Hata!", "Lütfen profilin için bir link adı (handle) belirle.");
    document.getElementById('inputHandle').focus();
    return;
  }

  const cleanHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  const badges = [];
  document.querySelectorAll('.badge-checkbox input:checked').forEach(c => badges.push(c.value));

  const urlAvatar = document.getElementById('inputAvatarUrl').value.trim();

  const profileData = {
    handle: cleanHandle,
    displayName: document.getElementById('inputDisplayName').value.trim() || cleanHandle,
    pronouns: document.getElementById('inputPronouns').value.trim(),
    location: document.getElementById('inputLocation').value.trim(),
    bio: document.getElementById('inputBio').value.trim(),
    avatarUrl: customAvatarBase64 || urlAvatar,
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
    links: customLinksData
  };

  saveProfileToDatabase(profileData);
  playSuccessChime();

  const profileUrl = `${window.location.origin}${window.location.pathname}#/${cleanHandle}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(profileUrl);
  }

  showOnlyToast("0NLY.LOL Profilin Canlıda! 🚀", `0nly.lol/${cleanHandle} linkin panoya kopyalandı.`);

  setTimeout(() => {
    navigateTo(`#/${cleanHandle}`);
  }, 500);
}

// ================= 6. HALKA AÇIK PROFİL GÖRÜNÜMÜ =================
function renderPublicProfile(profile) {
  document.getElementById('appBody').className = profile.theme || 'theme-void-nebula';

  const mount = document.getElementById('publicCardMount');

  // Sosyal / Özel Linkler
  let linksHtml = '';
  if (profile.links && profile.links.length > 0) {
    profile.links.forEach(l => {
      if (l.url && l.url.trim()) {
        const cleanUrl = l.url.startsWith('http') ? l.url : 'https://' + l.url;
        const iconClass = SOCIAL_ICONS_MAP[l.type] || "fa-solid fa-link";
        linksHtml += `<a href="${cleanUrl}" target="_blank" class="card-social-btn"><i class="${iconClass}"></i> <span>${l.title || l.type}</span></a>`;
      }
    });
  }

  // Rozetler
  let badgesHtml = '';
  if (profile.badges) {
    const badgeMap = {
      sanalci: { icon: "fa-solid fa-skull", class: "sanalci" },
      vip: { icon: "fa-solid fa-gem", class: "vip" },
      og: { icon: "fa-solid fa-crown", class: "og" },
      verified: { icon: "fa-solid fa-shield-halved", class: "verified" },
      dev: { icon: "fa-solid fa-code", class: "dev" },
      staff: { icon: "fa-solid fa-bolt", class: "staff" },
      booster: { icon: "fa-solid fa-rocket", class: "booster" }
    };
    profile.badges.forEach(bKey => {
      if (badgeMap[bKey]) {
        badgesHtml += `<div class="card-badge-icon ${badgeMap[bKey].class}"><i class="${badgeMap[bKey].icon}"></i></div>`;
      }
    });
  }

  // Discord
  let discordHtml = '';
  if (profile.discord && profile.discord.title) {
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
            <p>${profile.discord.sub || 'Aktif'}</p>
            <span>${profile.discord.time || 'Çevrimiçi'}</span>
          </div>
        </div>
      </div>
    `;
  }

  const avatarDisplay = profile.avatarUrl ? 
    `<img src="${profile.avatarUrl}" alt="Avatar">` : 
    `<div class="avatar-placeholder-initials"><i class="fa-regular fa-user"></i></div>`;

  mount.innerHTML = `
    <div class="only-card" id="publicTiltCard">
      <div class="card-glare" id="publicGlare"></div>

      <div class="card-head-row">
        <div class="card-uid-pill">UID: #0NLY</div>
        <div class="card-badges-rack">${badgesHtml}</div>
      </div>

      <div class="card-avatar-wrap">
        <div class="avatar-ring ${profile.ring || 'ring-pulsing-neon'}"></div>
        <div class="avatar-img-box">${avatarDisplay}</div>
        <span class="online-indicator ${profile.status || 'online'}"></span>
      </div>

      <div class="card-identity-box">
        <div class="card-name-line">
          <h3>${profile.displayName || profile.handle}</h3>
          ${profile.verified ? '<span class="verified-gem"><i class="fa-solid fa-circle-check"></i></span>' : ''}
        </div>
        <div class="card-sub-line">
          <span class="card-handle">0nly.lol/${profile.handle}</span>
          ${profile.pronouns ? `<span class="sep">•</span><span class="card-pronouns">${profile.pronouns}</span>` : ''}
          ${profile.location ? `<span class="sep">•</span><span class="card-location"><i class="fa-solid fa-location-dot"></i> ${profile.location}</span>` : ''}
        </div>
      </div>

      ${profile.bio ? `<div class="card-bio-plate"><p>${profile.bio}</p></div>` : ''}

      ${discordHtml}

      <div class="card-socials-grid">
        ${linksHtml}
      </div>

      <div class="card-footer-branding">
        <span>0nly.lol VIP Member</span>
      </div>
    </div>
  `;

  attachTiltPhysics('publicTiltContainer', 'publicTiltCard', 'publicGlare');
}

function copyCurrentProfileUrl() {
  playCyberClick(1200);
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

// ================= 7. 3D EĞİM FİZİĞİ & IŞIK PARLAMASI (GLARE) =================
function setup3dTiltPhysics() {
  attachTiltPhysics('previewTiltContainer', 'previewOnlyCard', 'previewGlare');
}

function attachTiltPhysics(containerId, cardId, glareId) {
  const container = document.getElementById(containerId);
  const card = document.getElementById(cardId);
  const glare = document.getElementById(glareId);

  if (!container || !card) return;

  container.addEventListener('mousemove', (e) => {
    const tiltEnabled = document.getElementById('check3dTilt') ? document.getElementById('check3dTilt').checked : true;
    if (!tiltEnabled) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;

    if (glare) {
      glare.style.opacity = '0.6';
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.22) 0%, transparent 55%)`;
    }
  });

  container.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glare) glare.style.opacity = '0';
  });
}

// ================= 8. AMBİYANS KANVAS PARTİKÜLLERİ =================
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
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.45 + 0.1
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

// ================= 9. TOAST BİLDİRİMİ =================
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
