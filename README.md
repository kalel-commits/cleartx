<p align="center">
  <img src="assets/banner.png" alt="ClearTx Banner" width="800">
</p>

<h1 align="center">ClearTx 🏦</h1>
<h3 align="center">A privacy-first multi-bank transaction labeling tool</h3>

<p align="center">
  <a href="https://kalel-commits.github.io/cleartx/">Live Demo</a> • 
  <a href="#-features">Features</a> • 
  <a href="#-tech-stack">Tech Stack</a> • 
  <a href="#-installation--usage">Installation</a>
</p>


## 🌟 Why ClearTx?

Ever received a UPI notification like _"₹450 debited. Ref ID: ABC123"_ and wondered:
- **Which bank account was charged?** (SBI? HDFC? ICICI?)
- **What was this payment for?** (Groceries? Rent?)
- **How much have I spent this month per account?**

ClearTx solves these frustrations while protecting your privacy:

✅ **100% local storage** - Data never leaves your device  
✅ **No ads, tracking, or accounts**  
✅ **Simple labeling and filtering**  
✅ **Exportable CSV for reporting**

## 🚀 Features

- **Add Bank Accounts**: Save nickname & masked account number.
- **Log Transactions**: Amount, date/time, UPI ref/note, linked account.
- **Filter & Search**: By account, date range, or keyword.
- **Local-Only Storage**: No server, no tracking, all data stays in your browser.
- **CSV Export**: Download transactions for budgeting or reporting.
- **Responsive UI**: Works on desktop & mobile.

## 🖥️ Tech Stack

- **React + Vite**
- **Tailwind CSS**
- **React Router**
- **Browser LocalStorage** for persistence

## 📦 Installation & Usage

```bash
# Clone the repository
git clone https://github.com/kalel-commits/cleartx.git

# Navigate into the folder
cd cleartx

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 🌐 Deployment to GitHub Pages

```bash
# Update vite.config.ts base path to '/cleartx/' (already set)

# Build and deploy
npm run deploy

# If you run into ENAMETOOLONG on Windows, try:
npx gh-pages -d dist -b gh-pages -a

```
# Contribution Guide

## How to Help
1. Fork the repo
2. Create a branch: `feat/your-feature`
3. Test changes: `npm test`
4. Push: `git push origin feat/your-feature`

## Code Standards
- TypeScript strict mode
- Tailwind utility classes
- Atomic commits:
  - feat: New functionality
  - fix: Bug repairs
  - docs: Documentation
---
name: 🐛 Bug Report
about: Report unexpected behavior
title: '[BUG] '
labels: bug
---

## Description
Clear steps to reproduce:

1. Go to '...'
2. Click '....'
3. See error

## Expected Behavior
What should happen?

## Screenshots
If applicable

## 📜 License

MIT License © 2025 Ajay
