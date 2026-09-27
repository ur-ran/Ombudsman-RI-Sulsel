-- ============================================================
-- database.sql - ORI (Ombudsman RI Sulsel)
-- Skema database + data publik (AMAN untuk GitHub)
--
-- DATA DIKOSONGKAN (sensitif, isi ulang setelah deploy):
--   admin_users     : buat akun baru via setup.php
--   magang_peserta  : input ulang via admin panel MORI
--   magang_galeri   : sinkron otomatis dari folder magang/
--   magang_project  : input ulang via admin panel MORI
--   youtube_cache   : otomatis di-fetch dari YouTube/Invidious
-- ============================================================

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 27 Sep 2026 pada 20.13
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ori_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `admin_users`
--

-- INSERT INTO `admin_users` dikosongkan (data sensitif/tidak perlu di-seed)

-- --------------------------------------------------------

--
-- Struktur dari tabel `berita`
--

CREATE TABLE `berita` (
  `id` int(11) NOT NULL,
  `judul` varchar(500) NOT NULL,
  `kategori` varchar(100) DEFAULT 'Berita',
  `tanggal` date NOT NULL,
  `status` enum('published','draft') DEFAULT 'published',
  `konten` text DEFAULT NULL,
  `gambar_path` varchar(500) DEFAULT '',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `berita`
--

INSERT INTO `berita` (`id`, `judul`, `kategori`, `tanggal`, `status`, `konten`, `gambar_path`, `created_at`, `updated_at`) VALUES
(1, 'Rapat Koordinasi di Kota Pare-Pare', 'Kegiatan', '2026-08-06', 'published', 'Ombudsman RI Perwakilan Sulawesi Selatan menggelar rapat koordinasi di Kota Pare-Pare untuk membahas peningkatan layanan publik.', 'images/news1.png', '2026-08-09 11:57:08', '2026-08-09 11:57:08'),
(2, 'Kunjungan ke Kantor Bupati Kab. Gowa', 'Kegiatan', '2026-08-04', 'published', 'Tim Ombudsman melakukan kunjungan kerja ke Kantor Bupati Kabupaten Gowa dalam rangka monitoring pelayanan publik.', 'images/news2.png', '2026-08-09 11:57:08', '2026-08-09 11:57:08'),
(3, 'Pembukaan Posko Pengaduan Masyarakat', 'Berita', '2026-08-02', 'published', 'Ombudsman membuka posko pengaduan masyarakat untuk mempermudah akses pelaporan dari warga Sulawesi Selatan.', 'images/news3.png', '2026-08-09 11:57:08', '2026-08-09 11:57:08'),
(4, 'Sosialisasi Pelayanan Publik di Sulsel', 'Berita', '2026-07-26', 'published', 'Kegiatan sosialisasi tentang hak-hak masyarakat dalam mendapatkan pelayanan publik yang baik di Sulawesi Selatan.', 'images/news1.png', '2026-08-09 11:57:08', '2026-08-09 11:57:08'),
(5, 'Rhana dan Ucang Rapat Koordinasi Lintas Instansi di Makassar', 'Kegiatan', '2026-08-09', 'published', 'Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar. Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar. \n\nOmbudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.\n\nOmbudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.\n\nOmbudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar. \n\n\nOmbudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.\n\n\n\nOmbudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.\n\nOmbudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.Ombudsman RI Sulsel menggelar rapat koordinasi lintas instansi untuk membahas peningkatan layanan publik di Kota Makassar.', 'uploads/berita_1786248997_cb02aa19.png', '2026-08-09 12:01:33', '2026-08-10 08:19:43'),
(6, 'judull', 'Berita', '2026-08-14', 'published', 'adkahckueca', 'uploads/berita_1786691395_e6907aa3.jpg', '2026-08-14 15:09:57', '2026-08-14 15:09:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `dashboard_stats`
--

CREATE TABLE `dashboard_stats` (
  `id` int(11) NOT NULL,
  `aduan` varchar(50) DEFAULT '',
  `capaian` varchar(100) DEFAULT '',
  `substansi` varchar(50) DEFAULT '',
  `target_persen` decimal(5,2) DEFAULT 54.33,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `dashboard_stats`
--

INSERT INTO `dashboard_stats` (`id`, `aduan`, `capaian`, `substansi`, `target_persen`, `updated_at`) VALUES
(1, '19898', '87,5%', '38', 67.87, '2026-08-24 19:41:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `magang_galeri`
--

CREATE TABLE `magang_galeri` (
  `id` int(11) NOT NULL,
  `path` varchar(500) NOT NULL,
  `caption` varchar(500) DEFAULT '',
  `urutan` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `magang_galeri`
--

-- INSERT INTO `magang_galeri` dikosongkan (data sensitif/tidak perlu di-seed)

-- --------------------------------------------------------

--
-- Struktur dari tabel `magang_peserta`
--

CREATE TABLE `magang_peserta` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `nim` varchar(50) DEFAULT '',
  `jurusan` varchar(255) DEFAULT '',
  `kampus` varchar(255) DEFAULT '',
  `kategori` enum('kampus','kemenaker','honor') DEFAULT 'kampus',
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `status` enum('aktif','alumni','honor','kemenaker','antrian') DEFAULT 'aktif',
  `foto` varchar(500) DEFAULT '',
  `catatan` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `magang_peserta`
--

-- INSERT INTO `magang_peserta` dikosongkan (data sensitif/tidak perlu di-seed)

-- --------------------------------------------------------

--
-- Struktur dari tabel `magang_project`
--

CREATE TABLE `magang_project` (
  `id` int(11) NOT NULL,
  `judul` varchar(500) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `peserta` varchar(500) DEFAULT '',
  `tanggal` date NOT NULL,
  `kategori` varchar(100) DEFAULT 'Riset',
  `file_path` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `magang_project`
--

-- INSERT INTO `magang_project` dikosongkan (data sensitif/tidak perlu di-seed)

-- --------------------------------------------------------

--
-- Struktur dari tabel `profil_pages`
--

CREATE TABLE `profil_pages` (
  `id` int(11) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(500) NOT NULL,
  `content` longtext NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `profil_pages`
--

INSERT INTO `profil_pages` (`id`, `slug`, `title`, `subtitle`, `content`, `updated_at`) VALUES
(1, 'sekilas', 'Sekilas Ombudsman', 'Sejarah dan sekilas tentang kiprah Ombudsman Republik Indonesia', '<h3>Sejarah Singkat</h3>\n      <p>Ombudsman Republik Indonesia (ORI) didirikan untuk meningkatkan pelayanan publik dan membantu menciptakan pemerintahan yang bersih dan bebas korupsi, kolusi, dan nepotisme. Ombudsman RI dibentuk melalui Undang-Undang Nomor 37 Tahun 2008 tentang Ombudsman Republik Indonesia.</p>\n      <p>Lembaga ini berfungsi mengawasi penyelenggaraan pelayanan publik yang diselenggarakan oleh Penyelenggara Negara dan Pemerintahan baik di pusat maupun di daerah, termasuk yang diselenggarakan oleh Badan Usaha Milik Negara, Badan Usaha Milik Daerah, dan Badan Hukum Milik Negara.</p>\n      \n      <h3>Perwakilan Sulawesi Selatan</h3>\n      <p>Ombudsman RI Perwakilan Sulawesi Selatan hadir untuk mendekatkan pelayanan dan pengawasan pelayanan publik di wilayah Provinsi Sulawesi Selatan. Berkantor di Makassar, perwakilan ini secara aktif menerima laporan dari masyarakat terkait dugaan maladministrasi dan menindaklanjutinya secara imparsial dan independen.</p>', '2026-08-18 11:56:50'),
(2, 'visi-misi', 'Visi dan Misi', 'Arah dan tujuan utama penyelenggaraan pengawasan pelayanan publik oleh Ombudsman Republik Indonesia', '<div class=\"visi-misi-box\" style=\"text-align: center; border-top: 4px solid var(--orange);\">\n        <h4 style=\"justify-content: center; font-size: 24px; margin-bottom: 20px;\">VISI</h4>\n        <p style=\"font-size: 20px; font-weight: 600; color: var(--blue-navy); line-height: 1.6; margin-bottom: 0;\">\"Menjadi Lembaga Pengawas Pelayanan Publik yang Efektif, Dipercaya, dan Berkeadilan Guna Mewujudkan Pelayanan Publik yang Berkualitas\"</p>\n      </div>\n\n      <div class=\"visi-misi-box\">\n        <h4><i class=\"fas fa-bullseye\"></i> MISI</h4>\n        <ol style=\"font-size: 16px; margin-left: 10px; margin-bottom: 0;\">\n          <li>Mewujudkan Pengawasan Pelayanan Publik yang Inklusif dan Partisipatif.</li>\n          <li>Mewujudkan Kepatuhan Penyelenggaraan Pelayanan Publik terhadap Hasil Pengawasan Ombudsman Republik Indonesia.</li>\n          <li>Mewujudkan Kelembagaan yang Kuat, Kapabel, dan Adaptif.</li>\n        </ol>\n      </div>\n      \n      <p style=\"text-align: center; margin-top: 40px; font-style: italic; color: var(--text-mid);\">\n        Visi dan Misi ini menjadi pedoman utama seluruh jajaran Ombudsman Republik Indonesia Perwakilan Sulawesi Selatan dalam melaksanakan tugas pengawasan dan pelayanan publik.\n      </p>', '2026-08-18 11:56:50'),
(3, 'tugas-fungsi', 'Tugas & Fungsi', 'Tugas Pokok, Fungsi, dan Wewenang Ombudsman Republik Indonesia', '<h3>Fungsi</h3>\n      <p>Ombudsman berfungsi mengawasi penyelenggaraan Pelayanan Publik yang diselenggarakan oleh Penyelenggara Negara dan Pemerintahan baik di pusat maupun di derah termasuk yang diselenggarakan oleh BUMN, BUMD, dan BHMN serta badan swasta atau perseorangan yang diberi tugas menyelenggarakan pelayanan publik tertentu yang sebagian atau seluruh dananya bersumber dari anggaran pendapatan dan belanja negara dan/atau anggaran pendapatan dan belanja daerah.</p>\n      \n      <h3>Tugas Ombudsman</h3>\n      <ul>\n        <li>Menerima Laporan atas dugaan Maladministrasi dalam penyelenggaraan Pelayanan Publik;</li>\n        <li>Melakukan pemeriksaan substantif atas Laporan;</li>\n        <li>Menindaklanjuti Laporan yang tercakup dalam ruang lingkup kewenangan Ombudsman;</li>\n        <li>Melakukan investigasi atas prakarsa sendiri terhadap dugaan Maladministrasi dalam penyelenggaraan Pelayanan Publik;</li>\n        <li>Melakukan koordinasi dan kerja sama dengan lembaga negara atau lembaga pemerintahan lainnya;</li>\n        <li>Membangun jaringan kerja.</li>\n      </ul>', '2026-08-18 11:56:50'),
(4, 'maklumat', 'Maklumat Pelayanan', 'Komitmen Ombudsman RI dalam Memberikan Pelayanan', '<div class=\"visi-misi-box\" style=\"text-align: center; border-left: 4px solid var(--orange); border-right: 4px solid var(--orange);\">\n        <h4 style=\"justify-content: center; font-size: 24px; margin-bottom: 20px;\">MAKLUMAT PELAYANAN</h4>\n        <p style=\"font-size: 18px; font-weight: 500; color: var(--blue-navy); line-height: 1.8;\">\"Kami berjanji dan sanggup menyelenggarakan pelayanan sesuai dengan standar pelayanan yang telah ditetapkan dan apabila tidak menepati janji, kami siap menerima sanksi sesuai ketentuan peraturan perundang-undangan.\"</p>\n      </div>', '2026-08-18 11:56:50'),
(5, 'spip', 'SPIP', 'Sistem Pengendalian Intern Pemerintah di Lingkungan Ombudsman RI', '<h3>Tentang SPIP</h3>\n      <p>Sistem Pengendalian Intern Pemerintah (SPIP) merupakan sistem pengendalian yang diselenggarakan secara menyeluruh di lingkungan pemerintah pusat dan daerah untuk memberikan keyakinan memadai bagi tercapainya efektivitas dan efisiensi pencapaian tujuan penyelenggaraan pemerintahan negara, keandalan pelaporan keuangan, pengamanan aset negara, dan ketaatan terhadap peraturan perundang-undangan.</p>\n      <p>Penerapan SPIP di Ombudsman RI bertujuan untuk mewujudkan tata kelola kelembagaan yang bersih, transparan, dan akuntabel.</p>', '2026-08-18 11:56:50'),
(6, 'elhkpn', 'e-LHKPN', 'Laporan Harta Kekayaan Penyelenggara Negara', '<div style=\"text-align: center;\">\n        <i class=\"fas fa-file-invoice-dollar\" style=\"font-size: 60px; color: var(--orange); margin-bottom: 20px;\"></i>\n        <h3>Laporan Harta Kekayaan Penyelenggara Negara (LHKPN)</h3>\n        <p style=\"max-width: 600px; margin: 0 auto 30px;\">Sebagai wujud transparansi dan akuntabilitas penyelenggara negara, Insan Ombudsman RI secara rutin melaporkan harta kekayaan melalui sistem e-LHKPN yang dikelola oleh Komisi Pemberantasan Korupsi (KPK).</p>\n        <a href=\"https://elhkpn.kpk.go.id/\" target=\"_blank\" rel=\"noopener\" style=\"display: inline-block; padding: 12px 30px; background: var(--blue-navy); color: white; border-radius: 8px; text-decoration: none; font-weight: bold; transition: 0.3s;\">Kunjungi Portal e-LHKPN KPK</a>\n      </div>', '2026-08-18 11:56:50'),
(7, 'pimpinan', 'Profil Pimpinan', 'Pimpinan Ombudsman RI Perwakilan Sulawesi Selatan', '<style>\n  .profile-container {\n    max-width: 1000px;\n    margin: 40px auto;\n    background: #ffffff;\n    border-radius: 20px;\n    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);\n    display: flex;\n    overflow: hidden;\n    position: relative;\n    border: 1px solid #f0f4f8;\n  }\n  .profile-sidebar {\n    width: 350px;\n    background: linear-gradient(135deg, #1A3A6B 0%, #102a50 100%);\n    color: #fff;\n    padding: 40px 30px;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    text-align: center;\n    position: relative;\n  }\n  .profile-sidebar::after {\n    content: \"\";\n    position: absolute;\n    bottom: -50px;\n    right: -50px;\n    width: 200px;\n    height: 200px;\n    background: rgba(255, 255, 255, 0.05);\n    border-radius: 50%;\n  }\n  .profile-img-box {\n    width: 200px;\n    height: 200px;\n    border-radius: 50%;\n    border: 5px solid rgba(255, 255, 255, 0.2);\n    margin-bottom: 25px;\n    overflow: hidden;\n    box-shadow: 0 10px 25px rgba(0,0,0,0.2);\n    background: #fff;\n  }\n  .profile-img-box img {\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n  }\n  .profile-name {\n    font-size: 24px;\n    font-weight: 800;\n    margin-bottom: 8px;\n    line-height: 1.3;\n  }\n  .profile-role {\n    font-size: 14px;\n    font-weight: 600;\n    color: #E8401C;\n    background: rgba(255,255,255,0.9);\n    padding: 8px 16px;\n    border-radius: 50px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    display: inline-block;\n  }\n  .profile-main {\n    flex: 1;\n    padding: 40px 50px;\n    background: #fff;\n  }\n  .info-grid {\n    display: grid;\n    grid-template-columns: repeat(2, 1fr);\n    gap: 25px;\n    margin-bottom: 35px;\n  }\n  .info-item {\n    background: #f8fafc;\n    padding: 20px;\n    border-radius: 12px;\n    border-left: 4px solid #1A3A6B;\n    transition: transform 0.2s, box-shadow 0.2s;\n  }\n  .info-item:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 8px 20px rgba(0,0,0,0.05);\n  }\n  .info-item h4 {\n    font-size: 13px;\n    color: #64748b;\n    text-transform: uppercase;\n    font-weight: 700;\n    margin-bottom: 5px;\n    letter-spacing: 0.5px;\n  }\n  .info-item p {\n    font-size: 15px;\n    color: #0f172a;\n    font-weight: 600;\n    margin: 0;\n    line-height: 1.4;\n  }\n  .info-item.orange-border {\n    border-left-color: #E8401C;\n  }\n  .profile-bio h3 {\n    font-size: 22px;\n    font-weight: 800;\n    color: #1A3A6B;\n    margin-bottom: 20px;\n    display: flex;\n    align-items: center;\n  }\n  .profile-bio h3 i {\n    margin-right: 10px;\n    color: #E8401C;\n  }\n  .profile-bio p {\n    font-size: 15.5px;\n    line-height: 1.8;\n    color: #475569;\n    margin-bottom: 15px;\n    text-align: justify;\n  }\n  \n  @media (max-width: 900px) {\n    .profile-container {\n      flex-direction: column;\n    }\n    .profile-sidebar {\n      width: 100%;\n      padding: 40px 20px;\n    }\n    .profile-main {\n      padding: 30px 20px;\n    }\n    .info-grid {\n      grid-template-columns: 1fr;\n    }\n  }\n</style>\n\n<div class=\"profile-container\">\n  <div class=\"profile-sidebar\">\n    <div class=\"profile-img-box\">\n      <img src=\"images/ismu.jpeg\" alt=\"Dr. Ismu Iskandar\">\n    </div>\n    <div class=\"profile-name\">Dr. Ismu Iskandar,<br>S.T., M.M.</div>\n    <div style=\"margin-top: 15px;\">\n        <span class=\"profile-role\">Kepala Perwakilan</span>\n    </div>\n  </div>\n  \n  <div class=\"profile-main\">\n    <div class=\"info-grid\">\n      <div class=\"info-item\" style=\"grid-column: span 2;\">\n        <h4>Jabatan</h4>\n        <p>Kepala Perwakilan Ombudsman Republik Indonesia Perwakilan Sulawesi Selatan</p>\n      </div>\n      <div class=\"info-item orange-border\">\n        <h4>Pendidikan</h4>\n        <p>S3 Doktor Ilmu Administrasi Publik</p>\n      </div>\n      <div class=\"info-item\">\n        <h4>Agama</h4>\n        <p>Islam</p>\n      </div>\n    </div>\n    \n    <div class=\"profile-bio\">\n      <h3><i class=\"fas fa-user-circle\"></i> Profil Singkat</h3>\n      <p>\n        Dr. Ismu Iskandar, S.T., M.M. merupakan Kepala Ombudsman Republik Indonesia Perwakilan Sulawesi Selatan. Ia memiliki latar belakang pendidikan di bidang teknik, manajemen, dan administrasi publik. Ia menyelesaikan pendidikan Sarjana Teknik Arsitektur di Universitas Muslim Indonesia pada tahun 2004, kemudian memperoleh gelar Magister Manajemen dengan konsentrasi Manajemen Sumber Daya Manusia pada tahun 2017. Selanjutnya, ia menyelesaikan pendidikan Doktor (S3) Ilmu Administrasi Publik di Universitas Negeri Makassar pada tahun 2025.\n      </p>\n    </div>\n  </div>\n</div>\r\n', '2026-08-18 11:56:50'),
(8, 'struktur', 'Struktur Organisasi', 'Ombudsman Republik Indonesia Perwakilan Sulawesi Selatan', '<div class=\"org-inner\">\n      <!-- Flexbox Org Chart -->\n      <div class=\"flex-tree\">\n        <div class=\"flex-node\">\n          \n          <!-- KEPALA PERWAKILAN -->\n          <div class=\"org-card head\">\n            <div class=\"card-title\">Kepala Perwakilan</div>\n            <div class=\"card-leader\">\n              <i class=\"fas fa-user-tie\" style=\"margin-right:8px; opacity:0.8;\"></i> \n              Ismu Iskandar\n            </div>\n          </div>\n\n          <div class=\"flex-children\">\n            \n            <!-- BRANCH: KEASISTENAN -->\n            <div class=\"flex-child\" style=\"flex: 1;\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"flex-node\">\n                <div class=\"group-label\">KEASISTENAN</div>\n                \n                <div class=\"flex-children\">\n                  <!-- Node: Penerimaan & Verifikasi -->\n                  <div class=\"flex-child\">\n                    <div class=\"flex-child-connector\"></div>\n                    <div class=\"org-card assistant\">\n                      <div class=\"card-title\">Penerimaan & Verifikasi Laporan</div>\n                      <div class=\"card-leader\">Herwin Gunawan</div>\n                      <div class=\"card-members\">\n                        <div class=\"member-badge\">Irawati Muin</div>\n                        <div class=\"member-badge\">Andi Gustiawati</div>\n                        <div class=\"member-badge\">Ahmad Ryandi Nugraha</div>\n                      </div>\n                    </div>\n                  </div>\n\n                  <!-- Node: Pemeriksaan Laporan -->\n                  <div class=\"flex-child\">\n                    <div class=\"flex-child-connector\"></div>\n                    <div class=\"org-card assistant\">\n                      <div class=\"card-title\">Pemeriksaan Laporan</div>\n                      <div class=\"card-leader\">Andi Anas Chaerul M</div>\n                      <div class=\"card-members\">\n                        <div class=\"member-badge\">St. Dwi Adiyah Pratiwi</div>\n                        <div class=\"member-badge\">Andi Ibrahim</div>\n                        <div class=\"member-badge\">Sekarwuni Manfaati</div>\n                        <div class=\"member-badge\">A. Puji Dian Lestari</div>\n                        <div class=\"member-badge\">Ridwan</div>\n                        <div class=\"member-badge\">Suci Indahsari</div>\n                        <div class=\"member-badge\">Muh. Ferdi</div>\n                      </div>\n                    </div>\n                  </div>\n\n                  <!-- Node: Pencegahan Maladministrasi -->\n                  <div class=\"flex-child\">\n                    <div class=\"flex-child-connector\"></div>\n                    <div class=\"org-card assistant\">\n                      <div class=\"card-title\">Pencegahan Maladministrasi</div>\n                      <div class=\"card-leader\">Aswiwin Sirua</div>\n                      <div class=\"card-members\">\n                        <div class=\"member-badge\">Hasrul Eka Putra</div>\n                        <div class=\"member-badge\">Inris Winni</div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n\n              </div>\n            </div>\n\n                        <!-- BRANCH: KESEKERTARIATAN -->\n            <div class=\"flex-child\" style=\"flex: 1;\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"flex-node\">\n                <div class=\"group-label orange\">KESEKERTARIATAN</div>\n                \n                <div class=\"flex-children\">\n                  <!-- Node: SDM & Umum -->\n                  <div class=\"flex-child\">\n                    <div class=\"flex-child-connector\"></div>\n                    <div class=\"org-card secretary\">\n                      <div class=\"card-title sec\">Sumber Daya Manusia & Umum</div>\n                      <div class=\"card-members\" style=\"margin-top:10px;\">\n                        <div class=\"member-badge\">Muh. Resha Irawan</div>\n                        <div class=\"member-badge\">Anita otoluwa</div>\n                        <div class=\"member-badge\">Shubhan</div>\n                      </div>\n                    </div>\n                  </div>\n\n                  <!-- Node: Perencanaan & Keuangan -->\n                  <div class=\"flex-child\">\n                    <div class=\"flex-child-connector\"></div>\n                    <div class=\"org-card secretary\">\n                      <div class=\"card-title sec\">Perencanaan & Keuangan</div>\n                      <div class=\"card-members\" style=\"margin-top:10px;\">\n                        <div class=\"member-badge\">Amri Syam</div>\n                      </div>\n                    </div>\n                  </div>\n\n                  <!-- Node: Humas & TI -->\n                  <div class=\"flex-child\">\n                    <div class=\"flex-child-connector\"></div>\n                    <div class=\"org-card secretary\">\n                      <div class=\"card-title sec\">Humas & Teknologi Informasi</div>\n                      <div class=\"card-members\" style=\"margin-top:10px;\">\n                        <div class=\"member-badge\">Arwifan Arsyad</div>\n                        <div class=\"member-badge\">Salima Safaryani Putuhena</div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n\n              </div>\n            </div>\n\n            \n\n              </div>\n            </div>\n\n          </div>\n        </div>\n      </div>\n\n      \n\n                  <!-- TENAGA PENDUKUNG AT THE BOTTOM -->\n      <div class=\"flex-tree\" style=\"margin-top: -30px; position:relative; z-index:1; padding-bottom: 50px;\" id=\"tp-bottom\">\n        <style>\n          #tp-bottom .org-card { border-top: 4px solid #10b981; min-width: 120px; padding: 15px 10px; }\n          #tp-bottom .card-title { color:#10b981; font-size:12px; margin-bottom:5px; }\n          #tp-bottom .card-leader { font-size:13px; padding: 5px; margin:0; border:none; background:transparent; font-weight:700; }\n          #tp-bottom .flex-child::before, #tp-bottom .flex-child::after { background-color: #10b981; }\n          #tp-bottom .flex-child-connector { background-color: #10b981; }\n          #tp-bottom .flex-children::before { background-color: #10b981; }\n        </style>\n        \n        <div class=\"flex-node\" style=\"position:relative; overflow: visible;\">\n          \n          \n          \n          <div class=\"group-label\" style=\"background: #10b981; box-shadow: 0 4px 15px rgba(16,185,129,0.3); margin-bottom: 0;\">TENAGA PENDUKUNG</div>\n          \n          <div class=\"flex-children\" style=\"justify-content: center; padding-top: 20px;\">\n            <div class=\"flex-child\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"org-card\">\n                <div class=\"card-title\">Sekuriti</div>\n                <div class=\"card-leader\">Rahmat Liwang</div>\n              </div>\n            </div>\n            \n            <div class=\"flex-child\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"org-card\">\n                <div class=\"card-title\">Sekuriti</div>\n                <div class=\"card-leader\">Abrianto</div>\n              </div>\n            </div>\n\n            <div class=\"flex-child\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"org-card\">\n                <div class=\"card-title\">Sekuriti</div>\n                <div class=\"card-leader\">Nurdin</div>\n              </div>\n            </div>\n\n            <div class=\"flex-child\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"org-card\">\n                <div class=\"card-title\">Driver</div>\n                <div class=\"card-leader\">A. Riyal Qa\'bah</div>\n              </div>\n            </div>\n\n            <div class=\"flex-child\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"org-card\">\n                <div class=\"card-title\">Office Boy</div>\n                <div class=\"card-leader\">Marsuki Saleh</div>\n              </div>\n            </div>\n\n            <div class=\"flex-child\">\n              <div class=\"flex-child-connector\"></div>\n              <div class=\"org-card\">\n                <div class=\"card-title\">Office Boy</div>\n                <div class=\"card-leader\">Muh. Rajid</div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n      \n      <!-- COMPOSITION STATS -->\n      <div class=\"stats-comp\">\n        <div class=\"comp-card\">\n          <div class=\"comp-val\">1</div>\n          <div class=\"comp-label\">Kaper</div>\n        </div>\n        <div class=\"comp-card\">\n          <div class=\"comp-val\">15</div>\n          <div class=\"comp-label\">Asisten</div>\n        </div>\n        <div class=\"comp-card\">\n          <div class=\"comp-val\">6</div>\n          <div class=\"comp-label\">ASN</div>\n        </div>\n        <div class=\"comp-card\">\n          <div class=\"comp-val\">6</div>\n          <div class=\"comp-label\">TP</div>\n        </div>\n        <div class=\"comp-card highlight\">\n          <div class=\"comp-val\">28</div>\n          <div class=\"comp-label\">Total Personel</div>\n        </div>\n      </div>', '2026-08-18 12:06:51');

-- --------------------------------------------------------

--
-- Struktur dari tabel `youtube_cache`
--

CREATE TABLE `youtube_cache` (
  `id` int(11) NOT NULL,
  `video_id` varchar(50) NOT NULL,
  `judul` varchar(500) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `cached_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `youtube_cache`
--

-- INSERT INTO `youtube_cache` dikosongkan (data sensitif/tidak perlu di-seed)

-- --------------------------------------------------------

--
-- Struktur dari tabel `youtube_popular_cache`
--

CREATE TABLE `youtube_popular_cache` (
  `id` int(11) NOT NULL,
  `video_id` varchar(50) NOT NULL,
  `judul` varchar(500) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `cached_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `youtube_popular_cache`
--

-- INSERT INTO `youtube_popular_cache` dikosongkan (data sensitif/tidak perlu di-seed)

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `berita`
--
ALTER TABLE `berita`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `dashboard_stats`
--
ALTER TABLE `dashboard_stats`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `magang_galeri`
--
ALTER TABLE `magang_galeri`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `magang_peserta`
--
ALTER TABLE `magang_peserta`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `magang_project`
--
ALTER TABLE `magang_project`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `profil_pages`
--
ALTER TABLE `profil_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indeks untuk tabel `youtube_cache`
--
ALTER TABLE `youtube_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `video_id` (`video_id`);

--
-- Indeks untuk tabel `youtube_popular_cache`
--
ALTER TABLE `youtube_popular_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `video_id` (`video_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `berita`
--
ALTER TABLE `berita`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `dashboard_stats`
--
ALTER TABLE `dashboard_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `magang_galeri`
--
ALTER TABLE `magang_galeri`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT untuk tabel `magang_peserta`
--
ALTER TABLE `magang_peserta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `magang_project`
--
ALTER TABLE `magang_project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `profil_pages`
--
ALTER TABLE `profil_pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `youtube_cache`
--
ALTER TABLE `youtube_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT untuk tabel `youtube_popular_cache`
--
ALTER TABLE `youtube_popular_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
