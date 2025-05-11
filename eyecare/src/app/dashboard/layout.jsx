


'use client';

import Link from "next/link";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { BounceLoader } from "react-spinners";
import { auth } from "@/app/firebase/config";
import Header from '../components/Header';
import Sidebar from "../components/Sidebar";
import '../styles/layout.css';

export default function DashboardLayout({ children }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = (event) => {
    event.stopPropagation(); // Prevent event from bubbling up
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      if (!loading) {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set a maximum loading time
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Increased to 3 seconds for better UX

    return () => clearTimeout(loadingTimeout);
  }, [router, loading]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-50">
        <BounceLoader color="#2563EB" size={60} />
        <p className="mt-4 text-blue-600">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-blue-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


