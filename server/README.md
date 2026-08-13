# EcoSort AI Backend Server

Welcome to the EcoSort AI Backend! This server is written in **pure JavaScript (ES Modules)** and handles user authentication, profile details, secure waste image uploads via Multer and Cloudinary, AI waste classification (integrated with Google Gemini 1.5 Flash), and the Smart Disposal Decision Engine.

---

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- Local MongoDB instance running OR a MongoDB Atlas connection URI

### Installation
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

### Running the Server
- **Development mode (with automatic hot-reloading)**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm run build
  npm start
  ```
- **Running tests**:
  ```bash
  npm test
  ```

---

## API Documentation

All routes are prefixed with `/api`.

### 1. Health Route
- **URL**: `/health`
- **Method**: `GET`
- **Purpose**: Verify backend server status
- **Auth required**: No
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "EcoSort API is running"
  }
  ```

---

### 2. Authentication Endpoints

#### POST /api/auth/register
- **Purpose**: Register a new user and login immediately
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "name": "Pruthvi Raj",
    "email": "pruthvi@ecosort.ai",
    "password": "securepassword123"
  }
  ```
- **Success Response (201)**: Sets HTTP-Only cookie `token` and returns:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "60c72b2f9b1d8b0015c7e112",
        "name": "Pruthvi Raj",
        "email": "pruthvi@ecosort.ai",
        "role": "USER",
        "createdAt": "2026-08-11T12:00:00.000Z",
        "updatedAt": "2026-08-11T12:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (weak password, invalid email format, duplicate email)

#### POST /api/auth/login
- **Purpose**: Validate user credentials and issue session token
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "email": "pruthvi@ecosort.ai",
    "password": "securepassword123"
  }
  ```
- **Success Response (200)**: Sets HTTP-Only cookie `token` and returns user profile.
- **Error Responses**:
  - `401 Unauthorized`: Incorrect email or password
  - `400 Bad Request`: Missing fields

#### POST /api/auth/logout
- **Purpose**: Clear session tokens and terminate user session
- **Auth required**: No
- **Success Response (200)**: Clears cookies and returns:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### GET /api/auth/me
- **Purpose**: Fetch current active user profile details
- **Auth required**: Yes (Valid JWT token cookie or Bearer Authorization header)
- **Success Response (200)**: Returns user profile.
- **Error Responses**:
  - `401 Unauthorized`: Missing or expired token

---

### 3. User Profile Endpoints

#### GET /api/users/me
- **Purpose**: Retrieve details of the logged in user
- **Auth required**: Yes
- **Success Response (200)**: Returns user profile.

#### PATCH /api/users/me
- **Purpose**: Update user display name or email address
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Pruthvi Raj G",
    "email": "pruthvi.new@ecosort.ai"
  }
  ```
- **Success Response (200)**: Returns updated user profile.
- **Error Responses**:
  - `400 Bad Request`: Email already taken, or validation error.

#### DELETE /api/users/me
- **Purpose**: Permanently delete user account and clear session cookies
- **Auth required**: Yes
- **Success Response (200)**: Clears cookies and returns:
  ```json
  {
    "success": true,
    "message": "User account deleted successfully."
  }
  ```

---

### 4. Waste Disposal Decision Endpoints

#### POST /api/waste/upload
- **Purpose**: Upload image of waste, classify it, and receive disposal recommendations
- **Auth required**: Yes
- **Request Body**: `multipart/form-data` containing:
  - `image`: File binary (JPEG, JPG, PNG, WEBP. Max 5MB)
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60c72b2f9b1d8b0015c7e155",
      "imageUrl": "https://res.cloudinary.com/.../bottle.jpg",
      "category": "Plastic",
      "confidence": 94,
      "detectedObjects": ["Plastic Beverage Container"],
      "condition": "Unknown",
      "originalPrediction": "Plastic",
      "correctedCategory": null,
      "status": "SUCCESS",
      "recommendation": {
        "primaryAction": "RECYCLE",
        "alternatives": ["REUSE"],
        "reason": "Plastic containers persist for centuries. Recycling preserves polymers.",
        "instructions": [
          "Empty the bottle entirely.",
          "Rinse out food residue.",
          "Place in standard blue bin."
        ],
        "environmentalImpact": {
          "wasteAvoidedGrams": 40,
          "co2SavedKg": 0.08,
          "text": "Estimated carbon offset: ~0.08 kg CO2 equivalent by avoiding landfill production."
        }
      },
      "createdAt": "2026-08-11T12:05:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Empty files, unsupported extension/mimetype, file > 5MB.

#### PATCH /api/waste/predictions/:id/condition
- **Purpose**: Update the item's condition to fetch condition-dependent suggestions (e.g. Donation vs E-Waste)
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "condition": "Good"
  }
  ```
- **Success Response (200)**: Returns updated prediction and reconstructed recommendations.

#### PATCH /api/waste/predictions/:id/correct
- **Purpose**: Override and manually correct the AI classification category
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "correctedCategory": "Glass"
  }
  ```
- **Success Response (200)**: Returns updated prediction and recommendations matching corrected category.

#### POST /api/waste/predictions/:id/feedback
- **Purpose**: Submit thumbs up/down feedback on recommendations
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "wasUseful": true,
    "comment": "Instructions were very clean!"
  }
  ```
- **Success Response (200)**: Returns success message and feedback logs.

#### GET /api/waste/history
- **Purpose**: Fetch paginated list of scans made by the user
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Page index (default 1)
  - `limit`: Records per page (default 10, max 50)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "history": [
        {
          "_id": "60c72b2f9b1d8b0015c7e155",
          "imageUrl": "...",
          "category": "Plastic",
          "confidence": 94,
          "condition": "Unknown",
          "recommendation": {
            "primaryAction": "RECYCLE",
            "reason": "..."
          },
          "createdAt": "..."
        }
      ],
      "pagination": {
        "total": 12,
        "page": 1,
        "pages": 2,
        "limit": 10
      }
    }
  }
  ```
