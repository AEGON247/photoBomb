## FaceFinder

FaceFinder is a SaaS-oriented web app (Next.js + Firebase) that lets users:

- **Connect with Google** using Firebase Authentication.
- **Paste a Google Drive folder link** that they already have access to.
- **Upload a single reference face photo**, which is converted into an embedding.
- **Scan all photos in that Drive folder (and its subfolders)** to find images that match the reference face, without manually scrolling through thousands of files.

The scanning runs entirely in the browser using `face-api.js`; images are never uploaded to any custom backend.

---

### 1. Tech stack

- **Framework**: Next.js (App Router)
- **Auth & Drive access**: Firebase Authentication (Google provider) + Google Drive API via OAuth access token
- **State**: Zustand
- **Face recognition**: `face-api.js` running client-side (with Web Worker support)
- **Styling/UI**: Tailwind 4, shadcn/ui, lucide icons

---

### 2. Prerequisites

1. **Node.js**: Use Node 20+ (LTS).
2. **Google Cloud / Firebase project**:
   - A Google Cloud project with the **Google Drive API** enabled.
   - A Firebase project connected to that Google Cloud project.
3. **Firebase Web App** configured with:
   - Web API key
   - Auth domain
   - App ID
4. **OAuth consent screen** configured for your app, with:
   - Google Drive scopes:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - Approved redirect URIs and JavaScript origins that match where you host this app (local dev + production domain).

---

### 3. Local setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

- Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

- Fill in the Firebase values from your Firebase console (`Project settings` → `General` → `Your apps`).

3. **Start the dev server**

```bash
npm run dev
```

- Visit `http://localhost:3000`.

---

### 4. Deployment (SaaS-style)

You can deploy FaceFinder as a multi-tenant SaaS by deploying this app to a host such as **Vercel** or another Node-capable platform.

At a high level:

1. **Create production Firebase project & OAuth credentials**
   - Ensure the OAuth consent screen is in at least **testing** or **production** mode with required scopes.
   - Add your production domain as an authorized JavaScript origin and redirect URI for the Firebase web client.

2. **Set environment variables on your host**
   - Add all `NEXT_PUBLIC_FIREBASE_*` variables from `.env.example`.

3. **Build and run**

On most hosts:

```bash
npm run build
npm start
```

On Vercel, a standard Next.js deployment is sufficient; Vercel will handle build and start commands automatically.

---

### 5. How users use it

End-user flow:

1. **Sign in with Google**
   - From the login page (`/login`), users click "Connect Google Drive" and complete OAuth.
   - The app requests Drive read-only permissions so it can list and read image files from their Drive.

2. **Paste a Google Drive folder link**
   - On the dashboard, users paste a URL to a **folder** they already have access to (e.g. `https://drive.google.com/drive/folders/...`).
   - The app validates the link using the Drive API and saves it as the root to scan.

3. **Upload a reference face**
   - Users upload a photo of the person they want to find.
   - The app runs face detection and lets them choose the correct face (if multiple).
   - The chosen face is converted to an embedding (descriptor) and stored in client state.

4. **Start scanning**
   - The scan process:
     - Traverses the target Drive folder and subfolders.
     - Downloads each image blob via the Drive API.
     - Runs face recognition in a Web Worker using `face-api.js`.
     - Computes similarity scores and records high-confidence matches.
   - Matching results are shown in a gallery with:
     - Thumbnail preview
     - Link to open the original file in Google Drive

---

### 6. Privacy & data flow (important for SaaS)

- **Images are processed client‑side**:
  - The browser downloads images directly from Google Drive using the user’s access token.
  - Face detection and recognition run entirely in the user’s browser.
  - The app’s own backend (if any) does not see raw images or face descriptors by default.
- **Drive access**:
  - The app only has the scopes you configure (`drive.readonly`, `drive.metadata.readonly`).
  - Users can revoke access any time via their Google account.
- **Storage**:
  - By default, this project keeps scan state in client memory; closing the tab clears results.

For a production SaaS, you should publish a proper **Privacy Policy** and **Terms of Service** on your domain and link to them from the UI and the OAuth consent screen.

---

### 7. Development notes

- **TypeScript / ESLint**:
  - `npm run lint` runs the Next.js ESLint configuration.
  - For iterative development, TypeScript and ESLint errors are currently ignored during `next build` via `next.config.ts`; for a locked-down production pipeline you can flip those flags and fix any outstanding issues.

- **Face models**:
  - The app expects `face-api.js` models to be hosted under `/models` (e.g. `public/models`).
  - Ensure you copy the required model files there in your deployment.

---

### 8. License

This repository includes a basic MIT `LICENSE` file by default. Adjust the license as needed for your business.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
