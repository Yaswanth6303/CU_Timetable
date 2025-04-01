import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import AdminLogin from "./components/admin/AdminDashboard/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard/AdminDashboard";
import UserDashboard from "./components/user/UserDashboard";

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/admin/login"
            element={
              !isAdminAuthenticated ? (
                <AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />
              ) : (
                <Navigate to="/admin/dashboard" />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              isAdminAuthenticated ? (
                <AdminDashboard
                  setIsAdminAuthenticated={setIsAdminAuthenticated}
                />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/" element={<Navigate to="/user" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
