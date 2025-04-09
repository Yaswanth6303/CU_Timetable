# CU Timetable Website 🎓

A modern web application for managing and viewing university timetables. Built with React, Node.js, and MongoDB.

## 🌟 Features

- 📊 Upload and manage timetable files (CSV/Excel)
- 🔐 Secure admin authentication
- 📱 Responsive design
- 🔍 Easy timetable viewing and searching
- 📤 Bulk file management

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Shadcn UI Components
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (File Upload)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Yaswanth6303/CU_Timetable_Website.git
   cd CU_Timetable_Website
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

### ⚙️ Configuration

1. **Backend Environment Variables**

   - `PORT`: Server port (default: 5000)
   - `MONGO_URI`: MongoDB connection string
   - `ADMIN_USERNAME`: Admin login username
   - `ADMIN_PASSWORD`: Admin login password
   - `JWT_SECRET`: Secret key for JWT tokens

2. **Frontend Environment Variables**
   - `VITE_API_URL`: Backend API URL

### 🏃‍♂️ Running the Application

1. **Start MongoDB**

   ```bash
   mongod
   ```

2. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Development Server**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 🔒 Admin Access

1. Navigate to the admin login page
2. Use the credentials configured in your backend `.env` file
3. After successful login, you'll have access to:
   - File upload functionality
   - File management
   - Timetable management

## 📝 File Upload Guidelines

- Supported formats: CSV and Excel files
- Files are automatically processed and stored
- Duplicate files are handled appropriately

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Yaswanth Gudivada
