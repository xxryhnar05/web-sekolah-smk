Ini adalah proyek [Next.js](https://nextjs.org) yang dibuat menggunakan [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Memulai

Jalankan server pengembangan:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

Anda dapat mulai mengubah halaman dengan mengedit `app/page.tsx`. Halaman akan diperbarui otomatis saat file tersebut diubah.

Proyek ini menggunakan [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) untuk mengoptimalkan dan memuat [Geist](https://vercel.com/font), keluarga font dari Vercel, secara otomatis.

## Pelajari Lebih Lanjut

Untuk mempelajari Next.js lebih lanjut, kunjungi sumber berikut:

- [Dokumentasi Next.js](https://nextjs.org/docs) - pelajari fitur dan API Next.js.
- [Belajar Next.js](https://nextjs.org/learn) - tutorial Next.js interaktif.

Anda juga dapat mengunjungi [repositori Next.js di GitHub](https://github.com/vercel/next.js). Masukan dan kontribusi Anda sangat dipersilakan!

## Checklist data untuk deployment

Atur variabel lingkungan berikut di platform deployment sebelum melakukan build dan menjalankan aplikasi:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY` (hanya untuk sisi server)

Halaman beranda mengambil konten publik dari Supabase menggunakan anon key. Atur kebijakan Row Level Security (RLS) Supabase agar publik dapat melakukan `SELECT` pada baris yang boleh ditampilkan dari tabel `homepage_config`, `berita`, `alumni_testimonials`, dan `gallery_items`. Situs hanya menampilkan berita dan testimoni alumni dengan nilai `is_active` sebesar `true`. Jika gambar beranda disimpan di Supabase Storage, bucket `homepage` beserta objek gambarnya juga harus dapat dibaca secara publik. Jangan masukkan service-role key ke variabel lingkungan yang dapat diakses browser. Jangan gunakan kebijakan `ALL` untuk akses tulis publik; batasi kebijakan insert, update, dan delete hanya untuk administrator yang berwenang.

Foto yang dipilih dari laptop melalui panel admin akan diunggah ke bucket `homepage` di Supabase Storage. Situs menampilkan URL publik file tersebut; foto tidak dibaca langsung dari laptop pengunjung.

### Menambahkan konten beranda di Supabase

Jalankan SQL berikut melalui **Supabase Dashboard → SQL Editor**. Ganti teks contoh dan URL gambar sesuai konten Anda. Query konfigurasi ini memperbarui baris yang terakhir diedit, atau menambahkan baris baru jika tabel masih kosong:

Skema awal dapat memiliki URL gambar Unsplash sebagai nilai bawaan. Jalankan perintah berikut satu kali untuk menghapus nilai bawaan tersebut tanpa mengubah URL gambar kustom yang sudah tersimpan:

```sql
alter table public.homepage_config
  alter column hero_image_url drop default;

update public.homepage_config
set hero_image_url = null
where hero_image_url = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80';
```

```sql
with current_config as (
  select id
  from public.homepage_config
  order by updated_at desc nulls last, created_at desc nulls last
  limit 1
),
updated as (
  update public.homepage_config
  set hero_title = 'Judul utama sekolah',
      hero_subtitle = 'Deskripsi singkat sekolah.',
      hero_image_url = 'https://your-project.supabase.co/storage/v1/object/public/homepage/hero/hero.jpg',
      updated_at = now()
  where id = (select id from current_config)
  returning id
)
insert into public.homepage_config (
  hero_title, hero_subtitle, hero_image_url, updated_at
)
select
  'Judul utama sekolah',
  'Deskripsi singkat sekolah.',
  'https://your-project.supabase.co/storage/v1/object/public/homepage/hero/hero.jpg',
  now()
where not exists (select 1 from current_config);
```

Tambahkan baris galeri dengan nilai `type` persis `image` atau `video`. Untuk foto, gunakan URL publik dari file yang sudah diunggah ke Supabase Storage. Baris bertipe `video` hanya diperlukan jika ingin menampilkan video YouTube:

```sql
insert into public.gallery_items (title, type, url)
values
  ('Kegiatan belajar', 'image', 'https://your-project.supabase.co/storage/v1/object/public/homepage/gallery/kegiatan.jpg');
```

Halaman beranda menampilkan item galeri terbaru dan maksimal enam foto. Jika tidak ada foto atau video di database, halaman menampilkan keterangan bahwa konten belum tersedia—bukan gambar atau video contoh dari situs lain. File gambar galeri harus dapat diakses publik. Menambahkan baris ke database tidak otomatis membuat objek Storage yang privat menjadi publik.

## Deployment di Vercel

Cara termudah untuk melakukan deployment aplikasi Next.js adalah menggunakan [Platform Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), yang dibuat oleh pengembang Next.js.

Lihat [dokumentasi deployment Next.js](https://nextjs.org/docs/app/building-your-application/deploying) untuk informasi lebih lanjut.
