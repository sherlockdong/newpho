'use client';
import React from 'react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' , marginTop: '100px'}}>
      <h1>404</h1>
      <p>Soryy! This part of the universe of physics is still completely dark. </p>
      <Link href="/" style={{ color: 'orange', textDecoration: 'underline' ,fontSize:'20px'}}>
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
