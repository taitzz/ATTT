const { poolPromise } = require('../config/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    if (result.recordset.length > 0) {
      res.json({ message: 'Login successful', user: result.recordset[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
  try {
    const pool = await poolPromise;
    await pool.request().query(query);
    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};