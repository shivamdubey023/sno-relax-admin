# SNO-RELAX — Admin Panel

**SNO-RELAX** — AI-Assisted Mental Health & Wellness Platform

**Module:** Admin (Administrative web interface)

**Status:** Final Year Project — Final submission ready

---

## Summary
The Admin Panel provides moderators and administrators a central interface for managing users, content, community moderation, platform settings, and analytics. It supports real-time updates (Socket.IO), configuration (including server theme fallback), and moderation workflows.

> **Academic Declaration:** This module is part of the Final Year Project "SNO-RELAX" and is prepared for academic submission.

---

## Key Features
- User management (view, edit, suspend)
- Content moderation and approval workflows
- Community and group moderation tools
- Reporting and analytics dashboard
- Settings and theme configuration (server-side fallback & client-side preference)
- Real-time notifications and messaging via Socket.IO

---

## Tech Stack
- React (Create React App)
- Axios for API communication
- Socket.IO client for real-time events
- Charting library for analytics (Recharts / Chart.js as applicable)
- Lucide React for icons

---

## Quick Start (Development)
1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm start
```

3. Environment variables
Create a `.env` file (if needed):
```
REACT_APP_API_BASE=http://localhost:5000
PORT=3001
```

The admin UI typically runs on `http://localhost:3001` when port is configured accordingly.

---

## Production
Build for production
```bash
npm run build
```
Deploy the `build/` directory using a static server or hosting platform.

---

## Scripts
- `npm start` — start dev server
- `npm test` — run tests
- `npm run build` — build for production
- `npm run lint` — run linters (if configured)

---

## Security & Best Practices
- Only authenticated admins should access the admin dashboard; server enforces role-based checks for sensitive endpoints.
- Avoid storing secrets in client code; use server configurations for privileged operations.

---

## Contributing
To contribute:
1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit & push, then open a PR

---

## Credits
- Project Creator / Lead Developer: **Shivam Kumar Dubey** — GitHub: https://github.com/shivamdubey023
- Co-Creator: **Suryakant Mishra**

---

For full academic documentation and architecture details, see the top-level `SNO-RELAX/` folder in this repository.
