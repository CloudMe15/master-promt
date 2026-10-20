# Master Prompt Studio (React + Vite + Claude Anatomy)

Generator Master Prompt komprehensif berbasis arsitektur terstruktur (Claude Anatomy 6-Bagian, Elite 8-Anatomi, dan Agentik Otonom). Dioptimalkan secara spesifik untuk **Pengembangan Aplikasi Web (Web App Development)** dan instruksi bagi AI Coding Assistants & Autonomous Agents (seperti Google Antigravity, Claude 3.7 Sonnet, Gemini 4 Argon, Cursor, GPT-4o).

Aplikasi ini telah dimigrasikan sepenuhnya ke arsitektur **React 19 + TypeScript + Vite + Tailwind CSS**, siap deploy ke **Vercel** maupun dijalankan secara lokal / server Express.

---

## Fitur Utama

- **Preset Rekayasa Web Dev (1-Klik)**:
  - 🌐 *Fullstack SaaS Web App* (Multi-tenant, Auth, Stripe, PostgreSQL/Drizzle, Tailwind)
  - ⚡ *Google Antigravity Web Agent* (Autonomous audit, refactoring, CLI tests green)
  - 🛠️ *REST API + Auth & DB* (Zod schema validation, JWT, error handling middleware)
  - 🎨 *Responsive SaaS Dashboard* (Dark mode, charts, data table, skeleton loading)
  - 🔄 *Refactor & Clean Architecture* (Pemisahan concerns, custom hooks, Vitest)
  - 🛡️ *Web Security & Auth RBAC* (CSRF, CSP, sanitasi XSS, audit log)
- **Seleksi Target Tech Stack**: Next.js/React + Tailwind, Node.js + Express/Fastify REST API, Modern Vanilla JS/TS + Vite, Python FastAPI, atau Rekomendasi Otomatis.
- **Arsitektur Multi-Tier**:
  - ⭐ **Elite 8-Anatomi**: Standar produksi dengan batasan negatif (Guardrails) & contoh konkret (Few-Shot).
  - 🤖 **Agentik Otonom**: Khusus agen dengan tool authority, alur verifikasi CLI, dan deterministic exit criteria.
  - 📜 **Standar Klasik 6-Bagian**: Anatomi asli Claude Prompt.
- **Audit Kualitas Struktur**: Verifikasi otomatis kelengkapan persona, guardrails, stop criteria, dan format sebelum prompt dieksekusi.
- **3 Tampilan Fleksibel**:
  - **Dokumen**: Render Markdown kaya teks dengan tipografi kontras tinggi.
  - **Kartu Anatomi**: Visualisasi interaktif per bagian dengan tombol salin per blok.
  - **Raw**: Teks monospace siap disalin.
- **Riwayat Lokal Offline**: Seluruh prompt tersimpan aman di browser (`localStorage`).
- **Refinement Bar**: Sempurnakan dan iterasi prompt secara berkesinambungan tanpa kehilangan konteks.

---

## Solusi Build Vercel (Fix: No entrypoint found in output directory "public")

### Penyebab Error Sebelumnya:
Error `[BUILD_FAILED] No entrypoint found in output directory: "public"` terjadi karena konfigurasi sebelumnya menggunakan `outputDirectory: "public"` dengan build command `node -e ...` yang menduplikasi file HTML statis. Vercel mendeteksi proyek sebagai serverless/Node.js dan mengharapkan entrypoint file JS/TS (`index.js`, `server.js`, `app.js`) di dalam folder output.

### Solusi & Perbaikan yang Diterapkan:
1. **Framework Preset Vite**: Proyek kini menggunakan standar Vite (`"build": "vite build"`), menghasilkan output ke folder `dist`.
2. **Konfigurasi `vercel.json`**:
   ```json
   {
     "framework": "vite",
     "buildCommand": "vite build",
     "outputDirectory": "dist",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
3. **Vercel Serverless Function**: Endpoint `/api/generate-prompt.js` berjalan sebagai Serverless Function independen di Vercel, sementara React SPA disajikan langsung dari CDN statis (`dist`).

---

## Menjalankan Proyek Secara Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan development server
npm run dev
```

Buka browser di `http://localhost:3000`.

---

## Cara Deploy ke Vercel

1. Push perubahan ini ke repositori GitHub Anda:
   ```bash
   git add .
   git commit -m "fix: migrate to React + Vite and fix Vercel build configuration"
   git push origin main
   ```
2. Buka dashboard Vercel pada proyek Anda:
   - Masuk ke **Settings** > **Environment Variables**.
   - Tambahkan variabel:
     - `GEMINI_API_KEY`: *(API Key Gemini Anda dari Google AI Studio)*
3. Klik **Redeploy** (atau Vercel akan otomatis melakukan auto-deploy dari push commit terbaru).
4. Build akan berhasil 100% dan halaman web aktif seketika.