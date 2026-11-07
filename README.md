# Sleep Star Furniture – Web Application & Content Management Platform

A modern, responsive furniture showcase and bespoke woodwork portfolio web application for **Sleep Star Furniture** (Coimbatore, Tamil Nadu), built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** (Firestore, Storage, Authentication, Hosting).

---

## 🌟 Key Features

### 1. Customer Website (Public Interface)
- **Showroom Homepage**: Hero presentation banner, dynamic category grid, featured solid-wood collections, custom interior service highlights, completed project portfolio, and credibility assurances.
- **Furniture Catalogue (`/products`)**: Real-time Firestore catalogue, category pills, price & availability filtering, keyword search, responsive cards, and discount indicators.
- **Product Details (`/products/:id`)**: Multi-angle image gallery carousel, real discount calculation, technical timber specifications, direct WhatsApp enquiry deep link, and an online custom quote form modal.
- **Custom Services (`/services`)**: Tailored modular kitchens, custom wardrobes, TV consoles, and 4-step execution walkthrough with site measurement booking.
- **Completed Projects CMS Portfolio (`/projects` & `/projects/:id`)**: Social-style project publishing showcase with installation photos, video walkthrough player, materials list, and dual enquiry options (*"Request Exact Same Design"* & *"Request Similar Customised Design"*).
- **Special Offers Page (`/offers`)**: Active promotional campaigns, festival coupon codes, and verified factory-discounted furniture.
- **Interactive Contact Page (`/contact`)**: Showroom location, telephone, opening hours, Google Maps link, and an interactive customer enquiry form supporting 5MB floorplan / photo uploads.
- **Floating WhatsApp Widget**: Persistent quick-chat pill with tooltip assistance.

### 2. Admin Dashboard (Protected Private Interface)
- **Role-Based Admin Protection**: Email/password authentication verified via Firestore `/admins/{uid}` and custom token claims. Public registration is locked down.
- **Live Aggregations Dashboard (`/admin`)**: Real-time KPI counts for Products, Services, Projects, Enquiries, and New leads directly from Firestore.
- **Product Management (`/admin/products`)**: Multi-image drag-and-drop upload, cover photo selector, price & offer validation, stock toggle, and category selector.
- **Category Management (`/admin/categories`)**: Category CRUD, display order, active toggle, and safe deletion checks.
- **Custom Services Management (`/admin/services`)**: Service CRUD, starting prices, feature checklist, and cover photo management.
- **Project CMS (`/admin/projects`)**: Social-style publishing with video walkthrough URL, multiple finished site photos, Instagram-style live preview modal, draft vs. published state.
- **Enquiry Pipeline Management (`/admin/enquiries`)**: Real-time status updater (`New`, `Contacted`, `Site Visit Scheduled`, `Quotation Sent`, `Confirmed`, `Completed`, `Closed`), 1-tap WhatsApp reply generator, full-resolution floorplan photo lightbox, and editable internal follow-up notes.
- **Offers & Discounts (`/admin/offers`)**: Promotional campaign builder with discount percentages, promo codes, product assignment, and active toggles.
- **Site Settings (`/admin/settings`)**: Live editing of showroom telephone, WhatsApp number, address, Instagram profile URL, Google Maps link, top announcement banner, and hero headlines.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS (White and Gray Palette), Lucide React
- **Backend & Database**: Firebase JavaScript SDK v11
  - **Cloud Firestore**: Strict collection validators in `firestore.rules`
  - **Firebase Storage**: Image & video storage with size and MIME-type constraints in `storage.rules`
  - **Firebase Authentication**: Email & password administrator authentication
- **Hosting**: Firebase Hosting with single-page application URL rewrites (`firebase.json`)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BUSINESS_PHONE=+91 98765 43210
VITE_WHATSAPP_NUMBER=919876543210
```

### 3. Running Locally
Start the Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Production Build
Verify and bundle production assets:
```bash
npm run build
```

---

## 🔐 Creating an Administrator Account

1. Open the [Firebase Console](https://console.firebase.google.com).
2. Go to **Authentication** > **Users** and click **Add user**. Enter your admin email and password. Copy the generated **User UID**.
3. Go to **Firestore Database** > Start collection **`admins`**:
   - Document ID: `<paste the User UID>`
   - Fields:
     - `email`: `admin@sleepstar.com` (string)
     - `role`: `admin` (string)
     - `isActive`: `true` (boolean)
     - `createdAt`: `<current timestamp>` (timestamp)
4. Navigate to `http://localhost:5173/admin/login` and log in with those credentials.

---

## ☁️ Deploying to Firebase Hosting

Ensure the Firebase CLI is installed:
```bash
npm install -g firebase-tools
```

Log in and select your Firebase project:
```bash
firebase login
firebase use --add
```

Deploy Firestore Security Rules, Storage Rules, and Hosting in one command:
```bash
npm run build
firebase deploy
```

Or deploy individual targets:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only hosting
```

