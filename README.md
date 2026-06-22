<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/90656dcf-ed26-4bff-b962-e631118fa93b

## Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`) and add your API keys:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```
3. **Run the application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deploy on Render

This project is fully configured for deployment on [Render](https://render.com/) using Render Blueprints (`render.yaml`).

### Option 1: Automatic Blueprint Deployment (Recommended)

1. Push your project to a GitHub, GitLab, or Bitbucket repository.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New** at the top right, then select **Blueprint**.
4. Connect your repository. Render will automatically read the [render.yaml](file:///C:/Users/nanda/Downloads/proposalai/render.yaml) file.
5. In the configuration page, enter your `GEMINI_API_KEY` (and optional OpenRouter keys if desired).
6. Click **Apply**. Render will automatically build and spin up your application.

### Option 2: Manual Web Service Setup

If you prefer to configure the Web Service manually:
1. Click **New** > **Web Service** in your Render dashboard and connect your repository.
2. Configure the following settings:
   - **Language:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add the following **Environment Variables** in the service settings:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
4. Click **Deploy Web Service**.

