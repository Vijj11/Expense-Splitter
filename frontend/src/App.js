import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import GroupsList from './components/GroupsList';
import CreateGroup from './components/CreateGroup';
import ExpensesList from './components/ExpensesList';
import CreateExpense from './components/CreateExpense';
import Profile from './components/Profile';
import { AuthContext } from './context/AuthContext';
import MobileLogin from './components/MobileLogin';
import InviteMembers from './components/InviteMembers';
import SplitCalculation from './components/SplitCalculation';
import Navbar from './components/Navbar';
import GroupDetail from './components/GroupDetail';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Notifications from './components/Notifications';
import Settlements from './components/Settlements';
import History from './components/History';
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />



function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/groups" /> : <MobileLogin />}
        />
        <Route
          path="/login/password"
          element={user ? <Navigate to="/groups" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/groups" /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Protected Routes */}
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/create"
          element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/create"
          element={
            <ProtectedRoute>
              <CreateExpense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id/invite"
          element={
            <ProtectedRoute>
              <InviteMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id/split"
          element={
            <ProtectedRoute>
              <SplitCalculation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              <GroupDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={<Notifications />}
        />
        <Route
          path="/settlements"
          element={
            <ProtectedRoute>
              <Settlements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={user ? "/groups" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;