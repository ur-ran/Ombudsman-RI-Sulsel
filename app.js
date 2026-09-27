// ============================================================
// APP.JS — Ombudsman Perwakilan Sulawesi Selatan (DB Version)
// ============================================================

const API_BASE       = 'api';
const YT_CHANNEL_URL = 'https://www.youtube.com/@ombudsmanrisulsel';

// Default berita fallback jika API tidak tersedia
const DEFAULT_BERITA = [
  { judul: 'Wakil Ketua Ombudsman RI Jadi Inspektur Upacara Peringatan HUT RI ke-81', tanggal: '2026-08-17', gambar_path: 'images/news1.png' },
  { judul: 'Pelepasan Peserta Jalan Sehat Ombudsman RI di Car Free Day',  tanggal: '2026-08-16', gambar_path: 'images/news2.png' },
  { judul: 'Ombudsman RI Terima Audiensi BP Batam Terkait Pelayanan Publik Sektor Investasi',  tanggal: '2026-08-13', gambar_path: 'images/news3.png' },
  { judul: 'Dukungan Ombudsman terhadap Implementasi Program SAPA UMKM', tanggal: '2026-08-12', gambar_path: 'images/news1.png' }
];

// Fetch dengan timeout
function fetchWithTimeout(url, options, timeoutMs) {
  timeoutMs = timeoutMs || 10000;
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
  return fetch(url, Object.assign({}, options, { signal: controller.signal }))
    .finally(function () { clearTimeout(timer); });
}

// ── MOBILE MENU (GLOBAL SCOPE) ────────────────────────────────────────
window.closeMobileMenu = function () {
  var nav = document.querySelector('.navbar-nav');
  var ham = document.getElementById('hamburger');
  var ovl = document.getElementById('mobileMenuOverlay');
  if (nav) nav.classList.remove('mobile-open');
  if (ovl) ovl.classList.remove('active');
  document.body.style.overflow = '';
  if (ham) {
    ham.querySelectorAll('span').forEach(function(s) {
      s.style.transform = '';
      s.style.opacity = '';
    });
  }
  document.querySelectorAll('.nav-dropdown').forEach(function(d) { d.classList.remove('open'); });
};

window.toggleMobileMenu = function () {
  var nav = document.querySelector('.navbar-nav');
  var ham = document.getElementById('hamburger');
  var ovl = document.getElementById('mobileMenuOverlay');
  if (!nav) return;
  if (nav.classList.contains('mobile-open')) {
    window.closeMobileMenu();
  } else {
    nav.classList.add('mobile-open');
    if (ovl) ovl.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (ham) {
      ham.querySelector('span:nth-child(1)').style.transform = 'rotate(45deg) translate(5px, 5px)';
      ham.querySelector('span:nth-child(2)').style.opacity = '0';
      ham.querySelector('span:nth-child(3)').style.transform = 'rotate(-45deg) translate(5px, -5px)';
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  // Inject overlay after functions are defined
  if (!document.getElementById('mobileMenuOverlay')) {
    var overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'mobileMenuOverlay';
    overlay.addEventListener('click', window.closeMobileMenu);
    document.body.appendChild(overlay);
  }

  // Dropdown accordion in mobile menu
  document.querySelectorAll('.nav-dropdown .dropdown-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      var nav = document.querySelector('.navbar-nav');
      if (nav && nav.classList.contains('mobile-open')) {
        e.preventDefault();
        var dropdown = toggle.closest('.nav-dropdown');
        var wasOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.nav-dropdown').forEach(function(d) { d.classList.remove('open'); });
        if (!wasOpen) dropdown.classList.add('open');
      }
    });
  });

  // ── NAVBAR SCROLL ─────────────────────────────────────────
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.style.boxShadow = window.scrollY > 20
        ? '0 4px 20px rgba(0,0,0,0.12)'
        : '0 1px 3px rgba(0,0,0,0.08)';
    });
  }

  // ── FAQ ACCORDION ─────────────────────────────────────────
  document.querySelectorAll('.faq-a').forEach(function (el) { el.style.display = 'none'; });
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var a = q.nextElementSibling;
      if (!a) return;
      var isOpen = a.style.display === 'block';
      document.querySelectorAll('.faq-a').forEach(function (el) { el.style.display = 'none'; });
      if (!isOpen) a.style.display = 'block';
    });
  });

  // ── LOAD DATA ────────────────────────────────────────────
  loadDashboardStats();
  loadNewsFromDB();
  loadYouTubeFromDB();
});

