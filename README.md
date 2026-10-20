# Master Prompt Studio (Web App Development & Claude Anatomy)

Studio rekayasa prompt tingkat lanjut yang dioptimalkan secara spesifik untuk **Pengembangan Aplikasi Web (Web App Development)** dan instruksi bagi AI Coding Assistants & Autonomous Agents (seperti Google Antigravity, Claude 3.7 Sonnet, Gemini 4 Argon, Cursor, GPT-4o).

## Fitur Utama Khusus Web Development
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
- **Kartu Anatomi Interaktif**: Visualisasi per komponen dengan tombol salin per bagian.
- **Riwayat Lokal Offline**: Seluruh prompt tersimpan aman di browser (`localStorage`).

## Panduan Deploy ke Vercel

1. **Deploy ke Vercel**:
   - Impor repositori GitHub ke akun Vercel Anda.
   - Vercel akan otomatis mendeteksi konfigurasi `vercel.json` dan folder `public`.
2. **Konfigurasi Environment Variable (Wajib)**:
   - Di dashboard Vercel, buka **Project Settings** > **Environment Variables**.
   - Tambahkan key: `GEMINI_API_KEY` dengan nilai API Key Gemini Anda (dari Google AI Studio).
   - Simpan dan lakukan **Redeploy**.
3. **Struktur Produksi Vercel**:
   - Halaman frontend (`index.html`) disajikan langsung melalui Edge CDN statis Vercel secara instan dan bebas error 500.
   - Endpoint `/api/generate-prompt` berjalan sebagai Vercel Serverless Function dengan failover otomatis ke model Gemini cadangan jika terjadi lonjakan beban.