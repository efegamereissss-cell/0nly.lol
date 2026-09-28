/**
 * PARAKAZANMASANATI | PKS FİNANSAL GÜVENLİK VE TAKİP SİSTEMİ
 * Anti-Inspect, Anti-Debug, Anti-DDoS Kalkanı & Discord Canlı Webhook Bildirimi
 */

const PKS_SECURITY_CONFIG = {
  webhookUrl: "https://discord.com/api/webhooks/1554152963050836088/kCtdCDoW8h2cR_xapqWqv0pivwpva5xw-YdGZW_DVTJgSK9VzfLRTxt6GQw23VhWkILl",
  enableAntiInspect: true,
  enableAntiDebug: true,
  enableDDoSShield: true,
  cooldownMs: 2000
};

// ================= 1. CİHAZ VE SİSTEM TESPİTİ =================
function getClientMeta() {
  const ua = navigator.userAgent || "";
  let os = "Bilinmiyor";
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let browser = "Bilinmiyor";
  if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";
  else if (ua.includes("Firefox")) browser = "Mozilla Firefox";

  const isMobile = /Mobi|Android|iPhone/i.test(ua);

  return {
    os: os,
    browser: browser,
    isMobile: isMobile ? "📱 Mobil" : "💻 Masaüstü",
    screen: `${window.screen.width}x${window.screen.height}`,
    lang: navigator.language || "tr-TR",
    referrer: document.referrer ? document.referrer : "Doğrudan Giriş",
    url: window.location.href,
    time: new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
  };
}

// ================= 2. DİSCORD WEBHOOK GÖNDERİCİ =================
let lastWebhookSendTime = 0;
const webhookQueue = [];
let isProcessingQueue = false;

