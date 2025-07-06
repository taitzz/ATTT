import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../assets/PostForm.module.css';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/posts', {
        title,
        content,
        user_id: user.id,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Bài viết đã được tạo thành công!',
        timer: 2000,
        showConfirmButton: false,
      });
      setTitle('');
      setContent('');
      navigate('/posts');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.error || 'Tạo bài viết thất bại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Tạo bài viết</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        <textarea
          placeholder="Nội dung"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
          disabled={loading}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
    </div>
  );
};

export default PostForm;