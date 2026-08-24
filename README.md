# HASTKALA

Hastkala is an AI-driven digital marketplace and smart cataloging platform designed to empower marginalized Indian artisans by bridging the gap between traditional craftsmanship and modern e-commerce. Built specifically to address the **SIH26090** problem statement ("AI-Driven Market Linkage and Smart Cataloging Mobile Application for Marginalized Artisans"), this project reduces technical barriers, simplifies product digitization through AI assistance, and connects artisans directly with buyers and B2B opportunities without requiring extensive digital literacy.

---

# Problem Statement

Marginalized artisans in India face significant hurdles in accessing digital markets, often relying entirely on physical fairs, middlemen, and seasonal exhibitions. Key challenges include:

- Limited year-round direct market access.
- Low digital literacy and language barriers preventing participation in modern e-commerce.
- Extreme difficulty in capturing professional photographs and creating compelling product descriptions.
- Lack of understanding regarding fair digital market pricing.
- The need for a platform that establishes direct market linkage and preserves their dignity and identity.

---

# Our Solution

Hastkala provides an end-to-end ecosystem tailored for artisans. The platform facilitates a seamless transition from offline creation to online selling:

**Artisan** → **Verification** → **AI-assisted product digitization** → **Marketplace** → **Customer/B2B enquiry** → **Direct market linkage**

By offloading the complex parts of cataloging (like pricing and descriptions) to AI and enforcing a verified, trust-based environment, Hastkala allows artisans to focus on their craft while the technology handles the commerce.

---

# Key Features

## Implemented

- **Customer marketplace**: A clean, accessible frontend for buyers to explore crafts.
- **Product discovery**: Search and category filtering.
- **Product details**: Dedicated product viewing pages.
- **Artisan profiles**: Public profiles showcasing the artisan's story and catalog.
- **Customer enquiries**: Direct buyer-to-seller communication system.
- **Artisan dashboard**: Seller-specific workspace to manage listings.
- **Artisan onboarding**: Guided profile completion.
- **Artisan verification workflow**: Status tracking (pending, active, rejected).
- **Admin verification panel**: Dashboard for administrators to review and approve artisans.
- **Customer/Artisan/Admin role separation**: Strict Role-Based Access Control.
- **Firebase Authentication**: Secure, robust session management.
- **Firestore**: Real-time database for users, products, and enquiries.
- **Dynamic Pricing Assistant**: AI-powered backend tools.
- **Gemini-powered backend**: Integration with Google's generative AI.
- **Responsive UI**: Web-based interfaces optimized for all screen sizes.
- **Mobile-friendly design**: Touch-optimized interface and layouts.

## Planned / Future

- **Multilingual Auto-Cataloger**: Translating product descriptions dynamically.
- **Regional-language voice input**: Allowing artisans to dictate product details in their native tongue.
- **AI image enhancement/background removal**: Automatically cleaning up artisan-captured photos.
- **Mobile application packaging**: Porting the existing web architecture to a native mobile app.

---

# User Roles

| Role | Access |
|---|---|
| Customer | Marketplace, products, artisan profiles, enquiries |
| Artisan | Onboarding, pending verification, dashboard, products, enquiries |
| Admin | Artisan verification and administration |

---

# Application Flow

**Customer:**
```text
Customer
  → Home
  → Explore
  → Product
  → Artisan Profile
  → Enquiry
```

**Artisan:**
```text
Signup
  → Onboarding
  → Submit Verification
  → Pending
  → Admin Approval
  → Active
  → Dashboard
  → Product Listing
```

**Admin:**
```text
Admin Login
  → Admin Panel
  → Pending Applications
  → Review
  → Approve / Reject
```

---

# Technology Stack

**Frontend:**
- React (v19)
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- Recharts
- Axios

**Backend:**
- Node.js
- Express
- Gemini SDK (`@google/genai`)
- Mongoose (MongoDB)
- Pinata SDK
- JsonWebToken (Legacy/Service integrations)
- Bcryptjs

**Database/Auth:**
- Firebase Authentication (Client sessions and identity)
- Firestore (Web data and application state)

---

# Architecture

```text
       React/Vite Frontend
               ↓
    Firebase Authentication
               ↓
           Firestore
               ↓
      Node/Express Backend
         (MongoDB + Pinata)
               ↓
           Gemini API
```

*Note: Sensitive API credentials (like the Gemini API keys and Pinata secrets) remain securely isolated in the Node/Express backend.*

---

# Project Structure

```text
hastkala/
├── src/
│   ├── assets/        # Static files and images
│   ├── components/    # Reusable UI components (Navbar, ProtectedRoute)
│   ├── contexts/      # React contexts (AuthContext)
│   ├── data/          # Mock data or static constants
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Route-level components (Home, Login, Dashboard)
│   ├── utils/         # Utility functions and Firebase initialization
│   ├── App.jsx        # Main application router
│   └── main.jsx       # Entry point
│
├── backend/
│   ├── controllers/   # Express route controllers
│   ├── middleware/    # Express middleware (Auth, upload)
│   ├── models/        # Mongoose database schemas
│   ├── qrcodes/       # Generated QR code storage
│   ├── routes/        # Express API routes
│   ├── services/      # Business logic (Gemini integration, Pinata)
│   ├── uploads/       # Temporary upload storage
│   ├── utils/         # Backend utility scripts
│   └── server.js      # Express server entry point
│
├── firestore.rules    # Firebase security rules
├── package.json       # Frontend dependencies and scripts
└── vite.config.js     # Vite configuration
```

---

# Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```

5. **Start the Backend Server (in a new terminal):**
   ```bash
   cd backend
   npm run dev
   ```

---

# Environment Variables

**Frontend (`src/utils/firebase.js`)**
The frontend does not currently use a `.env` file. Firebase configuration is loaded directly inside `src/utils/firebase.js`.

**Backend (`backend/.env`)**
Create a `.env` file in the `backend/` directory using the following template. Do not commit actual secrets to version control.

```env
PORT=
JWT_SECRET=
MONGO_URI=
GEMINI_API_KEY=
PINATA_API_KEY=
PINATA_API_SECRET=
MASTER_ADMIN_EMAIL=
```
