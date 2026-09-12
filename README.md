<div align="center">

# 🌱 EcoSort AI

### *AI-Powered Waste Classification, Hyperlocal Recycling Depots & Circular Economy Platform*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ecosort--peach.vercel.app-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://ecosort-peach.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud%20Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br />

[🚀 **Explore Live Demo**](https://ecosort-peach.vercel.app) • [📖 **Interactive Features**](#-core-features) • [⚡ **Quickstart**](#-getting-started) • [📡 **API Routes**](#-api-routes-reference) • [🗺️ **Multi-City Network**](#-multi-city-recycling-network)

</div>

---

## 📖 Short Brief

**EcoSort AI** is an intelligent waste management and circular-economy web application designed to eliminate household recycling confusion and incentivize sustainable consumer habits. 

Built with **Next.js 15 App Router**, **MongoDB Atlas**, and **Tailwind CSS**, EcoSort combines:
1. **AI Vision & EPR Barcode Scanning** to immediately classify scrap materials, determine resin codes, and provide actionable disposal guidelines.
2. **Hyperlocal GPS Recycling Maps** with Leaflet to guide users to the nearest certified scrap dealers, e-waste drop-offs, and composting yards.
3. **Doorstep Scrap Pickup Scheduling** ("Kabadiwala") with instant cash/UPI payout estimations and real-time operational slot management.
4. **City-Adaptive Community Leaderboards** driving local ward competitions across **7 major Indian metro cities**.

---

## ⚡ Interactive Architecture Overview

```
[ User Browser / Mobile Device ]
          │
          ├─── 📸 Image Upload & Barcode Optical Scanner
          ├─── 📍 Browser Geolocation (GPS Coordinates)
          ├─── 📦 Doorstep Scrap Pickup Requests
          │
          ▼
[ Next.js 15 App Router / Vercel Serverless Edge ]
          │
          ├─── Middleware Auth Gatekeeper (HTTP-Only JWT + Session Cookies)
          ├─── /api/auth/* ───> Password Hash Comparison (bcryptjs)
          ├─── /api/waste/* ──> Classification & Recommendation Engine
          ├─── /api/users/* ──> Profile & Scan History Aggregator
          │
          ▼
[ MongoDB Atlas Multi-Region Cloud Cluster ]
          ├── Users Collection (Auth, EcoPoints, Citizen Ranks)
          └── WastePredictions Collection (History, Resins, CO2 Saved)
```

---

## 🌟 Core Features

<details open>
<summary><b>🔍 1. Dual AI Vision & Packaging Barcode Scanner</b></summary>
<br>

- **Optical Camera Scanner**: Uses the hardware-accelerated browser `BarcodeDetector` API with animated targeting lasers to scan product barcodes.
- **EPR Database**: Recognizes common consumer packaging (PET bottles, LDPE milk pouches, Tetra Paks, electronics boxes) to display recyclability grades (A+ to C), deposit return refunds, and resin codes.
- **Rewards**: Automatically credits **+50 Eco Points** directly into the user's gamified profile upon each scan.
</details>

<details open>
<summary><b>🗺️ 2. Dynamic GPS Recycling Depot Map</b></summary>
<br>

- **Exact Location Auto-Detection**: Centers on the user's exact coordinates using `navigator.geolocation` and OpenStreetMap Nominatim reverse-geocoding.
- **Smooth `flyTo` Animations**: Smoothly transitions map perspective across cities or user movements.
- **Depot Navigation**: Calculates real-time Haversine distances to nearby municipal hubs, e-waste centers, and raddiwalas, with one-click Google Maps turn-by-turn directions.
</details>

<details open>
<summary><b>🏆 3. Multi-City Community Quests & Leaderboards</b></summary>
<br>

- Replaced static single-city views with dynamic localization across **7 major Indian metros**:
  - 🏙️ **Bengaluru** • 🌊 **Mumbai** • 🏛️ **Delhi NCR** • 💎 **Hyderabad** • 🎓 **Pune** • 🏖️ **Chennai** • 🌉 **Kolkata**
- Citizens compete within their local municipal wards (e.g., Indiranagar, Bandra West, Connaught Place, Jubilee Hills) for monthly Eco Champion badges.
</details>

<details open>
<summary><b>🚛 4. Doorstep Scrap Pickup Scheduling ("Kabadiwala")</b></summary>
<br>

- **Instant Weight & Cash Estimator**: Select estimated kilograms for Cardboard, Paper, Plastics, Metal, and E-Waste to calculate live cash/UPI payouts.
- **Strict Date & Slot Protection**:
  - **Past Dates Locked**: `min` date restrictions strictly prevent booking dates prior to today.
  - **Operational Cutoff Windows**:
    - Morning (9:00 AM – 12:00 PM) closes at 12:00 PM.
    - Afternoon (1:00 PM – 4:00 PM) closes at 4:00 PM.
    - Evening (4:00 PM – 7:00 PM) closes at 7:00 PM.
  - Automatically rolls over to the next day when all daily slots have ended.
</details>

<details open>
<summary><b>🔐 5. Serverless Authentication & MongoDB Atlas Cloud</b></summary>
<br>

- Native Next.js 15 App Router serverless route handlers (`/api/auth/*`).
- Salted password hashing with `bcryptjs`.
- Session security using HTTP-only JWT cookies and client-side middleware verification.
- Serverless connection pooling with `global.mongoose` caching to prevent connection exhaustion.
</details>

---

## 📡 API Routes Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Create a new user account on MongoDB Atlas | ❌ |
| `POST` | `/api/auth/login` | Authenticate credentials and issue session JWT | ❌ |
| `POST` | `/api/auth/logout` | Clear authentication cookies | ❌ |
| `GET` | `/api/auth/me` | Fetch active authenticated user profile | ✅ |
| `GET` | `/api/users/me` | Get profile details & aggregate scan statistics | ✅ |
| `PATCH` | `/api/users/me` | Update citizen display name or email | ✅ |
| `POST` | `/api/waste/upload` | Upload waste image for AI classification | Optional |
| `GET` | `/api/waste/history` | Paginated scan history for logged-in citizen | ✅ |

---

## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/PruthviRajG25/EcoSort.git
cd EcoSort
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.qjddv3v.mongodb.net/ecosort?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="your_secure_jwt_secret_key"
GEMINI_API_KEY="your_google_ai_studio_gemini_key"
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🚀 Deployment

The application is deployed on **Vercel** with full serverless database connectivity. To deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PruthviRajG25/EcoSort)

1. Import the repository on [Vercel](https://vercel.com/new).
2. Set `MONGODB_URI` and `JWT_SECRET` in **Project Settings > Environment Variables**.
3. Deploy!

---

## 📜 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions & Route Handlers)
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Lucide Icons
- **State Management**: Zustand (Multi-city location store, prediction store, user store)
- **Database & ODM**: MongoDB Atlas & Mongoose
- **Mapping & Geolocation**: Leaflet, OpenStreetMap, Nominatim Geocoder
- **Hosting**: Vercel Serverless Edge

---

<div align="center">
Made with 💚 for a Cleaner, Greener Earth • <b>EcoSort AI</b>
</div>
