'use client';
import React from 'react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' , marginTop: '100px'}}>
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