function sendPksDiscordLog(title, desc, colorHex = 0x10b981, fields = []) {
  if (!PKS_SECURITY_CONFIG.webhookUrl) return;

  const meta = getClientMeta();
  const defaultFields = [
    { name: "Cihaz & İşletim Sistemi", value: `${meta.isMobile} • ${meta.os}`, inline: true },
    { name: "Tarayıcı", value: meta.browser, inline: true },
    { name: "Ekran Çözünürlüğü", value: meta.screen, inline: true },
    { name: "Tarih & Saat (TR)", value: meta.time, inline: true },
    { name: "Geliş Kaynağı", value: meta.referrer, inline: true },
    { name: "Aktif Sayfa", value: meta.url, inline: false },
    ...fields
  ];

  const payload = {
    username: "PKS Güvenlik & Operasyon Ağı",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/9422/9422891.png",
    embeds: [
      {
        title: title,
        description: desc,
        color: colorHex,
        fields: defaultFields,
        footer: {
          text: "Parakazanmasanati (PKS Finansal) • Gerçek Zamanlı Koruma",
          icon_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  webhookQueue.push(payload);
  processWebhookQueue();
}

function processWebhookQueue() {
  if (isProcessingQueue || webhookQueue.length === 0) return;
  isProcessingQueue = true;

  const now = Date.now();
  const waitTime = Math.max(0, PKS_SECURITY_CONFIG.cooldownMs - (now - lastWebhookSendTime));

  setTimeout(() => {
    const item = webhookQueue.shift();
    if (item) {
      fetch(PKS_SECURITY_CONFIG.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      })
      .then(() => {
        lastWebhookSendTime = Date.now();
        isProcessingQueue = false;
        if (webhookQueue.length > 0) processWebhookQueue();
      })
      .catch((err) => {
        console.warn("PKS Webhook bildirim gecikmesi:", err);
        isProcessingQueue = false;
      });
    } else {
      isProcessingQueue = false;
    }
  }, waitTime);
}

// Global olarak eylemleri loglamak için API
window.pksLogAction = function(actionTitle, actionDetails, color = 0x3b82f6) {
  sendPksDiscordLog(
    `📌 Eylem: ${actionTitle}`,
    actionDetails,
    color,
    [{ name: "Eylem Detayı", value: actionDetails, inline: false }]
  );
};

// ================= 3. ANTİ-İNCELE (SAĞ TIK & KISAYOL ENGELİ) =================
let alertDebounce = false;

function showSecurityWarning(message) {
  if (alertDebounce) return;
  alertDebounce = true;
  setTimeout(() => { alertDebounce = false; }, 2000);

  const toast = document.getElementById("pksToast");
  const title = document.getElementById("toastTitle");
  const msg = document.getElementById("toastMsg");

  if (toast && title && msg) {
    title.textContent = "🛡️ PKS Güvenlik Kalkanı";
    msg.textContent = message;
    toast.classList.add("active");
    if (window._secToastTimeout) clearTimeout(window._secToastTimeout);
    window._secToastTimeout = setTimeout(() => {
      toast.classList.remove("active");
    }, 3500);
  }
}

// 1. Sağ Tık (Context Menu) Engeli
document.addEventListener("contextmenu", (e) => {
  if (PKS_SECURITY_CONFIG.enableAntiInspect) {
    e.preventDefault();
    showSecurityWarning("Kaynak kodu ve içerikler PKS Finansal tarafından korunmaktadır.");
    sendPksDiscordLog(
      "⚠️ Güvenlik Uyarısı: Sağ Tık Engellendi",
      "Kullanıcı sayfada sağ tıklayarak 'İncele' veya 'Sayfa Kaynağını Görüntüle' menüsünü açmaya çalıştı.",
      0xf59e0b,
      [{ name: "Engellenen Eylem", value: "contextmenu (Sağ Tık)", inline: true }]
    );
    return false;
  }
});

// 2. Klavye Kısayolları Engeli (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
document.addEventListener("keydown", (e) => {
  if (!PKS_SECURITY_CONFIG.enableAntiInspect) return;

  const isCtrl = e.ctrlKey || e.metaKey;
  const isShift = e.shiftKey;
  const key = e.key ? e.key.toUpperCase() : "";
  const keyCode = e.keyCode;

  // F12
  const isF12 = keyCode === 123 || key === "F12";
  // Ctrl + Shift + I (DevTools)
  const isCtrlShiftI = isCtrl && isShift && (key === "I" || keyCode === 73);
  // Ctrl + Shift + J (Console)
  const isCtrlShiftJ = isCtrl && isShift && (key === "J" || keyCode === 74);
  // Ctrl + Shift + C (Inspect Element)
  const isCtrlShiftC = isCtrl && isShift && (key === "C" || keyCode === 67);
  // Ctrl + U (View Source)
  const isCtrlU = isCtrl && (key === "U" || keyCode === 85);
  // Ctrl + S (Save Page)
  const isCtrlS = isCtrl && (key === "S" || keyCode === 83);

  if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlU || isCtrlS) {
    e.preventDefault();
    e.stopPropagation();

    let triggerName = "Geliştirici Kısayolu";
    if (isF12) triggerName = "F12 (Geliştirici Konsolu)";
    else if (isCtrlU) triggerName = "Ctrl + U (Kaynak Kodunu Görüntüle)";
    else if (isCtrlShiftI) triggerName = "Ctrl + Shift + I (İncele)";
    else if (isCtrlShiftJ) triggerName = "Ctrl + Shift + J (Konsol)";
    else if (isCtrlShiftC) triggerName = "Ctrl + Shift + C (Öğe İnceleyici)";
    else if (isCtrlS) triggerName = "Ctrl + S (Sayfayı Kaydet)";

    showSecurityWarning(`${triggerName} güvenlik nedeniyle devre dışı bırakılmıştır.`);

    sendPksDiscordLog(
      `🚨 Güvenlik Uyarısı: ${triggerName} Engellendi`,
      `Ziyaretçi klavye kısayolu ile sayfa kaynağını veya inceleme panelini açmaya çalıştı: **${triggerName}**`,
      0xef4444,
      [{ name: "Tuş Kombinasyonu", value: triggerName, inline: true }]
    );

    return false;
  }
}, true);

// ================= 4. GELİŞTİRİCİ ARAÇLARI (DEVTOOLS) AÇILMA TESPİTİ =================
let devToolsOpenDetected = false;

function checkDevTools() {
  if (!PKS_SECURITY_CONFIG.enableAntiDebug) return;

  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth > threshold;
  const heightDiff = window.outerHeight - window.innerHeight > threshold;

  // Mobil cihazlarda sanal klavye yanlış pozitif üretmesin
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  if ((widthDiff || heightDiff) && !isMobile) {
    if (!devToolsOpenDetected) {
      devToolsOpenDetected = true;
      sendPksDiscordLog(
        "🚨 KRİTİK GÜVENLİK: Geliştirici Konsolu (DevTools) Açıldı!",
        "Ziyaretçi tarayıcı geliştirici penceresini açtı ve DOM / kaynak kodunu incelemeye başladı.",
        0xdc2626,
        [{ name: "Durum", value: "DevTools Açık / İzleniyor", inline: true }]
      );
      showSecurityWarning("Geliştirici araçları tespit edildi. Eylemleriniz kaydedilmektedir.");
    }
  } else {
    devToolsOpenDetected = false;
  }
}

window.addEventListener("resize", checkDevTools);
setInterval(checkDevTools, 2500);

// ================= 5. ANTİ-FLOOD VE DDOS KORUMA SİMÜLATÖRÜ =================
let clickCount = 0;
let floodBlocked = false;

document.addEventListener("click", () => {
  clickCount++;
  setTimeout(() => { if (clickCount > 0) clickCount--; }, 1500);

  if (clickCount > 18 && !floodBlocked) {
    floodBlocked = true;
    showSecurityWarning("Aşırı istek tespit edildi! Lütfen bekleyin (Anti-Flood Koruması).");
    sendPksDiscordLog(
      "🛑 Saldırı / Flood Uyarısı: Aşırı Tıklama Engellendi",
      "Kullanıcı 1.5 saniyede 18'den fazla tıklama/istek gönderdi. Olası makro veya bot saldırısı.",
      0xef4444,
      [{ name: "Tıklama Yoğunluğu", value: `${clickCount} istek / 1.5s`, inline: true }]
    );
    setTimeout(() => { floodBlocked = false; }, 5000);
  }
});

// ================= 6. TAVSİYE EDİLEN PLATFORM TIKLAMA TAKİBİ =================
document.addEventListener("click", (e) => {
  const launchBtn = e.target.closest(".btn-card-launch, .btn-tool-visit, .btn-midas-action");
  if (launchBtn) {
    const text = launchBtn.innerText.trim();
    const url = launchBtn.getAttribute("href") || "#";
    if (window.pksLogAction) {
      window.pksLogAction(
        "🚀 Tavsiye Edilen Platforma Tıklandı",
        `Ziyaretçi '${text}' butonuna tıkladı. Yönlendirilen adres: ${url}`,
        0x10b981
      );
    }
  }
});

// ================= 7. GELİŞMİŞ ZİYARETÇİ İSTİHBARAT MODÜLÜ =================

// 7a. Canvas Fingerprint — her cihazda unique hash üretir
function _pksCanvasHash() {
  try {
    const c = document.createElement("canvas");
    c.width = 280; c.height = 60;
    const ctx = c.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("PKSfingerprint🖐️", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("PKSfingerprint🖐️", 4, 17);
    const raw = c.toDataURL();
    // simple djb2 hash
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash) + raw.charCodeAt(i);
      hash = hash & hash; // 32-bit int
    }
    return (hash >>> 0).toString(16).toUpperCase();
  } catch(e) { return "N/A"; }
}

// 7b. WebGL GPU / Renderer bilgisi
function _pksWebGLInfo() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!gl) return { vendor: "N/A", renderer: "N/A" };
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    };
  } catch(e) { return { vendor: "N/A", renderer: "N/A" }; }
}

