# Taskflow — Personal Task Manager

A simple task manager built with **Next.js, React and TypeScript**, ready to deploy on **Vercel** from a **GitHub** repository.

## Features

- Create, edit and delete tasks
- Set start dates, due dates, priority and status
- Track task progress from 0–100%
- Dashboard with task totals, completion and overdue counts
- Focus list for upcoming unfinished tasks
- Search, filter and sort tasks
- Export all tasks as a JSON backup
- Responsive desktop and mobile layout
- Automatically saves to browser local storage

## Run locally

Requirements: Node.js 18.18+ (Node 20 LTS recommended) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To create a production build:

```bash
npm run build
npm start
```

## Deploy with GitHub + Vercel

1. Create a new empty repository on GitHub.
2. Unzip this project and push the contents to the repository root:

   ```bash
   git init
   git add .
   git commit -m "Initial Taskflow app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. Sign in to [Vercel](https://vercel.com), choose **Add New → Project**, and import the GitHub repository.
4. Keep the detected framework as **Next.js**. No environment variables are needed for this starter.
5. Click **Deploy**. Vercel will build and publish the app. Future pushes to the connected branch trigger deployments.

## Important: where task data is stored

This starter stores tasks in the browser's `localStorage`. That means:
- Tasks persist when you reopen the app in the same browser on the same device.
- Data is not shared between devices, browsers or different users.
- Clearing browser site data can remove locally stored tasks. Use **Export data** to make a JSON backup.

For a multi-device, multi-user production app, connect a database such as Supabase or Neon and add authentication. The current version intentionally avoids requiring a database account or secrets so you can deploy it immediately.

## Project structure

```text
taskflow-task-manager/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```