// ============================================================
// DASHBOARD STATS
// ============================================================
function loadDashboardStats() {
  fetchWithTimeout(API_BASE + '/stats.php', {}, 8000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.success) return;
      var s = data.data;
      var cards = document.querySelectorAll('.stat-card-value');
      if (cards[0] && s.aduan)     cards[0].textContent = s.aduan;
      if (cards[1] && s.capaian)   cards[1].textContent = s.capaian;
      if (cards[2] && s.substansi) cards[2].textContent = s.substansi;
      animateProgressBar(parseFloat(s.target_persen) || 54.33);
    })
    .catch(function () {
      animateProgressBar(54.33);
    });
}

function animateProgressBar(target) {
  var fill = document.querySelector('.progress-fill');
  var text = document.querySelector('.progress-text');
  if (!fill) return;
  fill.style.width = '0%';
  setTimeout(function () {
    fill.style.width = target + '%';
    if (text) text.textContent = target.toFixed(2).replace('.', ',') + ' %';
  }, 300);
}

// ============================================================
// BERITA dari database
// ============================================================
function loadNewsFromDB() {
  var grid = document.getElementById('newsGrid');
  if (!grid) return;

  // Langsung tampilkan fallback dulu, lalu replace jika API berhasil
  renderDefaultNews(grid);

  fetchWithTimeout(API_BASE + '/berita.php?action=published&limit=4', {}, 8000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.success || !data.data || data.data.length === 0) return;
      grid.innerHTML = '';
      data.data.forEach(function (berita) {
        var imgSrc  = berita.gambar_path || 'images/news1.png';
        var dateStr = relativeDate(berita.tanggal);
        var card    = document.createElement('a');
        card.href   = 'berita-detail.html?id=' + berita.id;
        card.className = 'news-card';
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
        card.style.display = 'block';
        card.innerHTML =
          '<div class="news-thumb-wrap">' +
            '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(berita.judul) + '" class="news-thumb" loading="lazy"' +
              ' onerror="this.src=\'images/news1.png\'" />' +
            '<div class="news-play-badge"><i class="fas fa-image"></i></div>' +
          '</div>' +
          '<div class="news-card-body">' +
            '<p class="news-card-title">' + escHtml(berita.judul) + '</p>' +
            '<span class="news-card-date">' + dateStr + '</span>' +
          '</div>';
        grid.appendChild(card);
      });
      // Tambah link "Lihat Semua Berita"
      var seeAll = document.createElement('div');
      seeAll.style.cssText = 'grid-column:1/-1;text-align:center;margin-top:8px;';
      seeAll.innerHTML = '<a href="berita.html" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#1A3A6B;color:#fff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background=\'#E8401C\'" onmouseout="this.style.background=\'#1A3A6B\'"><i class="fas fa-newspaper"></i> Lihat Semua Berita</a>';
      grid.appendChild(seeAll);
    })
    .catch(function () {
      // Fallback sudah ditampilkan, tidak perlu lakukan apa-apa
    });
}

function renderDefaultNews(grid) {
  grid.innerHTML = '';
  DEFAULT_BERITA.forEach(function (berita) {
    var dateStr = relativeDate(berita.tanggal);
    var card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML =
      '<div class="news-thumb-wrap">' +
        '<img src="' + berita.gambar_path + '" alt="' + escHtml(berita.judul) + '" class="news-thumb" loading="lazy" />' +
        '<div class="news-play-badge"><i class="fas fa-image"></i></div>' +
      '</div>' +
      '<div class="news-card-body">' +
        '<p class="news-card-title">' + escHtml(berita.judul) + '</p>' +
        '<span class="news-card-date">' + dateStr + '</span>' +
      '</div>';
    grid.appendChild(card);
  });
}

