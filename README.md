# 🏎️ F1 Viewer

[![Live Deployment](https://img.shields.io/badge/Live_Deployment-Active-success?style=for-the-badge)](https://f1-frontend.vercel.app)

An interactive Formula 1 dashboard and session explorer built with **Next.js 14**, **Mantine UI v7**, and the public **[OpenF1 API](https://openf1.org/)**.

Designed for an autonomous, issue-driven AI agent workflow managed through **GitHub Projects (Jira-style Kanban)** and **Model Context Protocol (MCP)**.

---

## ✨ Features

- **Live & Historical F1 Data**: Powered by OpenF1 REST API (`api.openf1.org`) for session schedules, drivers, and race weekends.
- **Driver Lineup Grid**: Responsive driver cards displaying driver number badges, team color indicators, headshots, country codes, and acronyms.
- **Modern Mantine UI v7**: Beautiful dark/light mode, custom typography (Montserrat), and polished loading and alert states.
- **Agent-Ready CI/CD**:
  - 📋 **GitHub Projects Kanban Board** with Jira-style statuses (`Backlog`, `Ready for Agent`, `In Progress`, `In Review`, `Done`).
  - 🤖 **Issue & PR Templates** requiring visual proof (video demos & before/after screenshots).
  - ⚡ **GitHub Actions Dispatcher** automatically queuing tasks when labeled `agent:ready`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (Pages Router)
- **UI Components**: [Mantine UI v7](https://mantine.dev/)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **Language**: TypeScript
- **Styling**: PostCSS with Mantine PostCSS presets
- **Testing & Quality**: Jest, React Testing Library, Storybook 7, ESLint, Prettier

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/BowenMichael/f1-frontend.git
cd f1-frontend

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📋 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript compiler checks |
| `npm run lint` | Run ESLint and Stylelint |
| `npm run test` | Run full test suite (lint, typecheck, prettier, jest) |
| `npm run storybook` | Launch Storybook UI workshop on port 6006 |

---

## 🤖 Agent Management & Workflow

This project is configured with a Jira-like workflow on [GitHub Projects](https://github.com/users/BowenMichael/projects/1):

1. **Create an Issue**: Use the `[TASK]` template with acceptance criteria and visual recording requirements.
2. **Agent Pick-Up**: The AI agent reads tickets via GitHub MCP and starts development on an isolated branch.
3. **Pull Request with Video**: When the feature is complete, the agent opens a PR containing:
   - 🎥 Video walkthrough of the UI behavior
   - 📸 Before & after screenshots
   - 🧪 Verification of TypeScript checks and tests
4. **Review & Merge**: Review the code diffs and visual demo directly on GitHub to approve and merge.
