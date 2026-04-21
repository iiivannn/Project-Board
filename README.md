# Project Board

A modern, full-stack project management application with drag-and-drop functionality, task tracking, and reward systems. Built with Next.js 14, TypeScript, and PostgreSQL.

## Quick Links

- 🚀 [Live Demo](https://project-board-eosin.vercel.app/) - Try it now!
- ✨ [Features](#-features) - Discover the project
- 🛠️ [Tech Stack](#️-tech-stack) - View tools used in the project
- 🎨 [Design Features](#-design-features) - UI/UX principles applied
- 🔒 [Security Features](#-security-features) - Data security using backend

## ✨ Features

### 🎨 **Kanban Board**

- Drag-and-drop projects between project status (To Do → In Progress → Complete → Obsolete)
- Touch-enabled for mobile devices
- Smooth animations and transitions
- Real-time status updates

### 📝 **Task Management**

- Create and organize projects
- Add detailed task logs with timestamps
- Edit and delete logs inline
- Track progress across all projects

### 🎁 **Reward System**

- Add rewards for completed projects
- Password-protected reward editing
- View all rewards in Details page

### 🔐 **Security**

- NextAuth.js authentication
- Password-protected sensitive actions
- Bcrypt password hashing
- Session-based authorization

### 🌓 **Theme System**

- Dark mode (default)
- Light mode
- Persistent user preferences
- Smooth theme transitions

### 📱 **Responsive Design**

- Mobile-first approach
- Hamburger navigation on mobile
- Touch-optimized drag-and-drop
- Works on all screen sizes

<br/>

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **SCSS** - Custom styling with CSS variables
- **@dnd-kit** - Drag and drop library
- **NextAuth.js** - Client-side authentication

</td>
<td valign="top" width="50%">

### Backend

- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Database management
- **PostgreSQL** - Relational database
- **Vercel Postgres** - Hosted database
- **bcryptjs** - Password encryption

</td>
</tr>
</table>

<br/>

## 🎨 Design Features

### Theme System

- **CSS Variables** for consistent theming
- **Dark Mode** (default)
- **Light Mode**
- Persistent user preference stored in database

### Responsive Breakpoints

- **Mobile:** < 768px (Hamburger menu, single column)
- **Tablet:** 768px - 1400px (Two-column layout)
- **Desktop:** > 1400px (Four-column layout)

### Animations

- Smooth card dragging with rotation effect
- Fade-in transitions on load
- Loading screen with progress animation
- Theme transition animations

<br/>

## 🔒 Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **Session Management:** JWT-based sessions with NextAuth.js
- **Protected Routes:** Middleware guards for `/dashboard/*`
- **Action Verification:** Password required for:
  - Editing project details
  - Modifying rewards
  - Deleting projects
  - Changing username/password
- **SQL Injection Protection:** Prisma ORM with parameterized queries

<br/>

<div align="center">

**Made while caffeinated ☕**

</div>