// 7c. Yüklü eklentiler listesi
function _pksPlugins() {
  try {
    const p = navigator.plugins;
    if (!p || p.length === 0) return "Yok / Gizli";
    const names = [];
    for (let i = 0; i < Math.min(p.length, 10); i++) {
      names.push(p[i].name);
    }
    return names.join(", ");
  } catch(e) { return "N/A"; }
}

// 7d. Depolama destek tespiti
function _pksStorageSupport() {
  const s = [];
  try { if (window.localStorage) s.push("LocalStorage ✅"); } catch(e) { s.push("LocalStorage ❌"); }
  try { if (window.sessionStorage) s.push("SessionStorage ✅"); } catch(e) { s.push("SessionStorage ❌"); }
  try { if (window.indexedDB) s.push("IndexedDB ✅"); } catch(e) { s.push("IndexedDB ❌"); }
  try { if (document.cookie !== undefined) s.push("Cookies ✅"); } catch(e) { s.push("Cookies ❌"); }
  return s.join(" • ");
}

// 7e. Batarya bilgisi (async)
async function _pksBattery() {
  try {
    if (!navigator.getBattery) return null;
    const b = await navigator.getBattery();
    return {
      level: Math.round(b.level * 100) + "%",
      charging: b.charging ? "⚡ Şarjda" : "🔋 Pilde",
      chargingTime: b.chargingTime === Infinity ? "∞" : Math.round(b.chargingTime / 60) + " dk",
      dischargingTime: b.dischargingTime === Infinity ? "∞" : Math.round(b.dischargingTime / 60) + " dk"
    };
  } catch(e) { return null; }
}

