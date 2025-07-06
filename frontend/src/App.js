import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from './context/AuthContext';
import Login from './components/auth/Login';
import PostList from './components/posts/PostList';
import PostForm from './components/posts/PostForm';
import Home from './components/posts/Home';
import styles from './assets/App.module.css';

const App = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Bạn có chắc chắn?',
      text: 'Bạn sẽ được đăng xuất.',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      setUser(null);
      Swal.fire({
        icon: 'success',
        title: 'Đã đăng xuất',
        text: 'Bạn đã đăng xuất thành công!',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/');
    }
  };

  return (
    <div className={styles.appContainer}>
      {user ? (
        <nav className={styles.nav}>
          <NavLink
            to="/home"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/all"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            All
          </NavLink>
          <NavLink
            to="/posts"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            Posts
          </NavLink>
          <NavLink
            to="/create-post"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            Create Post
          </NavLink>
          <span className={styles.welcome}>Chào, {user.username}</span>
          <button onClick={handleLogout} className={styles.logout}>
            Đăng xuất
          </button>
        </nav>
      ) : (
        <nav className={styles.nav}>
          <span className={styles.welcome}>Vui lòng đăng nhập</span>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/all" element={<PostList isAllPosts={true} />} />
        <Route path="/posts" element={<PostList isAllPosts={false} />} />
        <Route path="/create-post" element={<PostForm />} />
      </Routes>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;