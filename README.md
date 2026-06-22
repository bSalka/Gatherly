# Gatherly

A full-stack event and ticketing platform.

## Tech stack

- React + Vite
- Tailwind CSS
- Firebase(Firestore, Auth, Storage)
- Node.js + Express (soon)
- Stripe (soon)

## Getting started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Firebase config
3. Run `npm install`
4. Run `npm run dev`

## Pojwct structure

src/
|- components/ # Reusable UI (Navbar, Footer, ProtectedRoute)
|- context/ # AuthContext
|- hooks/ # Custom hooks
|- pages/ # All pages
|- services/ #Firebase services (auth.js, firebase.js)
