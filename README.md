# PetCare
Full-stack Next.js pet management application with separate Owner and Caretaker experiences.

## Stack
Next.js App Router, MongoDB Atlas/Mongoose, Clerk authentication, Route Handlers, Vercel.

## Run
1. `cp .env.example .env.local`
2. Fill MongoDB Atlas and Clerk keys.
3. `npm install`
4. `npm run dev`

## Roles
Store `role: owner` or `role: caretaker` in Clerk public metadata. The app redirects users to the appropriate dashboard. API data ownership and caretaker completion checks are enforced server-side.

Legacy Firebase implementation is preserved under `legacy/` for reference and is no longer the active runtime.