// 7f. Network / Bağlantı bilgisi
function _pksNetwork() {
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return null;
    return {
      type: conn.effectiveType || "N/A",
      downlink: conn.downlink ? conn.downlink + " Mbps" : "N/A",
      rtt: conn.rtt ? conn.rtt + " ms" : "N/A",
      saveData: conn.saveData ? "Açık" : "Kapalı"
    };
  } catch(e) { return null; }
}

// 7g. Ana istihbarat toplayıcı — IP + fingerprint + hardware
async function _pksGatherIntel() {
  // IP & Geolocation (public API)
  let ipData = {};
  try {
    const r = await fetch("https://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query", { cache: "no-store" });
    ipData = await r.json();
  } catch(e) {
    try {
      const r2 = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      const d = await r2.json();
      ipData = { query: d.ip, country: d.country_name, city: d.city, regionName: d.region, isp: d.org, timezone: d.timezone, proxy: false };
    } catch(e2) {
      ipData = { query: "Alınamadı", country: "N/A", city: "N/A" };
    }
  }

  const gpu = _pksWebGLInfo();
  const canvasHash = _pksCanvasHash();
  const battery = await _pksBattery();
  const network = _pksNetwork();
  const plugins = _pksPlugins();
  const storage = _pksStorageSupport();

  // Cihaz detayları
  const cpuCores = navigator.hardwareConcurrency || "N/A";
  const ram = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A";
  const maxTouch = navigator.maxTouchPoints || 0;
  const platform = navigator.platform || "N/A";
  const languages = navigator.languages ? navigator.languages.join(", ") : navigator.language;
  const colorDepth = screen.colorDepth + "-bit";
  const pixelRatio = window.devicePixelRatio || 1;
  const screenFull = `${screen.width}x${screen.height} (kullanılabilir: ${screen.availWidth}x${screen.availHeight})`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = "UTC" + (new Date().getTimezoneOffset() > 0 ? "-" : "+") + Math.abs(new Date().getTimezoneOffset() / 60);
  const dnt = navigator.doNotTrack === "1" ? "Açık" : "Kapalı";
  const cookieEnabled = navigator.cookieEnabled ? "Evet" : "Hayır";
  const online = navigator.onLine ? "Çevrimiçi ✅" : "Çevrimdışı ❌";

  // VPN / Proxy tespiti
  let vpnStatus = "🟢 Normal Bağlantı";
  if (ipData.proxy === true || ipData.hosting === true) {
    vpnStatus = "🔴 VPN / Proxy / Hosting IP Tespit Edildi!";
  }

  // Discord embed oluştur
  const fields = [
    { name: "🌐 IP Adresi", value: `\`${ipData.query || "N/A"}\``, inline: true },
    { name: "📍 Konum", value: `${ipData.city || "N/A"}, ${ipData.regionName || ""} / ${ipData.country || "N/A"}`, inline: true },
    { name: "🏢 ISP / Ağ", value: `${ipData.isp || "N/A"}`, inline: true },
    { name: "🛡️ VPN / Proxy", value: vpnStatus, inline: true },
    { name: "🕐 Timezone", value: `${timezone} (${timezoneOffset})`, inline: true },
    { name: "🌍 Diller", value: languages, inline: true },
    { name: "💻 Platform", value: `${platform}`, inline: true },
    { name: "🖥️ GPU (WebGL)", value: `${gpu.renderer}`, inline: true },
    { name: "🏭 GPU Üretici", value: `${gpu.vendor}`, inline: true },
    { name: "⚙️ CPU Çekirdek", value: `${cpuCores} çekirdek`, inline: true },
    { name: "🧠 RAM (Tahmini)", value: `${ram}`, inline: true },
    { name: "📱 Dokunmatik", value: `${maxTouch} nokta`, inline: true },
    { name: "📺 Ekran", value: screenFull, inline: false },
    { name: "🎨 Renk Derinliği", value: `${colorDepth} • ${pixelRatio}x piksel oranı`, inline: true },
    { name: "🔒 DNT (İzleme)", value: dnt, inline: true },
    { name: "🍪 Cookie Desteği", value: cookieEnabled, inline: true },
    { name: "📶 Çevrimiçi", value: online, inline: true },
    { name: "🎭 Canvas Parmak İzi", value: `\`0x${canvasHash}\``, inline: true },
    { name: "🔌 Eklentiler", value: plugins.substring(0, 200), inline: false },
    { name: "💾 Depolama Desteği", value: storage, inline: false }
  ];

  // Batarya bilgisi varsa ekle
  if (battery) {
    fields.push({ name: "🔋 Batarya", value: `${battery.level} — ${battery.charging} | Dolum: ${battery.chargingTime} | Kalan: ${battery.dischargingTime}`, inline: false });
  }

  // Network bilgisi varsa ekle
  if (network) {
    fields.push({ name: "📡 Bağlantı Tipi", value: `${network.type.toUpperCase()} • ↓${network.downlink} • RTT: ${network.rtt} • Veri Tasarrufu: ${network.saveData}`, inline: false });
  }

  // Geliş kaynağı
  const ref = document.referrer || "Doğrudan Giriş";
  fields.push({ name: "🔗 Geliş Kaynağı", value: ref, inline: false });

  // ASN bilgisi
  if (ipData.as) {
    fields.push({ name: "🏷️ ASN", value: ipData.as, inline: false });
  }

  // Koordinat (varsa)
  if (ipData.lat && ipData.lon) {
    fields.push({ name: "📌 Koordinat", value: `[${ipData.lat}, ${ipData.lon}](https://www.google.com/maps?q=${ipData.lat},${ipData.lon})`, inline: true });
  }

  // Posta kodu
  if (ipData.zip) {
    fields.push({ name: "📮 Posta Kodu", value: ipData.zip, inline: true });
  }

  // Webhook gönder
  const payload = {
    username: "PKS İstihbarat Ağı 🕵️",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/2592/2592004.png",
    embeds: [{
      title: "🔍 Yeni Ziyaretçi İstihbarat Raporu",
      description: `Parakazanmasanati sitesine **yeni bir ziyaretçi bağlandı**. Tüm teknik parmak izi ve ağ bilgileri aşağıda listelenmiştir.`,
      color: 0x0ea5e9,
      fields: fields,
      footer: {
        text: "PKS Finansal • Gelişmiş Ziyaretçi İstihbarat Sistemi v2.0",
        icon_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      },
      timestamp: new Date().toISOString()
    }]
  };

  // Doğrudan fetch — mevcut queue'yu bypass ederek ayrı gönder
  try {
    await fetch(PKS_SECURITY_CONFIG.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch(e) { /* sessiz hata */ }
}

// ================= 8. BAŞLANGIÇ: ZİYARETÇİ GİRİŞİ KAYDI & DDOS SHIELD =================
document.addEventListener("DOMContentLoaded", () => {
  // İlk ziyaretçi girişi kaydı + istihbarat toplama (Tek bir oturumda bir kez)
  if (!sessionStorage.getItem("pks_visit_logged")) {
    sessionStorage.setItem("pks_visit_logged", "true");
    sendPksDiscordLog(
      "🟢 Yeni Ziyaretçi Sayfaya Giriş Yaptı",
      "Parakazanmasanati (PKS Finansal) web sitesine yeni bir kullanıcı bağlandı.",
      0x10b981
    );

    // Gelişmiş istihbaratı sessizce topla ve gönder
    setTimeout(() => { _pksGatherIntel(); }, 1200);
  }

  // DDoS / Bot Doğrulama Ekranı (İlk ziyarette gösterilir)
  const shield = document.getElementById("pksDdosShield");
  if (shield && PKS_SECURITY_CONFIG.enableDDoSShield) {
    if (!sessionStorage.getItem("pks_ddos_verified")) {
      setTimeout(() => {
        const verifyText = document.getElementById("shieldVerifyText");
        const progressBar = document.getElementById("shieldProgressBar");
        if (verifyText) verifyText.innerHTML = '<i class="fa-solid fa-check-double text-green"></i> Tarayıcı Doğrulandı. Giriş Yapılıyor...';
        if (progressBar) progressBar.style.width = "100%";

        setTimeout(() => {
          shield.style.opacity = "0";
          shield.style.pointerEvents = "none";
          sessionStorage.setItem("pks_ddos_verified", "true");
        }, 600);
      }, 950);
    } else {
      shield.style.display = "none";
    }
  }
});
