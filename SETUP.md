# TMS Project - Setup & Configuration Guide

## ✅ Quick Start

The development server is running on **http://localhost:5173**

### Prerequisites
- ✅ Node.js v22.19.0 (already installed)
- ✅ npm 10.9.3 (already installed)
- ✅ Dependencies installed (node_modules already exists)

---

## 🔧 Required Configuration

### Step 1: Create `.env.local` File

Copy the template and fill in your Supabase credentials:

```bash
# Create .env.local in project root
cp .env.example .env.local
```

Or manually create `.env.local` in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Navigate to **Settings > API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 3: Run Seed Script (Optional)

Populate the database with demo data:

```bash
npm run seed
```

---

## 🚀 Running the Project

### Development Server

The server is already running on port **5173**:

```bash
npm run dev
```

Then open: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

---

## 🐛 Debugging

### Chrome DevTools
- Open Chrome DevTools (F12)
- Go to **Sources** tab to debug TypeScript code
- Breakpoints and step-through debugging available

### VS Code Debugging
1. Press `F5` or click **Run > Start Debugging**
2. Select "Launch Chrome - TMS Project"
3. Chrome will open with debugger attached
4. Set breakpoints in VS Code and debug directly

### Console Errors
If you see `Invalid supabaseUrl: Provided URL is malformed`, verify:
- ✅ `.env.local` file exists
- ✅ `VITE_SUPABASE_URL` is correct
- ✅ File is in the project root (not in src/)
- ✅ Development server restarted after changing .env

---

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app component with routing
├── main.tsx               # React entry point
├── components/            # Reusable UI components
│   ├── Layout.tsx        # Main layout wrapper
│   ├── Router.tsx        # Custom router implementation
│   └── ...
├── pages/                 # Page components (one per route)
├── context/              # React context (Auth, Theme)
├── lib/                  # Utilities and Supabase setup
├── store/                # Zustand state management
└── utils/                # Helper functions

supabase/
├── migrations/           # Database migrations
└── functions/            # Edge functions

public/                   # Static assets
```

---

## 🔑 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Admin Only | For seed scripts & admin operations |

⚠️ **NEVER commit .env file to Git** - it's already in `.gitignore`

---

## 🎯 Common Issues & Fixes

### Issue: "Invalid supabaseUrl"
**Solution**: 
- Check `.env.local` file exists in root directory
- Verify `VITE_SUPABASE_URL` is correct (should be `https://xxx.supabase.co`)
- Restart dev server: `npm run dev`

### Issue: Port 5173 already in use
**Solution**:
```bash
# Kill the process using port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 5174
```

### Issue: TypeScript errors in IDE
**Solution**:
```bash
npm run typecheck
```

### Issue: CSS not loading
**Solution**: Clear browser cache (Ctrl+Shift+Delete) and restart server

---

## 📦 Available Scripts

```json
{
  "dev": "vite",                                    // Start dev server
  "build": "vite build",                            // Build for production
  "lint": "eslint .",                               // Run ESLint
  "preview": "vite preview",                        // Preview production build
  "typecheck": "tsc --noEmit -p tsconfig.app.json" // Check TypeScript
}
```

---

## 🔐 Security Notes

- ✅ **Anon Key**: Safe to expose in browser code (limited permissions)
- ⚠️ **Service Role Key**: Keep secret! Only for backend/admin operations
- ✅ `.env` file ignored by Git (see `.gitignore`)
- ✅ Fixed: Removed hardcoded credentials from `seed.mjs`

---

## 📚 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Routing**: Custom React Router
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **Maps**: Leaflet + OpenStreetMap

---

## 🆘 Need Help?

- Check the error message in browser console (F12)
- Review `.env.example` for required variables
- Ensure Supabase project is active and accessible
- Check network tab for failed API requests
- Verify database migrations have been applied in Supabase

---

## ✨ Next Steps

1. ✅ Set up `.env.local` with Supabase credentials
2. 🔄 Restart dev server (`npm run dev`)
3. 🌐 Open http://localhost:5173 in browser
4. 📊 Login with demo credentials (after running seed script)
5. 🚀 Start developing!

---

**Happy coding! 🎉**
