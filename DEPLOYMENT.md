# PetCare Full-Stack Deployment Guide (Vercel, Render, Clerk, MongoDB Atlas)

This guide provides an end-to-end, step-by-step process to deploy your **PetCare** Next.js full-stack application to both **Vercel** and **Render**, integrated with **MongoDB Atlas** for database storage and **Clerk** for user authentication.

---

## 📋 Prerequisites & Required Environment Variables

Before starting deployment, ensure you have gathered the following environment variables:

| Variable Name | Description | Example / Source |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/petcare?retryWrites=true&w=majority` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `pk_test_...` or `pk_live_...` (Clerk Dashboard > API Keys) |
| `CLERK_SECRET_KEY` | Clerk Secret Key | `sk_test_...` or `sk_live_...` (Clerk Dashboard > API Keys) |

---

## 🗄️ Step 1: MongoDB Atlas Configuration

1. **Log in to MongoDB Atlas**:
   - Navigate to [MongoDB Atlas Console](https://www.mongodb.com/cloud/atlas).
2. **Create / Select Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Select **Password** as the Authentication Method.
   - Enter a username (e.g., `petcare_admin`) and generate a secure password.
   - Assign the **Read and write to any database** role.
   - Save the user and note the password.
3. **Configure Network Access (IP Whitelist)**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note: Vercel serverless functions and Render dynamic instances rely on dynamic IPs, requiring standard open IP access.*
   - Click **Confirm**.
4. **Copy the Connection String**:
   - Go to **Database > Clusters > Connect**.
   - Select **Drivers** (Node.js).
   - Copy the string and replace `<username>` and `<password>` with your credentials. Ensure the path includes database name `/petcare`.

---

## 🔐 Step 2: Clerk Authentication Setup

1. **Access Clerk Dashboard**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/).
2. **Retrieve API Keys**:
   - Go to **API Keys** in the sidebar.
   - Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. **Set Up Domain & Allowed Origins (Post-Deployment)**:
   - Once your Vercel or Render deployment URL is live (e.g., `https://petcare-cloud.vercel.app` or `https://petcare.onrender.com`), go to **Clerk Dashboard > Domains**.
   - Add your production domain so sign-in and sign-up redirects operate seamlessly.

---

## 🚀 Step 3: Deploying to Vercel (Recommended Frontend & Serverless)

1. **Push Code to GitHub**:
   - Make sure your project is committed and pushed to a GitHub repository.
2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
   - Import your repository (`petcare-cloud-main`).
3. **Configure Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (or the folder containing `package.json`)
4. **Add Environment Variables**:
   - Expand the **Environment Variables** section and add:
     - `MONGODB_URI`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
5. **Deploy**:
   - Click **Deploy**. Vercel will automatically run `npm run build` and provision your live app.

---

## 🌐 Step 4: Deploying to Render (Web Service Platform)

1. **Log in to Render**:
   - Open [Render Dashboard](https://dashboard.render.com/).
2. **Create New Web Service**:
   - Click **New + > Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Details**:
   - **Name**: `petcare-cloud`
   - **Language / Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter
4. **Configure Environment Variables**:
   - Under the **Environment** tab, add the following key-value pairs:
     - `MONGODB_URI`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `NODE_ENV` = `production`
5. **Deploy**:
   - Click **Create Web Service**. Render will install dependencies, build the Next.js app, and start the service.

---

## ✅ Step 5: Verification & Post-Deployment Checklist

- [x] **Build Verification**: Local production build validated via `npm run build` (Next.js 15 cleanly generated static and dynamic routes).
- [ ] **Database Connectivity**: Verify API routes `/api/pets`, `/api/health`, `/api/medications`, `/api/activities`, `/api/appointments`, `/api/memories`, `/api/bin`, `/api/caretakers` connect to MongoDB Atlas without network timeouts.
- [ ] **Authentication Flow**: Verify Clerk sign-in `/sign-in` and sign-up `/sign-up` render and function on the production URL.
- [ ] **Data Persistence**: Create test pet records and activities to confirm read/write operations succeed on your MongoDB Atlas cluster.


