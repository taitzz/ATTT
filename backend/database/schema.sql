CREATE DATABASE forum_db;
GO
USE forum_db;
GO

CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL,
  email NVARCHAR(100) NOT NULL,
  password NVARCHAR(255) NOT NULL
);

CREATE TABLE posts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  user_id INT,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Dữ liệu mẫu
INSERT INTO users (username, email, password) VALUES
('admin', 'admin@gmail.com', 'admin123'),
('user1', 'user1@gmail.com', 'user123');

INSERT INTO posts (title, content, user_id, created_at) VALUES
('First Post', 'This is a sample post.', 1, DATEADD(hour, 7, GETUTCDATE())),
('Second Post', 'Another post for testing.', 2, DATEADD(hour, 7, GETUTCDATE()));
GO
