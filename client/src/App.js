import React, { Fragment, useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import FeedPage from './pages/Feed/Feed';
import SinglePostPage from './pages/Feed/SinglePost/SinglePost';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import './App.css';
import auth from './pages/Auth/Auth';

const App = () => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    const userId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    setIsAuth(true);
    setToken(token);
    setUserId(userId);
    setAutoLogout(remainingMilliseconds);
  }, []);

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const errorHandler = () => {
    setError(null);
  };

  const mobileNavHandler = isOpen => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  };

  const loginHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);
    fetch('http://localhost:8080/server/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.email,
        password: authData.password
      })
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not authenticate you!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        setToken(resData.token);
        setUserId(resData.userId);
        setIsAuth(true);
        setAuthLoading(false);
        localStorage.setItem('token', resData.token);
        localStorage.setItem('userId', resData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      })
      .catch(err => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const logoutHandler = () => {
    setIsAuth(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);
    fetch('http://localhost:8080/server/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.signupForm.email.value,
        password: authData.signupForm.password.value,
        name: authData.signupForm.name.value
      })
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Creating a user failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        setIsAuth(false);
        setAuthLoading(false);
        navigate('/', { replace: true });
      })
      .catch(err => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const setAutoLogout = milliseconds => {
    setTimeout(() => {
      logoutHandler();
    }, milliseconds);
  };

  const routes = () => {
    if (isAuth) {
      return (
        <Routes>
          <Route
            path="/"
            element={<FeedPage userId={userId} token={token} />}
          />
          <Route
            path="/:postId"
            element={<SinglePostPage userId={userId} token={token} />}
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      );
    }
    return (
      <Routes>
        <Route
          path="/"
          element={<LoginPage onLogin={loginHandler} loading={authLoading} />}
        />
        <Route
          path="/signup"
          element={<SignupPage onSignup={signupHandler} loading={authLoading} />}
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    );
  };

  return (
    <Fragment>
      {showBackdrop && (
        <Backdrop onClick={backdropClickHandler} />
      )}
      <ErrorHandler error={error} onHandle={errorHandler} />
      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={() => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={() => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />
      {routes()}
    </Fragment>
  );
};

export default App;
