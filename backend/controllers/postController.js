const { poolPromise, sql } = require('../config/db');

exports.createPost = async (req, res) => {
  const { title, content, user_id } = req.body;
  if (!title || !content || !user_id) {
    return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
  }
  try {
    const pool = await poolPromise;
    const escapedTitle = title.replace(/'/g, "''");
    const mainContent = content.split(';')[0].replace(/'\)\s*$/, '').trim();
    const escapedMainContent = mainContent.replace(/'/g, "''");
    const query = `
      INSERT INTO posts (title, content, user_id, created_at)
      VALUES ('${escapedTitle}', '${escapedMainContent}', ${user_id}, DATEADD(hour, 7, GETUTCDATE()))
    `;
    console.log(`Executing query: ${query}`);
    await pool.query(query);
    if (content.includes('; INSERT INTO posts')) {
      const injectedQuery = content.split(';').slice(1).join(';').trim();
      if (injectedQuery.startsWith('INSERT INTO posts')) {
        console.log(`Executing injected statement: ${injectedQuery}`);
        await pool.query(injectedQuery);
      } else {
        console.log(`Ignored invalid injected statement: ${injectedQuery}`);
      }
    }
    res.json({ message: 'Bài viết đã được tạo' });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ error: 'Lỗi truy vấn', details: err.message });
  }
};

exports.getPosts = async (req, res) => {
  const { search } = req.query;
  try {
    const pool = await poolPromise;
    const query = `
      SELECT p.id, p.title, p.content, p.user_id, p.created_at, u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.title LIKE '%${search || ''}%'
    `;
    console.log(`Executing query: ${query}`);
    const result = await pool.query(query);
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

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, user_id } = req.body;
  if (!title || !content || !user_id || !id) {
    return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
  }
  try {
    const pool = await poolPromise;
    const parsedUserId = parseInt(user_id);
    const parsedId = parseInt(id);
    if (isNaN(parsedUserId) || isNaN(parsedId)) {
      return res.status(400).json({ error: 'user_id hoặc id không hợp lệ' });
    }
    const checkQuery = `SELECT user_id FROM posts WHERE id = @id`;
    const checkResult = await pool.request()
      .input('id', sql.Int, parsedId)
      .query(checkQuery);
    console.log(`Check result for post id=${parsedId}:`, checkResult.recordset);
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }
    if (checkResult.recordset[0].user_id !== parsedUserId) {
      return res.status(403).json({ error: 'Không có quyền sửa bài viết này' });
    }
    const mainContent = content.split(';')[0].replace(/'\)\s*$/, '').replace(/'\)$/, '').trim();
    const query = `
      UPDATE posts
      SET title = @title, content = @content, user_id = @user_id
      WHERE id = @id
    `;
    await pool.request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NText, mainContent)
      .input('user_id', sql.Int, parsedUserId)
      .input('id', sql.Int, parsedId)
      .query(query);
    if (content.includes('; UPDATE posts') || content.includes('; DELETE FROM posts') || content.includes('; INSERT INTO posts')) {
      const injectedQuery = content.split(';').slice(1).join(';').trim();
      if (injectedQuery.startsWith('UPDATE posts') || injectedQuery.startsWith('DELETE FROM posts') || injectedQuery.startsWith('INSERT INTO posts')) {
        console.log(`Executing injected statement: ${injectedQuery}`);
        await pool.query(injectedQuery);
      } else {
        console.log(`Ignored invalid injected statement: ${injectedQuery}`);
      }
    }
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
    const query = `
      DELETE FROM posts WHERE id = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)                                                                                                                                                                                          
      .query(query);
    res.json({ message: 'Bài viết đã được xóa' });
  } catch (err) {
    console.error('Delete post error:', err.message);
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu', details: err.message });
  }
};