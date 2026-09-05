# Fun Run Form

> Running event registration system — Next.js + TypeScript + Supabase

[![Live Demo](https://img.shields.io/badge/Live-fun--run--form.vercel.app-000?style=for-the-badge&logo=vercel)](https://fun-run-form.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-feastco%2Ffun--run--form-181717?style=for-the-badge&logo=github)](https://github.com/feastco/fun-run-form)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20TypeScript%20%7C%20Supabase-blue?style=flat-square)](#tech-stack)

Participant registration system for running events. Handles participant data collection, form validation, and administrative management for event organizers.

## 🚀 Live Demo

🔗 **https://fun-run-form.vercel.app**

## ✨ Features

- **Participant registration** — multi-step form with validation
- **Event categories** — support for multiple race categories (5K, 10K, etc.)
- **Data persistence** — entries stored in Supabase (PostgreSQL)
- **Admin dashboard** — view and manage registered participants
- **Responsive UI** — mobile-first with Tailwind CSS

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Auth | Supabase Auth |

## 📂 Project Structure

```
fun-run-form/
├── app/                # Next.js App Router pages
├── components/         # Reusable React components
├── lib/                # Supabase client & utilities
├── public/             # Static assets
├── types/              # TypeScript type definitions
└── vercel.json         # Vercel deployment config
```

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/feastco/fun-run-form.git
cd fun-run-form

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run dev server
npm run dev
# Open http://localhost:3000
```

## 👤 Author

**Fisco Maulana Ikhwan** — Informatics Engineering (D3), Universitas Dian Nuswantoro
- GitHub: [@feastco](https://github.com/feastco)
- LinkedIn: [fiscomaulanaikhwan](https://www.linkedin.com/in/fiscomaulanaikhwan)
