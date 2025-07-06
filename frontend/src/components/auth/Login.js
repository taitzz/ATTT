import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../assets/Login.module.css';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      setUser(response.data.user);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: response.data.message || 'Đăng nhập thành công!',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/home'); // Chuyển hướng về trang home
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.error || 'Đăng nhập thất bại',
      });
      setError(error.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: response.data.message || 'Đăng ký thành công!',
        timer: 2000,
        showConfirmButton: false,
      });
      setIsLoginMode(true); // Chuyển về form đăng nhập sau khi đăng ký
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.error || 'Đăng ký thất bại',
      });
      setError(error.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || (!isLoginMode && !email.trim())) {
      setError('Vui lòng điền đầy đủ các trường.');
      return;
    }

    if (isLoginMode) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>{isLoginMode ? 'Đăng nhập' : 'Đăng ký'}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.toggleButton} ${isLoginMode ? styles.active : ''}`}
          onClick={() => setIsLoginMode(true)}
          disabled={loading}
        >
          Đăng nhập
        </button>
        <button
          className={`${styles.toggleButton} ${!isLoginMode ? styles.active : ''}`}
          onClick={() => setIsLoginMode(false)}
          disabled={loading}
        >
          Đăng ký
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        {!isLoginMode && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        )}
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Đang xử lý...' : isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
};

export default Login;