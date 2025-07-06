import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../assets/Home.module.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Welcome to Our Online Forum</h1>
      <p className={styles.description}>
        {user
          ? `Hello, ${user.username}! This is a demo online forum designed to showcase SQL injection vulnerabilities. Explore posts, create new content, or try testing the security of this platform.`
          : 'This is a demo online forum designed to showcase SQL injection vulnerabilities. Please log in or register to participate in discussions.'}
      </p>
      <div className={styles.featuredSection}>
        <h2 className={styles.subtitle}>Featured Posts</h2>
        <p className={styles.placeholder}>
          (Placeholder: Featured posts will be displayed here. Integrate with API to fetch posts for SQL injection demo.)
        </p>
      </div>
    </div>
  );
};

export default Home;