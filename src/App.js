// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/styles.css';
import Header from './components/layouts/Header';
import Home from './pages/HomePage';
import Login from './pages/LoginPage';
import Registration from './pages/RegistrationPage';
import Profile from './pages/ProfilePage';
import GameManagementPage from './pages/GameManagementPage';
import NotFound from './pages/NotFoundPage';

const App = () => {
  return (
      <Router>
        <div>
          <Header />
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<GameManagementPage />} />
              <Route element={NotFound} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
