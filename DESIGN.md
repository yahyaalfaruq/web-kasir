# DESIGN.md - LokaNota POS (Sistem Kasir & Buku Nota)

## Design Read
Reading this as: Point of Sale (POS) & Store Register Web Application (LokaNota POS) for bakery, coffee shop, and UMKM cashiers, in a warm tactile bakery-register & editorial ledger style, dial ENERGY 2 / RHYTHM 3 / MOTION 1.

## Brand Identity & Direction
- **Product Name**: LokaNota POS
- **Subtitle**: Meja Kasir & Buku Nota Kedai
- **Customizable Store Identity**: Pengguna dapat mengubah Nama Kedai, Slogan Nota, dan Nama Petugas/Pemilik langsung dari menu **Pengaturan Toko** di dalam aplikasi.
- **Target Audience**: Kasir kedai kopi/bakery dan pemilik usaha yang membutuhkan antarmuka kasir yang hangat, cepat dioperasikan, dan memiliki karakter khas buku nota fisik (bukan template SaaS/admin generik).

## Three Dials (Part 3)
- **ENERGY**: `2 (Balanced)` - Tipografi tegas dengan aksen warna sangrai hangat (*Artisan Amber/Terracotta*) di atas latar kertas krem hangat (Mode Terang) atau espresso pekat (Mode Gelap).
- **RHYTHM**: `3 (Asymmetric, mixed compositions)` - Halaman masuk menggunakan komposisi **Split-Screen Asimetris** (Papan Informasi Shift & Katalog di kiri, Formulir Buka Shift di kanan) yang berbeda total dari kartu tengah generik; ruang kerja utama menggunakan **Bilah Komando Atas (Top Command Deck)** yang dipadukan dengan meja katalog dan lembar nota termal di sisi kanan.
- **MOTION**: `1 (Hover & focus states only)` - Tanpa animasi dekoratif berulang agar alur transaksi kasir tetap sigap; mematuhi `prefers-reduced-motion: reduce`.

## Color System (R-25, R-29: 2 Core Colors + 1 Deliberate Accent)
1. **Core 1 - Warm Paper & Espresso Surface**:
   - Light: `#faf8f5` (latar kertas hangat), `#ffffff` (permukaan kartu & lembar nota), `#e7e5e4` (garis batas stone).
   - Dark: `#12100e` (latar espresso gelap), `#1c1917` (permukaan kartu & lembar nota), `#292524` (garis batas stone gelap).
2. **Core 2 - Charcoal & Stone Ink**:
   - Light: `#1c1917` (teks utama, rasio kontras > 15:1), `#57534e` (teks sekunder, rasio kontras > 7:1).
   - Dark: `#fafaf9` (teks utama, rasio kontras > 15:1), `#d6d3d1` (teks sekunder, rasio kontras > 10:1).
3. **Deliberate Accent - Artisan Roast Terracotta (`#b45309` / `#d97706`)**:
   - Light: `#b45309` (`amber-700`, hover `#92400e`) dengan teks putih `#ffffff` (rasio kontras 5.02:1, lolos WCAG AA).
   - Dark: `#b45309` / `#92400e` dengan teks putih `#ffffff` (rasio kontras > 5.0:1, lolos WCAG AA) dan highlight teks `#fbbf24` di atas latar gelap.
   - Digunakan secara terfokus pada tombol Buka Shift, tombol Tagih & Cetak Nota, serta indikator menu aktif.

## One-Line Reasons for Major Decisions (R-31)
- **Why this color palette?**: Perpaduan warna kertas hangat (`stone`) dan aksen sangrai (`amber-700`) mencerminkan identitas kedai bakery/kopi sekaligus menjaga kontras bacaan nominal Rupiah.
- **Why this layout?**: Halaman login menggunakan tata letak belah dua (*split-screen*) antara papan status shift toko dan meja autentikasi, sedangkan ruang kerja menggunakan navigasi komando atas agar katalog dan kertas nota memiliki ruang lebar penuh.
- **Why this typography?**: Huruf sans-serif tegas untuk nama menu dipadukan dengan `tabular-nums` monospasi pada kolom harga, nomor nota, dan kembalian agar perhitungan angka sejajar rapi.
- **Why this spacing?**: Grid terstruktur dengan celah `16px` pada katalog dan `24px` antar kolom utama menjaga kepadatan informasi tanpa membuat tombol saling berhimpitan (target sentuh minimal `44px`).
- **Why use cards for catalog items?**: Kartu katalog menyajikan foto produk, lencana stok, kode barang, dan tombol tambah dalam satu bidang pandang agar kasir cepat mengenali pesanan.
- **Why use inline SVG icons?**: Ikon garis fungsional digunakan hanya sebagai penanda aksi navigasi dan kontrol form tanpa dekorasi emoji atau ikon AI generik.
- **Why use a stamped nota motif (Identity Motif)?**: Kepala nota bergaya cap kedai dengan penomoran seri `NOTA-YYYYMMDD-XXXX` dan garis sobekan struk memberikan identitas asli aplikasi kasir lokal.
