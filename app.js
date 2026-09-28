/**
 * PARAKAZANMASANATI | PKS FİNANSAL CORE
 * Bileşik Getiri Hesaplayıcı, Canlı Ticker ve İnteraktif Model Eşleştirici
 */

// ================= 1. PKS GELİR MODELİ EŞLEŞTİRİCİ =================
const MODEL_TIPS = {
  sifir: {
    badge: "PKS TAVSİYESİ: DİJİTAL ÜRÜN VE FREELANCE (0 TL SERMAYE)",
    title: "Dijital Ürün Satışı & Yüksek Gelirli Beceriler",
    desc: "Cebinde hiç sermaye yoksa en hızlı nakit akışı dijital varlık satmaktır. Notion şablonları, bütçe tabloları veya Canva tasarımları üretip Gumroad ve Etsy üzerinde satabilir; video editörlüğü veya yazılım becerisiyle Upwork'te saatlik $25-50 kazanabilirsin. Sıfır kargo, sıfır stok maliyeti!",
    link: "#eticaret",
    btnText: "Dijital Ürün Rehberine Git →"
  },
  dolar: {
    badge: "PKS TAVSİYESİ: GLOBAL E-TİCARET & AMAZON",
    title: "Amazon FBA ve Küresel Shopify Mağazacılığı",
    desc: "Gelirini Türk Lirası yerine doğrudan Dolar ve Euro olarak kazanmak en güçlü finansal kalkanındır. Amazon FBA ile ürünlerini ABD depolarına gönderebilir veya Shopify ile Avrupa ve Amerika'ya yönelik niş bir e-ticaret markası kurarak günde $100-$500 ciro hedefleyebilirsin.",
    link: "#eticaret",
    btnText: "E-Ticaret Modellerini İncele →"
  },
  pasif: {
    badge: "PKS TAVSİYESİ: MİDAS İLE TEMETTÜ EMEKLİLİĞİ",
    title: "Midas Üzerinden Temettü Hisseleri & S&P 500",
    desc: "Sen uyurken banka hesabına para akmasını istiyorsan yolun borsadan geçer. Midas ile her ay düzenli olarak kar payı dağıtan köklü dünya devlerinden hisse toplayarak kendi pasif maaş sistemini kurabilir, kazandığın temettüyü tekrar yatırarak servetini kartopu gibi büyütebilirsin.",
    link: "#yatirim",
    btnText: "Midas & Temettü Stratejisini Oku →"
  },
  buyuk: {
    badge: "PKS TAVSİYESİ: ÖZEL DİJİTAL MARKA & AJANS",
    title: "Ölçeklenebilir Niş E-Ticaret Markası",
    desc: "Büyük bir şirket kurup gelecekte milyon dolara satmak istiyorsan kendi markanı inşa etmelisin. Kendi logonla özel tasarım ürünler ürettirip güçlü bir topluluk ve sosyal medya varlığıyla global pazara açılabilirsin.",
    link: "#eticaret",
    btnText: "Marka Kurma Adımlarına Bak →"
  }
};

function switchModelTip(type) {
  // Buton aktifliği
  const pills = document.querySelectorAll('.choice-pill');
  pills.forEach(p => p.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const tip = MODEL_TIPS[type] || MODEL_TIPS.sifir;
  const box = document.getElementById('modelResultBox');

  // Hafif geçiş efekti
  box.style.opacity = '0';
  box.style.transform = 'translateY(6px)';

  setTimeout(() => {
    document.getElementById('tipBadge').textContent = tip.badge;
    document.getElementById('tipTitle').textContent = tip.title;
    document.getElementById('tipDesc').textContent = tip.desc;
    const btn = document.querySelector('.tip-link-btn');
    if (btn) {
      btn.href = tip.link;
      btn.textContent = tip.btnText;
    }
    box.style.transition = 'all 0.3s ease';
    box.style.opacity = '1';
    box.style.transform = 'translateY(0)';
  }, 150);
}

// ================= 2. BİLEŞİK GETİRİ HESAPLAMA MOTORU =================
function formatTL(amount) {
  return '₺' + Math.round(amount).toLocaleString('tr-TR');
}

function calculateWealth() {
  const initial = parseFloat(document.getElementById('inputInitial').value) || 0;
  const monthly = parseFloat(document.getElementById('inputMonthly').value) || 0;
  const annualRate = (parseFloat(document.getElementById('inputRate').value) || 0) / 100;
  const years = parseInt(document.getElementById('inputYears').value) || 1;

  document.getElementById('valInitial').textContent = formatTL(initial);
  document.getElementById('valMonthly').textContent = formatTL(monthly);
  document.getElementById('valRate').textContent = '%' + Math.round(annualRate * 100);
  document.getElementById('valYears').textContent = years + ' Yıl';

  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;

  // FV = P * (1 + r)^n + PMT * [ ((1 + r)^n - 1) / r ]
  const fvInitial = initial * Math.pow(1 + monthlyRate, totalMonths);
  const fvMonthly = monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  const totalWealth = fvInitial + fvMonthly;
  const totalInvested = initial + (monthly * totalMonths);
  const totalInterest = Math.max(0, totalWealth - totalInvested);

  document.getElementById('resultTotalWealth').textContent = formatTL(totalWealth);
  document.getElementById('resultTotalInvested').textContent = formatTL(totalInvested);
  document.getElementById('resultTotalInterest').textContent = formatTL(totalInterest);
}

// ================= 3. CANLI PİYASA SİMÜLASYONU (PULSE) =================
function startMarketPulse() {
  const items = [
    { name: "S&P 500", base: 5782.40, unit: "" },
    { name: "NASDAQ", base: 18190.10, unit: "" },
    { name: "BIST 100", base: 9840.50, unit: "" },
    { name: "USD / TRY", base: 34.25, unit: "" },
    { name: "ALTIN (ONS)", base: 2654.10, unit: "$" },
    { name: "BITCOIN", base: 64320.00, unit: "$" }
  ];

  setInterval(() => {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    let html = '';
    items.forEach(item => {
      const change = (Math.random() - 0.48) * 0.4;
      const isUp = change >= 0;
      const currentVal = item.base + (item.base * (change / 100));

      const formattedVal = item.name.includes("USD") 
        ? currentVal.toFixed(2) 
        : currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      html += `
        <span class="ticker-item">
          <span class="ticker-name">${item.name}</span>
          <span class="ticker-val">${item.unit}${formattedVal}</span>
          <span class="${isUp ? 'ticker-up' : 'ticker-down'}">${isUp ? '+' : ''}${change.toFixed(2)}%</span>
        </span>
      `;
    });
    track.innerHTML = html;
  }, 4000);
}

// ================= 4. DİSCORD KULLANICI ADI KOPYALAYICI =================
function copyDiscordTag() {
  const username = "0nlyany_";

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(username).then(showToast).catch(() => fallbackCopy(username));
  } else {
    fallbackCopy(username);
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Kopyalama hatası: ', err);
    }
    textArea.remove();
    showToast();
  }

  function showToast() {
    const toast = document.getElementById("pksToast");
    if (!toast) return;

    toast.classList.add("active");
    if (window._toastTimeout) {
      clearTimeout(window._toastTimeout);
    }
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove("active");
    }, 3200);
  }
}

// ================= 5. BAŞLANGIÇ ÇALIŞTIRMA =================
document.addEventListener('DOMContentLoaded', () => {
  calculateWealth();
  startMarketPulse();

  const video = document.querySelector('.hero-video-bg');
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }
});

