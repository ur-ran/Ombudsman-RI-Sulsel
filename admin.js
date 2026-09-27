// ============================================================
// ADMIN.JS — Super Admin Panel (PHP API Version)
// ============================================================

const API_BASE = 'api';

// ============================================================
// AUTH
// ============================================================
async function doLogin() {
  const u    = document.getElementById('loginUsername').value.trim();
  const p    = document.getElementById('loginPassword').value;
  const btn  = document.getElementById('btnLogin');
  const errEl = document.getElementById('loginError');

  if (!u || !p) { showLoginError('Username dan password tidak boleh kosong.'); return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';

  try {
    const res  = await fetch(`${API_BASE}/auth.php?action=login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (data.success) {
      errEl.style.display = 'none';
      showAdminLayout();
    } else {
      showLoginError(data.message || 'Login gagal.');
      document.getElementById('loginPassword').value = '';
    }
  } catch (e) {
    showLoginError('Tidak dapat terhubung ke server. Pastikan XAMPP aktif.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
  }
}

function showLoginError(msg) {
  const errEl = document.getElementById('loginError');
  errEl.textContent = msg;
  errEl.style.display = 'block';
}

async function doLogout() {
  await fetch(`${API_BASE}/auth.php?action=logout`, { method: 'POST', credentials: 'include' });
  document.getElementById('adminLayout').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

async function checkSession() {
  try {
    const res  = await fetch(`${API_BASE}/auth.php?action=check`, { credentials: 'include' });
    const data = await res.json();
    return data.success;
  } catch { return false; }
}

function togglePassword() {
  const inp  = document.getElementById('loginPassword');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

function showAdminLayout() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  renderTable();
  loadDashboardStats();
  loadPodcastPreview();
  initProfil();
}

document.addEventListener('DOMContentLoaded', async function () {
  // Cek session
  const loggedIn = await checkSession();
  if (loggedIn) showAdminLayout();

  // Enter key
  ['loginUsername', 'loginPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
});

// ============================================================
// SIDEBAR & NAVIGATION
// ============================================================
function showSection(name, linkEl) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  const map = {
    berita:    'sectionBerita',
    dashboard: 'sectionDashboard',
    podcast:   'sectionPodcast',
    profil:    'sectionProfil',
    magang:    'sectionMagang',
    project:   'sectionProject',
    galeri:    'sectionGaleri',
    laporan:   'sectionLaporan'
  };
  const titleMap = {
    berita:    'Manajemen Berita',
    dashboard: 'Dashboard Stats',
    podcast:   'Podcast / YouTube',
    profil:    'Profil / Tentang Kami',
    magang:    'Data Peserta Magang',
    project:   'Project Magang',
    galeri:    'Galeri Magang',
    laporan:   'Laporan Tahunan'
  };
  const sec = document.getElementById(map[name]);
  if (sec) sec.classList.add('active');
  document.getElementById('topbarTitle').textContent = titleMap[name] || '';
  document.getElementById('sidebar').classList.remove('mobile-open');
  // Auto-load MORI data when switching
  if (name === 'magang')  loadMagangData();
  if (name === 'project') loadProjectData();
  if (name === 'galeri')  loadGaleriData();
  if (name === 'laporan') loadLaporanData();
  return false;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('adminMain').classList.toggle('shifted');
}

function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}

// ============================================================
// BERITA — RENDER TABLE
// ============================================================
let allBerita = [];

async function renderTable() {
  const tbody  = document.getElementById('tbodyBerita');
  const emptyEl = document.getElementById('tableEmpty');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Memuat data...</td></tr>`;
  emptyEl.style.display = 'none';

  try {
    const res  = await fetch(`${API_BASE}/berita.php?action=list`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    allBerita = data.data;
    applyFilter();
    updateStats();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--red);">Gagal memuat data: ${escHtml(e.message)}</td></tr>`;
  }
}

function applyFilter() {
  const search = (document.getElementById('searchBerita').value || '').toLowerCase();
  const status = document.getElementById('filterStatus').value || '';
  const filtered = allBerita.filter(b => {
    const matchSearch = !search || b.judul.toLowerCase().includes(search);
    const matchStatus = !status || b.status === status;
    return matchSearch && matchStatus;
  });
  renderRows(filtered);
}

function filterBerita() { applyFilter(); }

function renderRows(list) {
  const tbody  = document.getElementById('tbodyBerita');
  const emptyEl = document.getElementById('tableEmpty');
  tbody.innerHTML = '';
  if (list.length === 0) { emptyEl.style.display = 'block'; return; }
  emptyEl.style.display = 'none';

  list.forEach((berita, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="table-num">${idx + 1}</span></td>
      <td>
        <div class="table-title">${escHtml(berita.judul)}</div>
        ${berita.konten ? `<div style="font-size:11px;color:var(--text-light);margin-top:2px;">${escHtml(berita.konten.substring(0,60))}${berita.konten.length>60?'...':''}</div>` : ''}
      </td>
      <td><span class="table-cat">${escHtml(berita.kategori)}</span></td>
      <td style="font-size:12px;">${formatTanggal(berita.tanggal)}</td>
      <td>
        ${berita.status === 'published'
          ? `<span class="badge-published"><i class="fas fa-circle" style="font-size:6px;"></i> Publik</span>`
          : `<span class="badge-draft"><i class="fas fa-circle" style="font-size:6px;"></i> Draft</span>`}
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl edit" onclick="openModalEdit(${berita.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-tbl hapus" onclick="openModalHapus(${berita.id}, '${escHtml(berita.judul).replace(/'/g,"'")}')"><i class="fas fa-trash"></i> Hapus</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function updateStats() {
  const total     = allBerita.length;
  const published = allBerita.filter(b => b.status === 'published').length;
  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statPublished').textContent = published;
  document.getElementById('statDraft').textContent     = total - published;
}

// ============================================================
// BERITA — MODAL TAMBAH / EDIT
// ============================================================
function openModalTambah() {
  document.getElementById('modalTitle').textContent = 'Tambah Berita Baru';
  document.getElementById('editId').value = '';
  document.getElementById('inputJudul').value    = '';
  document.getElementById('inputKategori').value = 'Berita';
  document.getElementById('inputTanggal').value  = todayStr();
  document.getElementById('inputStatus').value   = 'published';
  document.getElementById('inputKonten').value   = '';
  clearImagePreview();
  openModal();
}

async function openModalEdit(id) {
  try {
    const res  = await fetch(`${API_BASE}/berita.php?action=get&id=${id}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) { showToast('Gagal memuat data berita.'); return; }
    const b = data.data;
    document.getElementById('modalTitle').textContent = 'Edit Berita';
    document.getElementById('editId').value           = b.id;
    document.getElementById('inputJudul').value       = b.judul;
    document.getElementById('inputKategori').value    = b.kategori || 'Berita';
    document.getElementById('inputTanggal').value     = b.tanggal;
    document.getElementById('inputStatus').value      = b.status || 'published';
    document.getElementById('inputKonten').value      = b.konten || '';
    if (b.gambar_path) {
      const prev = document.getElementById('uploadPreview');
      prev.src = b.gambar_path;
      prev.style.display = 'block';
      document.getElementById('uploadPlaceholder').style.display = 'none';
      document.getElementById('uploadArea').dataset.existingPath = b.gambar_path;
    } else {
      clearImagePreview();
    }
    openModal();
  } catch (e) {
    showToast('Error: ' + e.message);
  }
}

function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// ── UPLOAD GAMBAR ─────────────────────────────────────────────
let uploadedImagePath = '';

async function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file terlalu besar (maks 5MB).'); return; }

  // Preview lokal dulu
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('uploadPreview');
    prev.src = e.target.result;
    prev.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);

  // Upload ke server
  const formData = new FormData();
  formData.append('gambar', file);
  try {
    const res  = await fetch(`${API_BASE}/upload.php`, { method: 'POST', credentials: 'include', body: formData });
    const data = await res.json();
    if (data.success) {
      uploadedImagePath = data.path;
      showToast('Gambar berhasil diupload.');
    } else {
      showToast('Upload gagal: ' + data.message);
    }
  } catch (e) {
    showToast('Upload error: ' + e.message);
  }
}

function clearImagePreview() {
  const prev = document.getElementById('uploadPreview');
  prev.src = '';
  prev.style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  document.getElementById('inputGambar').value = '';
  uploadedImagePath = '';
  delete document.getElementById('uploadArea').dataset.existingPath;
}

// ── SIMPAN BERITA ─────────────────────────────────────────────
async function simpanBerita() {
  const judul   = document.getElementById('inputJudul').value.trim();
  const tanggal = document.getElementById('inputTanggal').value;
  if (!judul)   { alert('Judul berita tidak boleh kosong.'); return; }
  if (!tanggal) { alert('Tanggal harus diisi.'); return; }

  const editId   = document.getElementById('editId').value;
  const kategori = document.getElementById('inputKategori').value;
  const status   = document.getElementById('inputStatus').value;
  const konten   = document.getElementById('inputKonten').value.trim();
  const existingPath = document.getElementById('uploadArea').dataset.existingPath || '';
  const gambarPath   = uploadedImagePath || existingPath;

  const payload  = { judul, kategori, tanggal, status, konten, gambar_path: gambarPath };
  const action   = editId ? 'update' : 'create';
  if (editId) payload.id = parseInt(editId);

  const btn = document.querySelector('.modal-footer .btn-primary');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const res  = await fetch(`${API_BASE}/berita.php?action=${action}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Berita disimpan!');
      closeModal();
      uploadedImagePath = '';
      renderTable();
    } else {
      showToast('Gagal: ' + data.message);
    }
  } catch (e) {
    showToast('Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Simpan Berita';
  }
}

// ============================================================
// BERITA — MODAL HAPUS
// ============================================================
let hapusTargetId = null;

function openModalHapus(id, judul) {
  hapusTargetId = id;
  document.getElementById('hapusName').textContent = '"' + judul + '"';
  document.getElementById('modalHapusOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModalHapus() {
  document.getElementById('modalHapusOverlay').classList.remove('open');
  document.body.style.overflow = '';
  hapusTargetId = null;
}

function closeHapusOutside(e) {
  if (e.target === document.getElementById('modalHapusOverlay')) closeModalHapus();
}

async function konfirmasiHapus() {
  if (!hapusTargetId) return;
  const btn = document.querySelector('#modalHapusCard .btn-danger');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
  try {
    const res  = await fetch(`${API_BASE}/berita.php?action=delete&id=${hapusTargetId}`, {
      method: 'DELETE', credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Berita berhasil dihapus.');
      closeModalHapus();
      renderTable();
    } else {
      showToast('Gagal: ' + data.message);
    }
  } catch (e) {
    showToast('Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash-alt"></i> Ya, Hapus';
  }
}

// ============================================================
// DASHBOARD STATS
// ============================================================
async function loadDashboardStats() {
  try {
    const res  = await fetch(`${API_BASE}/stats.php`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) return;
    const s = data.data;
    if (s.aduan)         document.getElementById('statAduan').value     = s.aduan;
    if (s.capaian)       document.getElementById('statCapaian').value   = s.capaian;
    if (s.substansi)     document.getElementById('statSubstansi').value = s.substansi;
    if (s.target_persen) {
      document.getElementById('statTarget').value = s.target_persen;
      updateTargetPreview();
    }
  } catch (e) { console.error('Stats load error:', e); }
}

async function saveDashboardStats() {
  const payload = {
    aduan:         document.getElementById('statAduan').value,
    capaian:       document.getElementById('statCapaian').value,
    substansi:     document.getElementById('statSubstansi').value,
    target_persen: parseFloat(document.getElementById('statTarget').value) || 54.33
  };
  try {
    const res  = await fetch(`${API_BASE}/stats.php`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      const toast = document.getElementById('saveToast');
      toast.style.display = 'flex';
      setTimeout(() => toast.style.display = 'none', 3000);
    } else {
      showToast('Gagal simpan: ' + data.message);
    }
  } catch (e) { showToast('Error: ' + e.message); }
}

function updateTargetPreview() {
  const val = parseFloat(document.getElementById('statTarget').value) || 0;
  const pct = Math.min(100, Math.max(0, val));
  document.getElementById('previewFill').style.width = pct + '%';
  document.getElementById('previewText').textContent = pct.toFixed(2).replace('.', ',') + ' %';
}

// ============================================================
// PODCAST PREVIEW
// ============================================================
async function loadPodcastPreview() {
  const grid = document.getElementById('podcastPreviewGrid');
  if (!grid) return;
  grid.innerHTML = `<div class="loading-podcast"><i class="fas fa-spinner fa-spin"></i> Memuat video YouTube...</div>`;

  try {
    const res  = await fetch(`${API_BASE}/youtube.php?limit=4`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success || !data.data.length) throw new Error('No data');
    grid.innerHTML = '';
    data.data.forEach(item => {
      const card = document.createElement('a');
      card.href = `https://www.youtube.com/@ombudsmanrisulsel`;
      card.target = '_blank';
      card.className = 'podcast-prev-card';
      card.innerHTML = `
        <img class="podcast-prev-thumb" src="${escHtml(item.thumbnail_url)}" alt="${escHtml(item.judul)}" loading="lazy" onerror="this.src='images/podcast1.png'" />
        <div class="podcast-prev-body">
          <div class="podcast-prev-title">${escHtml(item.judul)}</div>
          <div class="podcast-prev-date"><i class="fas fa-calendar-alt" style="margin-right:4px;"></i>${formatDateStr(item.published_at)}</div>
          ${item.deskripsi ? `<div style="font-size:11px;color:var(--text-light);margin-top:4px;line-height:1.4;">${escHtml(item.deskripsi.substring(0,100))}${item.deskripsi.length>100?'...':''}</div>` : ''}
        </div>`;
      grid.appendChild(card);
    });

    // Tombol force refresh
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn-primary';
    refreshBtn.style.cssText = 'margin-top:12px;grid-column:span 2;width:100%;justify-content:center;';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh dari YouTube';
    refreshBtn.onclick = refreshYoutube;
    grid.appendChild(refreshBtn);

  } catch (e) {
    grid.innerHTML = `<div class="loading-podcast" style="color:var(--text-light);">
      <i class="fab fa-youtube" style="font-size:28px;color:#FF0000;margin-bottom:8px;display:block;"></i>
      Gagal memuat video. <a href="https://www.youtube.com/@ombudsmanrisulsel" target="_blank" style="color:var(--navy-light);">Buka YouTube</a>
    </div>`;
  }
}

async function refreshYoutube() {
  const grid = document.getElementById('podcastPreviewGrid');
  grid.innerHTML = `<div class="loading-podcast"><i class="fas fa-spinner fa-spin"></i> Mengambil data terbaru dari YouTube...</div>`;
  try {
    const res  = await fetch(`${API_BASE}/youtube.php?action=refresh`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) { showToast(data.message); }
    loadPodcastPreview();
  } catch (e) { showToast('Refresh gagal: ' + e.message); }
}

// ============================================================
// UTILITIES
// ============================================================
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function todayStr() { return new Date().toISOString().slice(0,10); }

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

function formatDateStr(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3500);
}

// ============================================================
// MORI — DATA PESERTA MAGANG
// ============================================================
let allMagang = [];

async function loadMagangData() {
  const tbody = document.getElementById('tbodyMagang');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Memuat...</td></tr>`;
  try {
    const res  = await fetch(`${API_BASE}/magang.php?type=peserta`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    allMagang = data.data;
    // Update stats
    if (data.stats) {
      document.getElementById('mStatAktif').textContent     = data.stats.aktif     || 0;
      document.getElementById('mStatAlumni').textContent    = data.stats.alumni    || 0;
      document.getElementById('mStatHonor').textContent     = data.stats.honor     || 0;
      document.getElementById('mStatKemenaker').textContent = data.stats.kemenaker || 0;
      document.getElementById('mStatAntrian').textContent   = data.stats.antrian   || 0;
      document.getElementById('mStatTotal').textContent     = data.stats.total     || 0;
    }
    renderMagangTable();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#dc2626;">Gagal memuat: ${escHtml(e.message)}</td></tr>`;
  }
}

function renderMagangTable() {
  const tbody = document.getElementById('tbodyMagang');
  if (!allMagang.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#9CA3AF;"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:10px;opacity:0.3;"></i>Belum ada data peserta magang.</td></tr>`;
    return;
  }
  tbody.innerHTML = allMagang.map((p, i) => `
    <tr>
      <td style="color:#9CA3AF;font-size:12px;">${i+1}</td>
      <td style="font-weight:600;color:#1A1A2E;">
        ${escHtml(p.nama)}
        ${p.nim ? `<div style="font-size:11px;color:#6B7280;font-weight:400;margin-top:2px;">NIM/NIP: ${escHtml(p.nim)}</div>` : ''}
      </td>
      <td style="font-size:12px;">${escHtml(p.jurusan || '—')}</td>
      <td style="font-size:12px;">${escHtml(p.kampus || '—')}</td>
      <td style="font-size:11px;color:#6B7280;">
        ${formatTanggal(p.tanggal_mulai)} –<br>${p.tanggal_selesai ? formatTanggal(p.tanggal_selesai) : '<span style="color:#16a34a;font-weight:600;">Sekarang</span>'}
      </td>
      <td>
        ${p.kategori === 'kemenaker' ? `<span style="font-weight:600;font-size:12px;color:#0d9488;">Kemenaker</span>` :
          p.kategori === 'honor' ? `<span style="font-weight:600;font-size:12px;color:#d97706;">Honor</span>` :
          `<span style="font-weight:600;font-size:12px;color:#3b82f6;">Kampus</span>`}
      </td>
      <td>
        ${p.status === 'aktif'
          ? `<span class="badge-published"><i class="fas fa-circle" style="font-size:6px;"></i> Aktif</span>`
          : p.status === 'alumni'
          ? `<span class="badge-draft"><i class="fas fa-circle" style="font-size:6px;"></i> Alumni</span>`
          : p.status === 'antrian'
          ? `<span style="display:inline-block;padding:2px 8px;border-radius:50px;font-size:11px;font-weight:700;background:rgba(139,92,246,0.15);color:#8b5cf6;"><i class="fas fa-circle" style="font-size:6px;"></i> Antrian</span>`
          : `<span class="badge-draft">${p.status}</span>`}
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl edit" onclick="openModalEditMagang(${p.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-tbl hapus" onclick="openHapusMori('peserta',${p.id},'${escHtml(p.nama).replace(/'/g,"'")}')"><i class="fas fa-trash"></i> Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openModalMagang() {
  document.getElementById('modalMagangTitle').textContent = 'Tambah Peserta Magang';
  document.getElementById('editMagangId').value   = '';
  document.getElementById('mInputNama').value     = '';
  document.getElementById('mInputNim').value      = '';
  document.getElementById('mInputJurusan').value  = '';
  document.getElementById('mInputKampus').value   = '';
  document.getElementById('mInputMulai').value    = todayStr();
  document.getElementById('mInputSelesai').value  = '';
  document.getElementById('mInputKategori').value = 'kampus';
  document.getElementById('mInputCatatan').value  = '';
  document.getElementById('modalMagangOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

async function openModalEditMagang(id) {
  const p = allMagang.find(x => x.id == id);
  if (!p) return;
  document.getElementById('modalMagangTitle').textContent = 'Edit Peserta Magang';
  document.getElementById('editMagangId').value   = p.id;
  document.getElementById('mInputNama').value     = p.nama || '';
  document.getElementById('mInputNim').value      = p.nim || '';
  document.getElementById('mInputJurusan').value  = p.jurusan || '';
  document.getElementById('mInputKampus').value   = p.kampus || '';
  document.getElementById('mInputMulai').value    = p.tanggal_mulai || '';
  document.getElementById('mInputSelesai').value  = p.tanggal_selesai || '';
  document.getElementById('mInputKategori').value = p.kategori || 'kampus';
  document.getElementById('mInputCatatan').value  = p.catatan || '';
  document.getElementById('modalMagangOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModalMagang() {
  document.getElementById('modalMagangOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeMagangOutside(e) {
  if (e.target === document.getElementById('modalMagangOverlay')) closeModalMagang();
}

async function simpanMagang() {
  const nama    = document.getElementById('mInputNama').value.trim();
  const mulai   = document.getElementById('mInputMulai').value;
  if (!nama)  { showToast('Nama peserta tidak boleh kosong.'); return; }
  if (!mulai) { showToast('Tanggal mulai harus diisi.'); return; }

  const editId  = document.getElementById('editMagangId').value;
  const payload = {
    nama,
    nim:             document.getElementById('mInputNim').value.trim(),
    jurusan:         document.getElementById('mInputJurusan').value.trim(),
    kampus:          document.getElementById('mInputKampus').value.trim(),
    tanggal_mulai:   mulai,
    tanggal_selesai: document.getElementById('mInputSelesai').value || null,
    kategori:        document.getElementById('mInputKategori').value,
    catatan:         document.getElementById('mInputCatatan').value.trim(),
  };

  const btn = document.getElementById('btnSimpanMagang');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const url    = editId ? `${API_BASE}/magang.php?type=peserta&id=${editId}` : `${API_BASE}/magang.php?type=peserta`;
    const method = editId ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data   = await res.json();
    if (data.success) {
      showToast(data.message || 'Berhasil disimpan!');
      closeModalMagang();
      loadMagangData();
    } else {
      showToast('Gagal: ' + data.message);
    }
  } catch (e) { showToast('Error: ' + e.message); }
  finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }
}

// ============================================================
// MORI — PROJECT MAGANG
// ============================================================
let allProject = [];

async function loadProjectData() {
  const tbody = document.getElementById('tbodyProject');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Memuat...</td></tr>`;
  try {
    const res  = await fetch(`${API_BASE}/magang.php?type=project`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    allProject = data.data;
    renderProjectTable();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#dc2626;">Gagal memuat: ${escHtml(e.message)}</td></tr>`;
  }
}

function renderProjectTable() {
  const tbody = document.getElementById('tbodyProject');
  if (!allProject.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#9CA3AF;"><i class="fas fa-folder-open" style="font-size:32px;display:block;margin-bottom:10px;opacity:0.3;"></i>Belum ada project.</td></tr>`;
    return;
  }
  tbody.innerHTML = allProject.map((p, i) => `
    <tr>
      <td style="color:#9CA3AF;font-size:12px;">${i+1}</td>
      <td>
        <div style="font-weight:600;color:#1A1A2E;">${escHtml(p.judul)}</div>
        ${p.deskripsi ? `<div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${escHtml(p.deskripsi.substring(0,60))}${p.deskripsi.length>60?'...':''}</div>` : ''}
      </td>
      <td><span class="table-cat" style="background:rgba(124,58,237,0.1);color:#7c3aed;">${escHtml(p.kategori||'Riset')}</span></td>
      <td style="font-size:12px;">${escHtml(p.peserta || '—')}</td>
      <td style="font-size:12px;">${formatTanggal(p.tanggal)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl edit" onclick="openModalEditProject(${p.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-tbl hapus" onclick="openHapusMori('project',${p.id},'${escHtml(p.judul).replace(/'/g,"'")}')"><i class="fas fa-trash"></i> Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openModalProject() {
  document.getElementById('modalProjectTitle').textContent = 'Tambah Kegiatan';
  document.getElementById('editProjectId').value  = '';
  document.getElementById('pInputJudul').value    = '';
  document.getElementById('pInputKategori').value = 'Umum';
  document.getElementById('pInputTanggal').value  = todayStr();
  document.getElementById('pInputPeserta').value  = '';
  document.getElementById('pInputDeskripsi').value = '';
  document.getElementById('pInputFile').value = '';
  document.getElementById('pFileLabel').textContent = 'Klik atau drag file ke sini';
  document.getElementById('pCurrentFile').style.display = 'none';
  document.getElementById('modalProjectOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openModalEditProject(id) {
  const p = allProject.find(x => x.id == id);
  if (!p) return;
  document.getElementById('modalProjectTitle').textContent = 'Edit Kegiatan';
  document.getElementById('editProjectId').value   = p.id;
  document.getElementById('pInputJudul').value     = p.judul || '';
  document.getElementById('pInputKategori').value  = p.kategori || 'Umum';
  document.getElementById('pInputTanggal').value   = p.tanggal || '';
  document.getElementById('pInputPeserta').value   = p.peserta || '';
  document.getElementById('pInputDeskripsi').value = p.deskripsi || '';
  document.getElementById('pInputFile').value = '';
  document.getElementById('pFileLabel').textContent = 'Klik atau drag file ke sini';
  if (p.file_path) {
    document.getElementById('pCurrentFile').style.display = 'block';
    document.getElementById('pCurrentFile').innerHTML = `File saat ini: <a href="${p.file_path}" target="_blank">${p.file_path.split('/').pop()}</a>`;
  } else {
    document.getElementById('pCurrentFile').style.display = 'none';
  }
  document.getElementById('modalProjectOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModalProject() {
  document.getElementById('modalProjectOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeProjectOutside(e) {
  if (e.target === document.getElementById('modalProjectOverlay')) closeModalProject();
}

async function simpanProject() {
  const judul   = document.getElementById('pInputJudul').value.trim();
  const tanggal = document.getElementById('pInputTanggal').value;
  if (!judul)   { showToast('Judul kegiatan tidak boleh kosong.'); return; }
  if (!tanggal) { showToast('Tanggal harus diisi.'); return; }

  const editId  = document.getElementById('editProjectId').value;
  
  const formData = new FormData();
  formData.append('judul', judul);
  formData.append('deskripsi', document.getElementById('pInputDeskripsi').value.trim());
  formData.append('peserta', document.getElementById('pInputPeserta').value.trim());
  formData.append('tanggal', tanggal);
  formData.append('kategori', document.getElementById('pInputKategori').value);
  
  const fileInput = document.getElementById('pInputFile');
  if (!editId && fileInput.files.length === 0) {
    showToast('Lampiran Media (foto/video) wajib diupload.');
    return;
  }
  
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const validExts = ['jpg', 'jpeg', 'png', 'mp4', 'heic', 'mov'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
      showToast('Format file tidak didukung! Gunakan JPG, PNG, MP4, HEIC, atau MOV.');
      return;
    }
    formData.append('file', file);
  }

  const btn = document.getElementById('btnSimpanProject');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const url    = editId ? `${API_BASE}/magang.php?type=project&id=${editId}` : `${API_BASE}/magang.php?type=project`;
    // For FormData, do not set Content-Type header (browser sets it automatically with boundary)
    // However, fetch with PUT doesn't support multipart/form-data properly in PHP's $_FILES, 
    // we must use POST and let PHP handle it (we've already changed magang.php to check method). Wait, actually we can send method: 'POST' and append a '_method' field if we want, or just stick to POST if editId is present and handle it in PHP?
    // In magang.php we have `if ($method === 'PUT')` and it does `if ($type === 'project' && !empty($_FILES)) { $body = $_POST; }`. But PHP does not populate $_FILES on PUT requests natively.
    // Let's use POST for both and add a hidden field or modify the PHP to accept POST for update.
    // Let's just use fetch as PUT, actually wait... I'll check how PHP handles it. PHP only parses multipart/form-data for POST.
    // I should probably change the method to POST and add `&_method=PUT` or something. Or modify PHP to accept POST for updates if ID is set. Let's see how I can handle this without breaking existing code.
    const method = editId ? 'POST' : 'POST';
    const actualUrl = editId ? `${API_BASE}/magang.php?type=project&id=${editId}&_method=PUT` : url;

    const res    = await fetch(actualUrl, { method: 'POST', credentials: 'include', body: formData });
    const data   = await res.json();
    if (data.success) {
      showToast(data.message || 'Kegiatan berhasil disimpan!');
      closeModalProject();
      loadProjectData();
    } else {
      showToast('Gagal: ' + data.message);
    }
  } catch (e) { showToast('Error: ' + e.message); }
  finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Simpan Kegiatan';
  }
}

function handleProjectFileDrop(e) {
  e.preventDefault();
  document.getElementById('pFileDropZone').style.borderColor = '#e2e8f0';
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    document.getElementById('pInputFile').files = e.dataTransfer.files;
    showProjectFileName(document.getElementById('pInputFile'));
  }
}

function showProjectFileName(input) {
  if (input.files && input.files[0]) {
    document.getElementById('pFileLabel').textContent = input.files[0].name;
  } else {
    document.getElementById('pFileLabel').textContent = 'Klik atau drag file ke sini';
  }
}

// ============================================================
// MORI — GALERI
// ============================================================
let allGaleri = [];

async function loadGaleriData() {
  const grid = document.getElementById('adminGaleriGrid');
  if (!grid) return;
  grid.innerHTML = `<div style="text-align:center;padding:40px;color:#9CA3AF;grid-column:1/-1;"><i class="fas fa-spinner fa-spin" style="font-size:24px;"></i></div>`;
  try {
    const res  = await fetch(`${API_BASE}/magang.php?type=galeri`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    allGaleri = data.data;

    // Tampilkan count
    const countEl = document.getElementById('galeriCount');
    const total   = data.total ?? allGaleri.length;
    if (countEl) countEl.textContent = `(${total} foto)`;

    // Tampilkan notif sync jika ada foto baru
    if (data.synced > 0) {
      const syncStatus = document.getElementById('syncStatus');
      if (syncStatus) {
        syncStatus.style.display = 'block';
        syncStatus.style.color   = '#16a34a';
        syncStatus.innerHTML     = `<i class="fas fa-check-circle"></i> ${data.synced} foto baru dari folder berhasil didaftarkan!`;
        setTimeout(() => { syncStatus.style.display = 'none'; }, 5000);
      }
    }

    renderGaleriGrid();
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:#dc2626;">Gagal memuat: ${escHtml(e.message)}</div>`;
  }
}

// Sync manual dari folder /magang/
async function syncGaleriFolder() {
  const btn        = document.getElementById('btnSyncFolder');
  const syncStatus = document.getElementById('syncStatus');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...'; }
  if (syncStatus) { syncStatus.style.display = 'none'; }

  try {
    const res  = await fetch(`${API_BASE}/magang.php?type=galeri`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const newCount = data.synced ?? 0;
    if (syncStatus) {
      syncStatus.style.display = 'block';
      if (newCount > 0) {
        syncStatus.style.color   = '#16a34a';
        syncStatus.innerHTML     = `<i class="fas fa-check-circle"></i> ${newCount} foto baru dari folder berhasil didaftarkan!`;
      } else {
        syncStatus.style.color   = '#6B7280';
        syncStatus.innerHTML     = `<i class="fas fa-info-circle"></i> Tidak ada foto baru — semua sudah terdaftar.`;
      }
      setTimeout(() => { syncStatus.style.display = 'none'; }, 5000);
    }

    // Refresh tampilan galeri
    allGaleri = data.data;
    const countEl = document.getElementById('galeriCount');
    const total   = data.total ?? allGaleri.length;
    if (countEl) countEl.textContent = `(${total} foto)`;
    renderGaleriGrid();
    if (newCount > 0) showToast(newCount + ' foto baru dari folder berhasil disinkronkan!');
  } catch (e) {
    showToast('Sync gagal: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync dari Folder'; }
  }
}

function renderGaleriGrid() {
  const grid = document.getElementById('adminGaleriGrid');
  if (!allGaleri.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:#9CA3AF;">
      <i class="fas fa-camera" style="font-size:40px;display:block;margin-bottom:12px;opacity:0.3;"></i>
      <p style="font-weight:600;">Belum ada foto di galeri.</p>
      <p style="font-size:12px;margin-top:4px;">Klik "Upload Foto" atau drag gambar ke area di atas.</p>
    </div>`;
    return;
  }
  grid.innerHTML = allGaleri.map(g => `
    <div class="admin-galeri-item" id="galItem_${g.id}">
      <img src="${escHtml(g.path)}" alt="${escHtml(g.caption||'')}" loading="lazy"
           onerror="this.src='images/news1.png'">
      <div class="admin-galeri-overlay">
        <div class="admin-galeri-caption">${escHtml(g.caption || 'Tanpa keterangan')}</div>
        <button class="admin-galeri-del" onclick="hapusGaleri(${g.id})" title="Hapus foto">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Upload galeri (multi-file)
async function uploadGaleriFiles(files) {
  if (!files || !files.length) return;
  const progress = document.getElementById('galeriUploadProgress');
  progress.style.display = 'block';
  let success = 0, fail = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progress.innerHTML = `<div style="font-size:13px;color:#1A3A6B;"><i class="fas fa-spinner fa-spin"></i> Mengupload ${i+1}/${files.length}: ${escHtml(file.name)}</div>`;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const res  = await fetch(`${API_BASE}/upload_magang.php`, { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (data.success) { success++; }
      else { fail++; showToast('Gagal upload ' + file.name + ': ' + data.message); }
    } catch (e) { fail++; showToast('Error: ' + e.message); }
  }

  progress.innerHTML = `<div style="font-size:13px;color:#16a34a;font-weight:600;"><i class="fas fa-check-circle"></i> Selesai: ${success} berhasil${fail>0?`, ${fail} gagal`:''}.</div>`;
  setTimeout(() => { progress.style.display = 'none'; progress.innerHTML = ''; }, 3000);

  // Reset file input
  document.getElementById('galeriFileInput').value = '';
  if (success > 0) loadGaleriData();
}

// Drag & drop support
function galeriDragOver(e) {
  e.preventDefault();
  document.getElementById('galeriUploadZone').style.borderColor = '#1A3A6B';
}
function galeriDrop(e) {
  e.preventDefault();
  document.getElementById('galeriUploadZone').style.borderColor = '';
  const files = e.dataTransfer.files;
  if (files && files.length) uploadGaleriFiles(files);
}

async function hapusGaleri(id) {
  openHapusMori('galeri', id, 'foto ini');
}

// ============================================================
// MORI — SHARED HAPUS MODAL
// ============================================================
let hapusMoriTarget = { type: '', id: 0 };

function openHapusMori(type, id, label) {
  hapusMoriTarget = { type, id };
  const typeLabel = { peserta: 'peserta', project: 'project', galeri: 'foto' };
  document.getElementById('hapusMoriText').innerHTML = `Yakin ingin menghapus <strong>${typeLabel[type]||type}</strong> "<em>${escHtml(label)}</em>"?`;
  document.getElementById('modalHapusMoriOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModalHapusMori() {
  document.getElementById('modalHapusMoriOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

async function konfirmasiHapusMori() {
  const { type, id } = hapusMoriTarget;
  if (!type || !id) return;
  const btn = document.getElementById('btnKonfirmasiHapusMori');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
  try {
    const res  = await fetch(`${API_BASE}/magang.php?type=${type}&id=${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Berhasil dihapus!');
      closeModalHapusMori();
      if (type === 'peserta') loadMagangData();
      if (type === 'project') loadProjectData();
      if (type === 'galeri')  loadGaleriData();
    } else {
      showToast('Gagal: ' + data.message);
    }
  } catch (e) { showToast('Error: ' + e.message); }
  finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash-alt"></i> Ya, Hapus';
  }
}

// ── PROFIL / TENTANG KAMI ─────────────────────────────────────

async function initProfil() {
  const select = document.getElementById('profilPageSelect');
  if (!select) return;
  try {
    const res = await fetch(`${API_BASE}/profil.php?action=list`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      select.innerHTML = '<option value="">-- Pilih Halaman --</option>';
      data.data.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.slug;
        opt.textContent = p.title + ' (' + p.slug + ')';
        select.appendChild(opt);
      });
    }
  } catch (e) { console.error('Gagal load list profil', e); }
}

async function loadProfilPage() {
  const slug = document.getElementById('profilPageSelect').value;
  const titleInput = document.getElementById('profilTitle');
  const subtitleInput = document.getElementById('profilSubtitle');
  const editor = document.getElementById('profilEditor');
  if (!slug) {
    titleInput.value = ''; subtitleInput.value = ''; editor.value = ''; return;
  }
  editor.value = 'Memuat...';
  try {
    const res = await fetch(`${API_BASE}/profil.php?action=get&slug=${slug}`);
    const data = await res.json();
    if (data.success) {
      titleInput.value = data.data.title;
      subtitleInput.value = data.data.subtitle;
      editor.value = data.data.content;
    } else { showToast(data.message); }
  } catch (e) { showToast('Gagal memuat halaman: ' + e.message); editor.value = ''; }
}

async function saveProfilPage() {
  const slug = document.getElementById('profilPageSelect').value;
  if (!slug) return showToast('Pilih halaman terlebih dahulu.');
  const title = document.getElementById('profilTitle').value;
  const subtitle = document.getElementById('profilSubtitle').value;
  const content = document.getElementById('profilEditor').value;
  try {
    const res = await fetch(`${API_BASE}/profil.php?action=update`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, title, subtitle, content })
    });
    const data = await res.json();
    showToast(data.message || (data.success ? 'Berhasil disimpan' : 'Gagal'));
  } catch (e) { showToast('Gagal menyimpan: ' + e.message); }
}

// ============================================
// LAPORAN TAHUNAN CRUD
// ============================================
async function loadLaporanData() {
  const tbody = document.getElementById('laporanTableBody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;"><i class="fas fa-spinner fa-spin"></i> Memuat...</td></tr>`;
  try {
    const res = await fetch('api/laporan_tahunan.php?action=list');
    const result = await res.json();
    if (result.success && result.data.length > 0) {
      tbody.innerHTML = result.data.map(item => `
        <tr>
          <td><b>${item.tahun}</b></td>
          <td>${item.judul}</td>
          <td style="font-size:12px;color:#64748b;">${item.deskripsi}</td>
          <td>${item.file_url ? `<a href="${item.file_url}" target="_blank" style="color:#1A3A6B;font-size:12px;"><i class="fas fa-file-pdf"></i> Lihat</a>` : '<span style="color:#94a3b8;font-size:12px;">-</span>'}</td>
          <td>
            <button class="btn-action edit" onclick="editLaporan(${item.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-action delete" onclick="deleteLaporan(${item.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#94a3b8;">Belum ada laporan. Klik "Tambah Laporan" untuk memulai.</td></tr>`;
    }
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:red;">Gagal memuat data.</td></tr>`;
  }
}

async function showLaporanForm(reset = true) {
  if (reset) {
    document.getElementById('laporanEditId').value = '';
    document.getElementById('laporanTahun').value = '';
    document.getElementById('laporanJudul').value = '';
    document.getElementById('laporanDeskripsi').value = '';
    document.getElementById('laporanFileUrl').value = '';
    if(document.getElementById('laporanPdfFile')) document.getElementById('laporanPdfFile').value = '';
    document.getElementById('laporanCoverUrl').value = '';
    document.getElementById('laporanFormTitle').textContent = 'Tambah Laporan Tahunan';
  }
  document.getElementById('laporanFormCard').style.display = 'block';
  document.getElementById('laporanFormCard').scrollIntoView({behavior:'smooth', block:'start'});
}

function hideLaporanForm() {
  document.getElementById('laporanFormCard').style.display = 'none';
}

async function editLaporan(id) {
  try {
    const res = await fetch('api/laporan_tahunan.php?action=list');
    const result = await res.json();
    const item = result.data.find(d => d.id == id);
    if (!item) return;
    document.getElementById('laporanEditId').value = item.id;
    document.getElementById('laporanTahun').value = item.tahun;
    document.getElementById('laporanJudul').value = item.judul;
    document.getElementById('laporanDeskripsi').value = item.deskripsi;
    document.getElementById('laporanFileUrl').value = item.file_url;
    document.getElementById('laporanCoverUrl').value = item.cover_url;
    document.getElementById('laporanFormTitle').textContent = 'Edit Laporan Tahunan';
    showLaporanForm(false);
  } catch(e) { alert('Gagal memuat data item.'); }
}

async function saveLaporan() {
  const id = document.getElementById('laporanEditId').value;
  const fileInput = document.getElementById('laporanPdfFile');
  
  let finalFileUrl = document.getElementById('laporanFileUrl').value.trim();

  if (!document.getElementById('laporanTahun').value.trim() || !document.getElementById('laporanJudul').value.trim()) {
    alert('Tahun dan Judul wajib diisi!');
    return;
  }

  // Handle file upload if selected
  if (fileInput && fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append('pdf_file', fileInput.files[0]);
    try {
      const uploadRes = await fetch('api/upload_laporan_pdf.php', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        finalFileUrl = uploadData.url;
      } else {
        alert('Gagal mengupload PDF: ' + uploadData.message);
        return;
      }
    } catch(e) {
      alert('Terjadi kesalahan saat upload PDF.');
      return;
    }
  }

  const body = {
    id: id ? parseInt(id) : null,
    tahun: document.getElementById('laporanTahun').value.trim(),
    judul: document.getElementById('laporanJudul').value.trim(),
    deskripsi: document.getElementById('laporanDeskripsi').value.trim(),
    file_url: finalFileUrl,
    cover_url: document.getElementById('laporanCoverUrl').value.trim()
  };

  const method = id ? 'PUT' : 'POST';
  const action = id ? 'update' : 'add';
  try {
    const res = await fetch(`api/laporan_tahunan.php?action=${action}`, {
      method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    const result = await res.json();
    if (result.success) {
      hideLaporanForm();
      loadLaporanData();
      showToast(id ? 'Laporan berhasil diperbarui!' : 'Laporan berhasil ditambahkan!');
    } else { alert('Gagal menyimpan data.'); }
  } catch(e) { alert('Terjadi kesalahan.'); }
}

async function deleteLaporan(id) {
  if (!confirm('Hapus laporan ini?')) return;
  try {
    const res = await fetch(`api/laporan_tahunan.php?action=delete&id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) { loadLaporanData(); showToast('Laporan berhasil dihapus!'); }
  } catch(e) { alert('Gagal menghapus.'); }
}
