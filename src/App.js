// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/styles.css';
import Header from './components/layouts/Header';
import Home from './pages/HomePage';
import Login from './pages/LoginPage';
import Registration from './pages/RegistrationPage';
import Profile from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import { getUserById } from './components/api/user';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({}); // User object to store user data [username, role, etc.

    useEffect(() => {
        const fetchData = async () => {
            // Check if authentication token exists in local storage
            if (localStorage.getItem('token') === null) {
                setIsAuthenticated(false);
                setUser({});
                return;
            }

            const authToken = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('userId');

            const user = await getUserById(storedUserId);

            if (authToken) {
                // User is authenticated
                setIsAuthenticated(true);
                setUser(user);
            } else {
                // User is not authenticated
                setIsAuthenticated(false);
                setUser({});
            }
        }

        fetchData();
    }, []);

    return (
      <Router>
        <div>
          <Header isAuthenticated={isAuthenticated} user={user} setIsAuthenticated={ setIsAuthenticated } setUser={ setUser }/>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setIsAuthenticated={ setIsAuthenticated } setUser={ setUser } />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/profile" element={<Profile user={user}/>} />
              <Route path="/admin" element={<AdminPage user={user}/>} />
              <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    );
}

export default App;
