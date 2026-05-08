<div align="center">
  <h1>✨ OrganizaS</h1>
  <p><strong>Your ultimate hub for productivity, organization, and finding your focus.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
  [![Google AI Genkit](https://img.shields.io/badge/AI-Google_Genkit-blue?style=for-the-badge&logo=google)](https://firebase.google.com/docs/genkit)
</div>

---

## 🚀 About The Project

Welcome to **OrganizaS**! 👋 This is **one of my very first projects**, built with passion and the drive to create something genuinely useful. 

More than just a simple to-do list, OrganizaS is a complete ecosystem designed to elevate your focus, simplify your daily routine, and turn your goals into reality. By combining a clean, modern User Interface with powerful built-in Artificial Intelligence, this app doesn't just manage your tasks—it helps you figure out *how* to tackle them efficiently.

---

## 🌟 Key Features

- **✅ Task Management & Inbox:** Smartly organize your ideas, projects, and daily tasks. Quick capture means you'll never lose a stray thought.
- **📅 Calendar & Scheduling:** Take absolute control of your time. Schedule events, coordinate meetings, and carve out deep work blocks.
- **🎯 Goals & Habits Tracker:** Build a better routine! Track your weekly progress and cultivate positive life habits with ease.
- **📚 Smart Study & Canvas:** A dedicated zone for focus sessions featuring advanced tools like collaborative whiteboarding (Excalidraw) and rich-text editing (Tiptap).
- **🤖 Built-in AI (Google Genkit):** Let AI guide you. Get smart habit suggestions, optimized daily goals, and personalized productivity workflows.
- **🔔 Active Notifications:** Stay on top of commitments with our integrated web push notifications powered by OneSignal.
- **📊 Visual Dashboard:** Beautiful, interactive charts tracing your daily and weekly accomplishments right out of the box.

---

## 🛠️ Tech Stack

I built this project to learn and master the modern web development ecosystem:

* **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) for beautiful accessible components
* **Backend & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, System Admin)
* **Artificial Intelligence:** [Google Genkit](https://firebase.google.com/docs/genkit) for generative AI flows
* **Media & Services:** [Cloudinary](https://cloudinary.com/) (Asset Uploads), [OneSignal](https://onesignal.com/) (Push Notifications)
* **Rich Text / Drawing:** [Tiptap](https://tiptap.dev/) / [Excalidraw](https://excalidraw.com/)

---

## ⚙️ Getting Started (Local Setup)

Want to check out the code or run it locally? Awesome! Here's how:

### 1. Prerequisites
- Node.js (version 18.17 or higher)
- npm, yarn, bun, or pnpm
- A [Firebase](https://console.firebase.google.com/) project
- A [Cloudinary](https://cloudinary.com/) account for image uploads

### 2. Installation

Clone down the repository and install the dependencies:

```bash
git clone https://github.com/your-username/organizaS.git
cd organizaS
npm install
```

### 3. Environment Variables Setup

You'll need a `.env.local` to securely store your API keys. 

1. Simply copy the provided example file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your details. Specifically, you only need to setup the Cloudinary credentials to get assets working correctly!

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### 4. Start the Application

OrganizaS uses a dual architecture for the Web UI and AI backend.

**Run the Web App (typically port 3000 or 9002):**
```bash
npm run dev
```

**Run the AI features (Genkit Flows):**
```bash
npm run genkit:dev
# or in watch mode
npm run genkit:watch
```

Open [http://localhost:9002](http://localhost:9002) in your browser and start organizing! 🔥

---

<p align="center">Made with ☕ and focus as one of my very first development journeys. Built to maximize your time so you can do what matters most.</p>
