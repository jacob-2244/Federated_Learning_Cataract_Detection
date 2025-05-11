'use client';
import React, { useState, useEffect } from 'react';
import { auth } from '@/app/firebase/config';
import Forms from './form';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Master({ children, page }) {
  const [user, loading] = useAuthState(auth);
  const [sidebarState, setSidebarState] = useState(false);

  const toggleSidebar = () => {
    setSidebarState((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarState) {
        setSidebarState(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarState]);

  return (
    <>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
        <div className="container mx-auto px-6 py-8">
          <Forms />
          
        </div>
      </main>
    </>
  );
}
