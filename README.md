# Zenith

Zenith is a gamified learning roadmap platform that helps users explore skill roadmaps, start structured learning paths, complete nodes sequentially, track daily consistency, and visualize progress through a constellation-style roadmap UI.

It combines roadmap management, skill-tree progression, OTP-based authentication, admin controls, and real-time dashboard insights in one system.

## Features

### User Features
- Explore community roadmaps
- Start and continue roadmaps
- Sequential node unlocking system
- Dynamic constellation / skill-tree roadmap view.
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
- Admin can disable student accounts
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
+-- frontend/
�   +-- src/
�   �   +-- admin/
�   �   +-- components/
�   �   +-- user/
�
+-- server/
�   +-- config/
�   +-- controllers/
�   +-- middleware/
�   +-- models/
�   +-- routes/
�   +-- utils/
```

## Main Modules

### Frontend Pages
- `Landing.tsx`
  Landing page with hero section, explore section, auth section, and logged-in user sections.

- `Explore.tsx`
  Displays available roadmaps and allows users to start a course.

- `Roadmap.tsx`
  Shows the latest active roadmap snapshot on the landing page.

- `RoadmapView.tsx`
  Full roadmap journey page with node completion, progress tracking, and constellation graph.

- `Dashboard.tsx`
  Shows activity heatmap, latest logs, continue learning, focus mode, and roadmap summaries.

- `Auth.tsx`
  Handles login, registration, OTP verification, forgot password, and reset password flows.

- `Profile.tsx`
  Displays account details, XP, roadmap stats, and change-password OTP flow.

- `AdminDashboard.tsx`
  Admin overview page with system stats and quick controls.

- `AdminBuilder.tsx`
  Used to create and manage roadmaps and nodes.

- `AdminUsers.tsx`
  Role-based user management page.

### Important Components
- `ZenithMap.tsx`
  Reusable constellation graph used in admin builder and user roadmap views.

- `PasswordField.tsx`
  Reusable password input with show/hide toggle.

- `CustomCursor.tsx`
  Custom cursor effect for the UI.

## Backend Models

### User
Stores:
- name
- email
- password
- role
- completed nodes
- XP
- streak
- longest streak
- last active
- verification status
- OTP data
- disabled state

### Roadmap
Stores:
- title
- description
- difficulty
- active/published state

### Node
Stores:
- title
- description
- order
- XP value
- roadmap reference
- x/y position for constellation layout

### UserRoadmap
Stores:
- user-roadmap relationship
- progress
- startedAt

### Progress
Stores:
- per-user node completion records

### Activity
Stores:
- date
- XP earned
- nodes completed

## Authentication Flow

### Register
1. User enters name, email, password, confirm password.
2. Backend validates input.
3. Password is hashed.
4. OTP is sent to email.
5. User verifies OTP.
6. JWT token is issued.

### Login
1. User enters email and password.
2. Backend verifies credentials.
3. Login OTP is sent.
4. User verifies OTP.
5. JWT token is issued.

### Forgot Password
1. User enters email.
2. Reset OTP is sent.
3. User enters OTP and new password.
4. Password is updated.

### Change Password
1. Logged-in user requests OTP from profile page.
2. OTP is sent to registered email.
3. User verifies OTP and submits new password.
4. Password is changed.

## Role System

### student
- Access landing page
- Explore roadmaps
- Start and complete roadmaps
- View dashboard and profile

### admin
- Access admin dashboard
- Manage roadmaps
- View only student users
- Can disable student accounts

### owner
- Access admin dashboard
- View all users
- Promote student to admin
- Remove admin role
- Disable or enable student accounts

## Roadmap Logic

### Sequential Unlocking
Nodes unlock one by one in order.

Example:
- If A is completed, B unlocks.
- C and D stay locked.
- After B is completed, C unlocks.

This logic is enforced in the backend, not only visually in the frontend.

### Constellation Layout
- Nodes are visualized as stars.
- Lines connect nodes based on order.
- Positions are stored in the database.
- Layout is dynamically rendered through `ZenithMap`.

### Node Status
- Completed
- In Progress
- Locked

## Dashboard Logic

### Heatmap
- Calendar-year based heatmap similar to GitHub.
- Uses daily activity records.
- Correct weekday alignment.
- Local-date aware.
- Near real-time updates.

### Latest Logs
- Uses real activity data.
- Shows nodes completed and XP earned.
- Sorted newest first.

### Continue Learning
- Displays latest started roadmap dynamically.

### Focus Mode
- Displays the latest roadmap.
- Shows next pending milestone.
- Shows the latest 3 roadmap names dynamically.

## Security
- Passwords hashed using `bcryptjs`.
- JWT-based protected routes.
- OTP verification for sensitive actions.
- Disabled users are blocked from protected routes.
- Sensitive user data such as passwords is never returned in API responses.

## API Areas

### Auth APIs
- register
- verify register OTP
- login
- verify login OTP
- forgot password request OTP
- forgot password reset
- resend OTP
- get current user
- change password request OTP
- change password verify OTP

### User APIs
- fetch user roadmaps
- start roadmap
- fetch progress
- complete node
- fetch activity
- fetch dashboard stats

### Admin APIs
- fetch dashboard stats
- create roadmap
- fetch admin roadmaps
- toggle roadmap state
- fetch users
- make admin
- remove admin
- disable / enable student

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd PROJECT
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
```

### 3. Install backend dependencies
```bash
cd ../server
npm install
```

## Environment Variables

Create a `.env` file inside `server/` and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
EMAIL_FROM=Zenith <your_email>
EMAIL_SERVICE=Gmail
```

You can also use custom SMTP settings if needed.

## Run the Project

### Start backend
```bash
cd server
npm run dev
```

### Start frontend
```bash
cd frontend
npm run dev
```

## Future Improvements
- Search and filters in admin user list
- Better OTP UI with countdown and resend timer
- Notifications/toasts instead of alerts
- Avatar upload in profile
- Roadmap analytics per user
- Drag-and-drop node layout editing
- More admin controls like delete/suspend users

## Authors
Developed as a full-stack gamified roadmap learning platform project using React, Node.js, Express, and MongoDB.
