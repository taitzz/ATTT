import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../../assets/Register.module.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: response.data.message || 'Đăng ký thành công!',
        timer: 2000,
        showConfirmButton: false,
      });
      setUsername('');
      setEmail('');
      setPassword('');
      navigate('/'); // Chuyển hướng về trang đăng nhập
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.error || 'Đăng ký thất bại',
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Đăng ký</h2>
      <input
        type="text"
        placeholder="Tên người dùng"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleRegister} className={styles.button}>
        Đăng ký
      </button>
    </div>
  );
};

export default Register;