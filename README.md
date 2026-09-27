# 🏛️ Sistem Informasi Ombudsman RI Sulawesi Selatan

Website resmi **Ombudsman Republik Indonesia Perwakilan Sulawesi Selatan** — platform informasi publik yang menampilkan profil lembaga, berita, galeri kegiatan, podcast, regulasi, dan sistem manajemen magang internal (MORI).

> Dibangun dengan PHP + MySQL + Vanilla HTML/CSS/JS, berjalan di lingkungan XAMPP (localhost).

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🏠 **Beranda** | Hero section, statistik, berita terkini, YouTube embed |
| 📰 **Berita & Kegiatan** | CMS berita dinamis dengan admin panel |
| 🎙️ **Podcast SIMAK** | Embed video podcast dari YouTube channel ORI Sulsel |
| 📋 **Profil Lembaga** | Sekilas, Visi-Misi, Tugas & Fungsi, Pimpinan, Struktur Organisasi |
| 📁 **Laporan Tahunan** | Unduh dokumen laporan tahunan dalam format PDF |
| 🎓 **MORI** | Sistem manajemen magang internal (peserta, project, galeri) |
| 🔐 **Admin Panel** | Dashboard admin untuk kelola konten dan data magang |
| 📊 **Regulasi** | Daftar regulasi dan peraturan terkait Ombudsman |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend**: PHP 8.x (REST API)
- **Database**: MySQL / MariaDB
- **Server**: Apache (via XAMPP)
- **Font**: Inter (Google Fonts)
- **Icon**: Font Awesome 6

---

## 📁 Struktur Folder

```
ORI/
├── api/                    # REST API endpoints (PHP)
│   ├── auth.php            # Login / logout / session
│   ├── berita.php          # CRUD berita
│   ├── db.php              # Koneksi database (baca .env)
│   ├── magang.php          # API MORI (peserta, project, galeri)
│   ├── profil.php          # Halaman profil lembaga
│   ├── stats.php           # Statistik dashboard
│   ├── upload.php          # Upload gambar berita
│   ├── upload_laporan_pdf.php
│   ├── upload_magang.php
│   ├── youtube.php         # Cache video YouTube via Invidious
│   └── youtube_popular.php
├── data/
│   └── laporan_tahunan.json
├── images/                 # Aset gambar statis
├── uploads/                # [diabaikan git] Upload file pengguna
├── magang/                 # [diabaikan git] Foto kegiatan magang
├── admin.html              # Halaman admin panel
├── index.html              # Beranda
├── mori.html               # Halaman MORI (Magang ORI)
├── berita.html             # Daftar berita
├── berita-detail.html      # Detail berita
├── galeri.html             # Galeri foto
├── podcast.html            # Halaman podcast
├── regulasi.html           # Daftar regulasi
├── laporan-tahunan.html    # Laporan tahunan
├── struktur.html           # Struktur organisasi
├── style.css               # CSS utama
├── admin.css               # CSS admin panel
├── app.js                  # JavaScript utama
├── admin.js                # JavaScript admin
├── database.sql            # Skema DB + data publik (aman untuk GitHub)
├── .env.example            # Template konfigurasi environment
└── .htaccess
```

---

## 🚀 Cara Setup Lokal

### Prasyarat
- [XAMPP](https://www.apachefriends.org/) (PHP 8.x + MySQL)
- Git

### Langkah-langkah

**1. Clone repository**
```bash
git clone https://github.com/USERNAME/REPO-NAME.git C:/xampp/htdocs/ORI
```

**2. Import database**

Buka phpMyAdmin → buat database `ori_db` → import file `database.sql`:
```bash
# Atau via command line:
mysql -u root ori_db < database.sql
```

**3. (Opsional) Konfigurasi environment**

Jika nama database/user MySQL Anda berbeda dari default XAMPP:
```bash
# Salin template
cp .env.example .env

# Edit sesuai konfigurasi Anda
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=ori_db
```
> Jika tidak ada file `.env`, sistem otomatis pakai konfigurasi default XAMPP (`root`, tanpa password).

**4. Buat akun admin**

Jalankan setup di browser:
```
http://localhost/ORI/setup.php
```
> ⚠️ Hapus `setup.php` setelah akun admin berhasil dibuat!

**5. Akses website**
```
http://localhost/ORI/
```

Admin panel:
```
http://localhost/ORI/admin.html
```

---

## 🔒 Data yang Tidak Di-push ke GitHub

File dan folder berikut dikecualikan melalui `.gitignore` karena berisi data pribadi atau terlalu besar:

| Dikecualikan | Alasan |
|---|---|
| `ori_db (2).sql` | Berisi data nyata peserta magang (nama, NIM) |
| `magang/` | 130+ foto JPG kegiatan (~250MB) |
| `uploads/` | Foto & PDF yang diupload pengguna |
| `*.sql` (selain `database.sql`) | File dump mentah phpMyAdmin |
| `.env` | Kredensial database lokal |

---

## 📬 Kontak

**Ombudsman RI Perwakilan Sulawesi Selatan**
- 🌐 Website: [ombudsman.go.id](https://www.ombudsman.go.id)
- 📱 WA Pengaduan: [wa.me/628112363737](https://wa.me/628112363737)
- 📧 Email: pengaduan.sulsel@ombudsman.go.id
- 📸 Instagram: [@ombudsman137sulsel](https://www.instagram.com/ombudsman137sulsel/)
- 📘 Facebook: [ORIsulsel](https://www.facebook.com/ORIsulsel)

---

<p align="center">
  Dibuat dengan ❤️ untuk pelayanan publik yang lebih baik di Sulawesi Selatan
</p>
