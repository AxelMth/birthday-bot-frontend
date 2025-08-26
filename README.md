# Birthy - Birthday Bot Frontend

This is a [Next.js](https://nextjs.org) frontend for the Birthday Bot platform, allowing you to manage birthday notifications and contact methods.

## Features

- 📅 Browse and manage people's birthdays
- 🔔 View communication history
- 🛡️ Admin-protected actions with API key authentication
- 📱 Responsive design with modern UI

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Key Authentication

The app uses API key authentication to control admin access. Admin users can create, edit, and delete people.

### How to Use API Keys

#### Option 1: URL Parameter

Add your API key to any URL using the `apiKey` parameter:

```
http://localhost:3000?apiKey=your-admin-key-here
```

Supported parameter names:

- `apiKey` - Primary parameter name
- `API_KEY` - Alternative parameter name

#### Option 2: Direct Navigation

If you already have an API key stored, simply navigate to the app. The key will be automatically validated.

### Admin Features

With a valid admin API key, you can:

- ✅ Create new people (`/person/create`)
- ✅ Edit existing people (`/person/[id]/edit`)
- ✅ Delete people from the list
- ✅ View all administrative functions

Without admin access:

- ❌ Create/Edit/Delete operations show "Access Denied"
- ❌ Admin-only buttons are hidden
- ✅ Read-only access to people list and communications

### API Key Management

#### Clearing Your API Key

- Click the "Clear Key" button in the header when in admin mode
- This will sign you out and remove the stored key

#### Key Storage

- API keys are stored in `localStorage` for convenience
- Keys are automatically validated on page load
- Invalid keys are automatically cleared

## Backend Integration

The frontend communicates with the Birthday Bot backend API. Key endpoints used:

- `POST /auth/validate` - Validates API keys and returns admin status
- All API requests include the `x-api-key` header when authenticated

**Security Note**: Admin controls are enforced both client-side (for UX) and server-side (for security). The backend must validate the API key for all administrative operations.

## Environment Variables

Make sure to set:

```bash
NEXT_PUBLIC_SERVER_URL=http://your-backend-url
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
