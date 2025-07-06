const { poolPromise, sql } = require('../config/db');

exports.getPosts = async (req, res) => {
  const { search } = req.query;
  try {
    const pool = await poolPromise;
    const query = `
      SELECT p.id, p.title, p.content, p.user_id, p.created_at, u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.title LIKE '%' + @search + '%'
    `;
    const result = await pool.request()
      .input('search', sql.NVarChar, search || '')
      .query(query);
    // Thêm múi giờ +07:00 vào created_at
    const posts = result.recordset.map(post => ({
      ...post,
      created_at: new Date(post.created_at).toISOString().replace('Z', '+07:00')
    }));
    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu', details: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  const { search, user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'Thiếu user_id' });
  }
  try {
    const pool = await poolPromise;
    const query = `
      SELECT p.id, p.title, p.content, p.user_id, p.created_at, u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = @user_id AND p.title LIKE '%' + @search + '%'
    `;
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('search', sql.NVarChar, search || '')
      .query(query);
    // Thêm múi giờ +07:00 vào created_at
    const posts = result.recordset.map(post => ({
      ...post,
      created_at: new Date(post.created_at).toISOString().replace('Z', '+07:00')
    }));
    res.json(posts);
  } catch (err) {
    console.error('Get my posts error:', err.message);
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu', details: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { title, content, user_id } = req.body;
  if (!title || !content || !user_id) {
    return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
  }
  try {
    const pool = await poolPromise;
    const query = `
      INSERT INTO posts (title, content, user_id, created_at)
      OUTPUT INSERTED.id, INSERTED.title, INSERTED.content, INSERTED.user_id, INSERTED.created_at
      VALUES (@title, @content, @user_id, DATEADD(hour, 7, GETUTCDATE()))
    `;
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NText, content)
      .input('user_id', sql.Int, user_id)
      .query(query);
    // Thêm múi giờ +07:00 vào created_at
    const post = {
      ...result.recordset[0],
      created_at: new Date(result.recordset[0].created_at).toISOString().replace('Z', '+07:00')
    };
    res.json({ message: 'Bài viết đã được tạo', post });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu', details: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, user_id } = req.body;
  try {
    const pool = await poolPromise;
    const query = `
      UPDATE posts
      SET title = @title, content = @content, user_id = @user_id
      WHERE id = @id
    `;
    await pool.request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NText, content)
      .input('user_id', sql.Int, user_id)
      .input('id', sql.Int, id)
      .query(query);
    res.json({ message: 'Bài viết đã được cập nhật' });
  } catch (err) {
    console.error('Update post error:', err.message);
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu', details: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const query = `DELETE FROM posts WHERE id = @id`;
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    res.json({ message: 'Bài viết đã được xóa' });
  } catch (err) {
    console.error('Delete post error:', err.message);
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu', details: err.message });
  }
};