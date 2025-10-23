# 💬 ChatX - Real-time Messaging Platform

<div align="center">

![ChatX Banner](https://img.shields.io/badge/ChatX-Real--time%20Chat-00d9ff?style=for-the-badge&logo=socket.io&logoColor=white)

**A modern, feature-rich real-time messaging application built with the MERN stack**

[![React](https://img.shields.io/badge/React-18.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47a248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**ChatX** is a full-stack real-time messaging platform that brings people together through seamless communication. Whether you're chatting one-on-one or collaborating in groups, ChatX delivers a fast, reliable, and beautiful messaging experience with enterprise-grade features.

Built with modern web technologies and best practices, ChatX showcases advanced real-time communication, state management, and responsive design patterns.

---

## ✨ Features

### 💬 **Messaging & Communication**
- **Real-time Messaging** - Instant message delivery using WebSocket technology
- **Group Chats** - Create and manage group conversations with multiple members
- **Reply to Messages** - Quote and respond to specific messages in conversations
- **Typing Indicators** - See when others are typing in real-time
- **Delete Messages** - Remove sent messages for all participants
- **Rich Media Support** - Share images seamlessly with Cloudinary integration
- **Emoji Picker** - Express yourself with a vast emoji library

### 👥 **User Experience**
- **Online Status** - Real-time presence indicators for all users
- **User Profiles** - Customizable profiles with avatars
- **Contact Management** - Easy-to-use contact list and chat history
- **Smart Notifications** - Optional sound alerts for new messages
- **Search & Filter** - Quickly find conversations and contacts

### 👑 **Group Chat Features**
- **Group Creation** - Start group chats with custom names and avatars
- **Member Management** - Add or remove members (admin controls)
- **Admin Privileges** - Dedicated admin tools for group management
- **Group Info** - View member lists and group details
- **Leave Groups** - Members can exit groups at any time

### 🎨 **Design & Interface**
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Dark Theme** - Eye-friendly design for extended use
- **Keyboard Sounds** - Optional typing sound effects
- **Mobile-First** - Touch-optimized controls and navigation

### 🔐 **Security & Performance**
- **JWT Authentication** - Secure token-based authentication
- **HTTP-Only Cookies** - Protected session management
- **Password Encryption** - bcrypt hashing for user passwords
- **Rate Limiting** - Arcjet integration for API protection
- **Optimistic Updates** - Instant UI feedback for better UX
- **Image Optimization** - Automatic image processing via Cloudinary

---

## 🎬 Demo

> **Note:** Add your deployment link here once deployed

```
🌐 Live Demo: [Your Deployment URL]
📧 Test Account: demo@chatx.com
🔑 Password: demo123
```

---

## 🛠 Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time bidirectional communication
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Beautiful Tailwind components
- **Axios** - Promise-based HTTP client
- **React Hot Toast** - Elegant notifications
- **Lucide React** - Beautiful icon library
- **Emoji Picker React** - Comprehensive emoji support

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js 5** - Fast web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time engine
- **JWT** - JSON Web Tokens for auth
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting and optimization
- **Resend** - Transactional email service
- **Arcjet** - Security and rate limiting
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling

### **Development Tools**
- **Nodemon** - Auto-restart development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v8.x or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** - Comes with Node.js

---

## 🚀 Installation

### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/phani-manda/chatX.git
cd chatX
```

### 2️⃣ **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section below)
# Add your environment variables

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5001`

### 3️⃣ **Frontend Setup**

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🔐 Environment Variables

### **Backend** (`backend/.env`)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_key_min_32_characters

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Resend API (for email functionality)
RESEND_API_KEY=your_resend_api_key

# Arcjet (for security and rate limiting)
ARCJET_KEY=your_arcjet_key

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### **How to Get API Keys:**

#### 🗄️ **MongoDB**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

#### ☁️ **Cloudinary** (Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

#### 📧 **Resend** (Email Service)
1. Sign up at [Resend](https://resend.com/)
2. Go to API Keys
3. Create and copy your API key

#### 🛡️ **Arcjet** (Security)
1. Sign up at [Arcjet](https://arcjet.com/)
2. Create a new site/app
3. Copy your site key

---

## 📁 Project Structure

```
chatX/
├── backend/
│   ├── src/
│   │   ├── controller/       # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── message.controller.js
│   │   │   └── group.controller.js
│   │   ├── emails/          # Email templates
│   │   ├── lib/             # Utilities and configs
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   ├── socket.js
│   │   │   └── env.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── arcjet.middleware.js
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── user.js
│   │   │   ├── message.js
│   │   │   ├── group.js
│   │   │   └── groupMessage.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── message.route.js
│   │   │   └── group.route.js
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── GroupChatContainer.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── GroupHeader.jsx
│   │   │   ├── CreateGroupModal.jsx
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities
│   │   ├── pages/          # Page components
│   │   │   ├── ChatPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── store/          # Zustand state stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   └── useGroupStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## 💡 Usage

### **Getting Started**

1. **Sign Up** - Create your account with email and password
2. **Set Profile** - Add a profile picture and customize your profile
3. **Start Chatting** - Select a contact or create a group to begin

### **Messaging Features**

- **Send Messages** - Type and send text messages instantly
- **Share Images** - Click the image icon to upload and share photos
- **Add Emojis** - Click the smile icon to open the emoji picker
- **Reply** - Hover over a message and click "Reply" to quote it
- **Delete** - Hover over your message and click "Delete" to remove it

### **Group Chat**

1. Click the "Groups" tab in the sidebar
2. Click "New" or "Create First Group"
3. Select at least 2 members
4. Add a name and optional description/avatar
5. Click "Create Group"

**As Admin:**
- Edit group details (name, description, avatar)
- Add new members
- Remove members
- Transfer admin rights

**As Member:**
- View group info
- Leave group

---

## 📸 Screenshots

> **Manual Step:** Add screenshots of your application here

```markdown
### Chat Interface
![Chat Interface](screenshots/chat-interface.png)

### Group Chat
![Group Chat](screenshots/group-chat.png)

### Mobile View
![Mobile View](screenshots/mobile-view.png)
```

---

## 🧪 Testing

### **Manual Testing Checklist**

- [ ] User registration and login
- [ ] Profile picture upload
- [ ] Send text messages
- [ ] Send images
- [ ] Reply to messages
- [ ] Delete messages
- [ ] Create group chat
- [ ] Add/remove group members
- [ ] Typing indicators
- [ ] Online status updates
- [ ] Mobile responsiveness
- [ ] Multiple browser sessions

---

## 🚀 Deployment

### **Backend Deployment (Railway/Render/Heroku)**

1. Create an account on your chosen platform
2. Connect your GitHub repository
3. Add all environment variables
4. Deploy the `backend` folder
5. Note your backend URL

### **Frontend Deployment (Vercel/Netlify)**

1. Create an account on Vercel or Netlify
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=your_backend_url`
6. Deploy

### **Update Backend for Production**

Update `backend/src/lib/env.js` to include your production frontend URL in `CLIENT_URL`.

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues & Limitations

- Email verification feature is in development
- Voice/video calling not yet implemented
- Message search functionality coming soon
- File sharing limited to images only

---

## 📈 Future Enhancements

- [ ] Voice and video calling
- [ ] Message reactions (emoji reactions)
- [ ] Read receipts
- [ ] Message search
- [ ] File sharing (documents, videos)
- [ ] End-to-end encryption
- [ ] Message forwarding
- [ ] Dark/light theme toggle
- [ ] Multi-language support
- [ ] Desktop application (Electron)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Phani Manda**

- GitHub: [@phani-manda](https://github.com/phani-manda)
- LinkedIn: [Your LinkedIn Profile](#) <!-- Add your LinkedIn -->
- Email: [Your Email](#) <!-- Add your email -->

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)
- Icons by [Lucide](https://lucide.dev/)
- Inspiration from modern chat applications

---

## 📞 Support

If you found this project helpful, please give it a ⭐️!

For support, email [your-email] or open an issue in the repository.

---

<div align="center">

**Made with ❤️ and ☕ by Phani Manda**

⭐ Star this repository if you find it useful!

</div>
