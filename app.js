/**
 * KAPİTAL | CORE JAVASCRIPT
 * İnteraktif Bileşik Getiri Hesaplayıcı & Canlı Piyasa Ticker Simülasyonu
 */

// ================= 1. BİLEŞİK GETİRİ HESAPLAMA MOTORU =================
function formatTL(amount) {
  return '₺' + Math.round(amount).toLocaleString('tr-TR');
}

function calculateWealth() {
  const initial = parseFloat(document.getElementById('inputInitial').value) || 0;
  const monthly = parseFloat(document.getElementById('inputMonthly').value) || 0;
  const annualRate = (parseFloat(document.getElementById('inputRate').value) || 0) / 100;
  const years = parseInt(document.getElementById('inputYears').value) || 1;

  // Slider Etiketlerini Güncelle
  document.getElementById('valInitial').textContent = formatTL(initial);
  document.getElementById('valMonthly').textContent = formatTL(monthly);
  document.getElementById('valRate').textContent = '%' + Math.round(annualRate * 100);
  document.getElementById('valYears').textContent = years + ' Yıl';

  // Aylık Faiz & Toplam Ay
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;

  // Gelecekteki Değer Formülü (Future Value of Series)
  // FV = P * (1 + r)^n + PMT * [ ((1 + r)^n - 1) / r ]
  const fvInitial = initial * Math.pow(1 + monthlyRate, totalMonths);
  const fvMonthly = monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  const totalWealth = fvInitial + fvMonthly;
  const totalInvested = initial + (monthly * totalMonths);
  const totalInterest = Math.max(0, totalWealth - totalInvested);

  // Ekrana Yazdır
  document.getElementById('resultTotalWealth').textContent = formatTL(totalWealth);
  document.getElementById('resultTotalInvested').textContent = formatTL(totalInvested);
  document.getElementById('resultTotalInterest').textContent = formatTL(totalInterest);
}

// ================= 2. CANLI PİYASA SİMÜLASYONU (PULSE) =================
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

// ================= 3. BAŞLANGIÇ ÇALIŞTIRMA =================
document.addEventListener('DOMContentLoaded', () => {
  calculateWealth();
  startMarketPulse();

  // Video otomatik oynatma garantisi
  const video = document.querySelector('.hero-video-bg');
  if (video) {
    video.muted = true;
    video.play().catch(() => {
      // Tarayıcı kısıtlaması varsa sessizce devam et
    });
  }
});
