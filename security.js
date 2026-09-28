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

// ================= 7. BAŞLANGIÇ: ZİYARETÇİ GİRİŞİ KAYDI & DDOS SHIELD =================
document.addEventListener("DOMContentLoaded", () => {
  // İlk ziyaretçi girişi kaydı (Tek bir oturumda bir kez gönderilir)
  if (!sessionStorage.getItem("pks_visit_logged")) {
    sessionStorage.setItem("pks_visit_logged", "true");
    sendPksDiscordLog(
      "🟢 Yeni Ziyaretçi Sayfaya Giriş Yaptı",
      "Parakazanmasanati (PKS Finansal) web sitesine yeni bir kullanıcı bağlandı.",
      0x10b981
    );
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