// ============================================================
// PODCAST dari YouTube cache (PHP API)
// ============================================================
function loadYouTubeFromDB() {
  var grid = document.getElementById('podcastGrid');
  if (!grid) return;

  // Tampilkan fallback dulu
  renderFallbackPodcast(grid);

  fetchWithTimeout(API_BASE + '/youtube.php?limit=2', {}, 25000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.success || !data.data || data.data.length === 0) return;
      grid.innerHTML = '';
      data.data.forEach(function (item) {
        var wrapper       = document.createElement('a');
        wrapper.href      = YT_CHANNEL_URL;
        wrapper.target    = '_blank';
        wrapper.rel       = 'noopener';
        wrapper.className = 'podcast-card-large';
        wrapper.innerHTML =
          '<div class="podcast-thumb-wrap">' +
            '<img src="' + escHtml(item.thumbnail_url) + '" alt="' + escHtml(item.judul) + '"' +
              ' class="podcast-thumb" loading="lazy" onerror="this.src=\'images/podcast1.png\'" />' +
            '<div class="podcast-overlay">' +
              '<div class="yt-badge"><i class="fab fa-youtube"></i> <span>YouTube</span></div>' +
              '<div class="podcast-play-btn"><i class="fas fa-play"></i></div>' +
            '</div>' +
          '</div>' +
          '<div class="podcast-card-body">' +
            '<p class="podcast-title">' + escHtml(item.judul) + '</p>' +
            '<div class="podcast-meta">' +
              '<span class="podcast-time"><i class="fas fa-calendar-alt"></i> ' + relativeDate(item.published_at) + '</span>' +
            '</div>' +
            (item.deskripsi
              ? '<p style="font-size:11px;color:var(--text-light);margin-top:6px;line-height:1.5;' +
                  'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' +
                  escHtml(item.deskripsi) + '</p>'
              : '') +
          '</div>';
        grid.appendChild(wrapper);
      });
    })
    .catch(function () {
      // Fallback sudah ditampilkan
    });
}

function renderFallbackPodcast(grid) {
  grid.innerHTML = '';
  var titles = ['Video Terbaru Ombudsman RI Sulsel', 'Podcast & Ruang Bincang Ombudsman'];
  titles.forEach(function (title) {
    var wrapper       = document.createElement('a');
    wrapper.href      = YT_CHANNEL_URL;
    wrapper.target    = '_blank';
    wrapper.rel       = 'noopener';
    wrapper.className = 'podcast-card-large';
    wrapper.innerHTML =
      '<div class="podcast-thumb-wrap">' +
        '<img src="images/podcast1.png" alt="' + escHtml(title) + '" class="podcast-thumb" />' +
        '<div class="podcast-overlay">' +
          '<div class="yt-badge"><i class="fab fa-youtube"></i> <span>YouTube</span></div>' +
          '<div class="podcast-play-btn"><i class="fas fa-play"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="podcast-card-body">' +
        '<p class="podcast-title">' + escHtml(title) + '</p>' +
        '<div class="podcast-meta">' +
          '<span class="podcast-time"><i class="fab fa-youtube"></i> Klik untuk tonton di YouTube</span>' +
        '</div>' +
      '</div>';
    grid.appendChild(wrapper);
  });
}

// ============================================================
// UTILITIES
// ============================================================
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function relativeDate(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)           return 'Baru saja';
  if (diff < 3600)         return Math.floor(diff / 60) + ' menit lalu';
  if (diff < 86400)        return Math.floor(diff / 3600) + ' jam lalu';
  if (diff < 86400 * 7)    return Math.floor(diff / 86400) + ' hari lalu';
  if (diff < 86400 * 30)   return Math.floor(diff / (86400 * 7)) + ' minggu lalu';
  if (diff < 86400 * 365)  return Math.floor(diff / (86400 * 30)) + ' bulan lalu';
  return Math.floor(diff / (86400 * 365)) + ' tahun lalu';
}
