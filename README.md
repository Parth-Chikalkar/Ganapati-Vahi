# 🙏 Ganapati Vahi — Digital Scrapbook

A full-stack MERN web app that digitally recreates the old tradition of collecting Ganapati newspaper cutouts in a notebook. Users can create digital "books" and fill them with Ganapati photos, videos, titles, and descriptions — like a childhood scrapbook brought online.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Media Storage:** Cloudinary
- **API Communication:** Axios

## Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env` with:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ganapati-vahi
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

## Features

- 🔐 User signup & login with JWT authentication
- 📖 Create, edit, delete digital scrapbooks (books)
- 🖼️ Add Ganapati photos and videos to books
- 🌐 Set books as public or private
- 🏠 Browse public books on the home page
- 📱 Responsive, nostalgic scrapbook-style UI
