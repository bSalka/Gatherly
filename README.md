# Gatherly

A modern event discovery and ticketing platform built for Bosnia and Herzegovina.
Users can browse events, purchase tickets with QR codes, and manage bookings - all in one place.

##Live demo
[gatherly-app.vercel.app](https://gatherly-3ewb.vercel.app/)

#Features
- Browse and search events by category, city and keywords
- User authentication (email/password + Google OAuth)
- Role-based access — visitor, organizer, admin
- Organizer dashboard — create and manage events with ticket tiers
- Admin panel — approve/reject events, manage user roles
- Booking system with Firestore transactions (prevents overselling)
- Individual QR codes per ticket
- Email confirmation via EmailJS
- Favourites system
- Dark/light mode
- Past events automatically hidden from public listing
- Fully responsive

## Tech stack
- Frontend: React + Vite
- Styling: Tailwind CSS
- Auth & Database Firebase(Firestore, Authentication)
- Email: EmailJS
- Deployments: Vercel

## Getting started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Firebase config
3. Run `npm install`
4. Run `npm run dev`

## Environment variables

Create a `.env` file in the root with the following:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

## Poject structure

src/

|- components/ # Reusable UI (Navbar, Footer, ProtectedRoute, EventCard, EventCardSkeleton, TicketTierManager)

|- context/ # AuthContext (AuthContext, ThemeContext)

|- pages/ # All pages (Account, Admin, BookingConfirmation, EventDetail, Events, Favourites, ForgotPassword, Home, Login, NotFound, Organizer, Signup)

|- services/ #Firebase services (auth.js,email.js, events.js, firebase.js, users.js)

## User roles
|Role|--|Permissions|

| Visitor |--| Browse events, register/login |

| User |--| Buy tickets, manage bookings, favourites |

| Organizer |--| Create and manage events, set ticket tiers |

| Admin |--| Approve/reject events, manage user roles |

