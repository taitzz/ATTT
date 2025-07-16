import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from '../../assets/PostList.module.css';

const PostList = ({ isAllPosts }) => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = isAllPosts
          ? `http://localhost:5000/api/posts?search=${search}`
          : `http://localhost:5000/api/posts/my-posts?search=${search}&user_id=${user?.id || ''}`;
        const response = await axios.get(url);
        setPosts(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.response?.data?.error || 'Không thể tải danh sách bài viết. Vui lòng thử lại.',
        });
      } finally {
        setLoading(false);
      }
    };
    if (isAllPosts || user) {
      fetchPosts();
    }
  }, [search, isAllPosts, user]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Bạn có chắc chắn?',
      text: 'Hành động này không thể hoàn tác.',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/posts/${id}`);
        setPosts(posts.filter((post) => post.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa',
          text: 'Bài viết đã được xóa thành công!',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.response?.data?.error || 'Xóa bài viết thất bại',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = async (post) => {
    const { value: formValues } = await Swal.fire({
      title: 'Chỉnh sửa bài viết',
      html:
        `<input id="swal-input-title" class="swal2-input" placeholder="Tiêu đề" value="${post.title}" required>` +
        `<textarea id="swal-input-content" class="swal2-textarea" placeholder="Nội dung" required>${post.content}</textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const title = document.getElementById('swal-input-title').value;
        const content = document.getElementById('swal-input-content').value;
        if (!title.trim() || !content.trim()) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ tiêu đề và nội dung');
          return false;
        }
        return { title, content };
      },
    });

    if (formValues) {
      setLoading(true);
      try {
        const response = await axios.put(`http://localhost:5000/api/posts/${post.id}`, {
          title: formValues.title,
          content: formValues.content,
          user_id: user.id,
        });
        setPosts(posts.map((p) => (p.id === post.id ? { ...p, title: formValues.title, content: formValues.content } : p)));
        Swal.fire({
          icon: 'success',
          title: 'Đã cập nhật',
          text: response.data.message || 'Bài viết đã được cập nhật thành công!',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.response?.data?.error || 'Cập nhật bài viết thất bại',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.postListContainer}>
      <h2 className={styles.title}>{isAllPosts ? 'Tất cả bài viết' : 'Bài viết của tôi'}</h2>
      <input
        type="text"
        placeholder="Tìm kiếm bài viết..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
        disabled={loading}
      />
      {loading ? (
        <p className={styles.postContent}>Đang tải bài viết...</p>
      ) : posts.length === 0 ? (
        <p className={styles.postContent}>Không tìm thấy bài viết.</p>
      ) : (
        <div className={styles.postsWrapper}>
          {posts.map((post) => (
            <div key={post.id} className={styles.postItem}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postContent}>{post.content}</p>
              <p className={styles.postMeta}>
                Được tạo bởi: <span>{post.username}</span> |{' '}
                {format(new Date(post.created_at), 'dd/MM/yyyy, HH:mm', { locale: vi })}
              </p>
              {user && !isAllPosts && post.user_id === user.id && (
                <div className={styles.buttonGroup}>
                  <button onClick={() => handleEdit(post)} className={styles.button} disabled={loading}>
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(post.id)} className={styles.deleteButton} disabled={loading}>
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;