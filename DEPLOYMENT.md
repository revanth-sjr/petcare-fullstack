# Deployment
## MongoDB Atlas
Create a cluster, database user and network access rule. Copy the SRV connection string into `MONGODB_URI`.

## Clerk
Create a Clerk application, enable sign-in/sign-up, and add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Set user public metadata role to `owner` or `caretaker`.

## Vercel
Import this repository, configure the three environment variables for Production/Preview as required, then deploy. Vercel automatically runs `npm run build` and serves Next.js Route Handlers.

No localhost URL is required by application API calls.
