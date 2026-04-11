# Zenith

Zenith is a gamified learning roadmap platform that helps users explore skill roadmaps, start structured learning paths, complete nodes sequentially, track daily consistency, and visualize progress through a constellation-style roadmap UI.

It combines roadmap management, skill-tree progression, OTP-based authentication, admin controls, and real-time dashboard insights in one system.

## Features

### User Features
- Explore community roadmaps
- Start and continue roadmaps
- Sequential node unlocking system
- Dynamic constellation / skill-tree roadmap view
- Roadmap-specific progress tracking
- Dashboard with:
  - continue learning
  - consistency heatmap
  - latest logs
  - focus mode
  - active roadmaps
- Profile page with:
  - name
  - email
  - XP
  - streaks
  - completed nodes
  - completed roadmaps
  - pending roadmaps
- Change password using OTP
- Register OTP
- Login OTP
- Forgot password OTP

### Admin Features
- Admin dashboard
- Roadmap builder
- Create roadmap
- Create nodes
- Reorder nodes
- Dynamic Zenith constellation preview
- View user list
- Admin can view only student accounts
- Owner can:
  - view all users
  - make student users admin
  - remove admin role
  - disable or enable student accounts

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Nodemailer

## Project Structure

```bash
PROJECT/
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   └── user/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
