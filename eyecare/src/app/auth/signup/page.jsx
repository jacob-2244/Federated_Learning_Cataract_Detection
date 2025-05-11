


'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import Link from 'next/link';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { BounceLoader } from 'react-spinners';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = document.cookie.split(';').find((c) => c.trim().startsWith('token='));
    const isLoggedIn = token && auth.currentUser;
  
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !role) {
      setError('All fields, including role selection, are required.');
      setSuccess('');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        role,
        createdAt: new Date().toISOString(),
      });

      setSuccess('Signup successful! Please verify your email to continue.');
      setError('');
      setIsCheckingVerification(true);

      setUsername('');
      setEmail('');
      setPassword('');
      setRole('');

      const checkVerification = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkVerification);
          setIsCheckingVerification(false);
          router.push('/auth/login');
        }
      }, 3000);
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-50">
        <BounceLoader color="#2563EB" size={60} />
        <p className="text-gray-700 mt-4">Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-blue-100">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-blue-800">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join our Eyecare platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-blue-800 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onFocus={() => setError('')}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-800 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onFocus={() => setError('')}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-800 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onFocus={() => setError('')}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Create a password"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-800">You're a:</p>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === 'patient'}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setError('');
                  }}
                  className="text-blue-600 focus:ring-blue-300"
                />
                <span>Patient</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setError('');
                  }}
                  className="text-blue-600 focus:ring-blue-300"
                />
                <span>Doctor</span>
              </label>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
              {success}
            </div>
          )}
          
          {isCheckingVerification && (
            <div className="p-3 bg-blue-50 text-blue-600 text-sm rounded-lg flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking email verification status...
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isCheckingVerification}
          >
            {isCheckingVerification ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

