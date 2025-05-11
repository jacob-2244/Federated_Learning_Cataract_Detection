// 'use client';

// import { useState, useEffect } from 'react';
// import { auth, db } from '@/app/firebase/config'; // Ensure you have the correct Firebase config
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import Link from 'next/link';

// const Sidebar = ({ isSidebarOpen }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true); // To handle loading state

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         try {
//           // Fetch user data from Firestore
//           const userDocRef = doc(db, 'users', currentUser.uid);
//           const userDoc = await getDoc(userDocRef);

//           if (userDoc.exists()) {
//             setUserData(userDoc.data()); // Set user data to state
//           } else {
//             console.error('User document not found');
//           }
//         } catch (err) {
//           console.error('Error fetching user data: ', err);
//         } finally {
//           setLoading(false); // Set loading to false once data is fetched
//         }
//       } else {
//         // console.error('No authenticated user found');
//         setLoading(false); // Set loading to false if no user
//       }
//     });

//     return () => unsubscribe(); // Cleanup listener
//   }, []);

//   // Show loading spinner or empty if no user data yet
//   if (loading) {
//     return <div></div>;
//   }

//   return (
//     <>
//       {/* Overlay */}
//       <div
//         className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
//       ></div>

//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}
//       >
//         <div className="flex items-center justify-center mt-8">
//           <div className="flex items-center">
//             {/* Avatar or Icon */}
//             <svg className="w-12 h-12" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path
//                 d="M364.61 390.213C304.625 450.196 207.37 450.196 147.386 390.213C117.394 360.22 102.398 320.911 102.398 281.6C102.398 242.291 117.394 202.981 147.386 172.989C147.386 230.4 153.6 281.6 230.4 307.2C230.4 256 256 102.4 294.4 76.7999C320 128 334.618 142.997 364.608 172.989C394.601 202.981 409.597 242.291 409.597 281.6C409.597 320.911 394.601 360.22 364.61 390.213Z"
//                 fill="#4C51BF"
//                 stroke="#4C51BF"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//               <path d="M201.694 387.105C231.686 417.098 280.312 417.098 310.305 387.105C325.301 372.109 332.8 352.456 332.8 332.8C332.8 313.144 325.301 293.491 310.305 278.495C295.309 263.498 288 256 275.2 230.4C256 243.2 243.201 320 243.201 345.6C201.694 345.6 179.2 332.8 179.2 332.8C179.2 352.456 186.698 372.109 201.694 387.105Z" fill="white" />
//             </svg>

//             <span className="mx-2 text-2xl font-semibold text-white">
//               Hi, {userData?.username || 'User'} {/* Display username or fallback to 'User' */}
//             </span>
//           </div>
//         </div>
//         <nav className="mt-10">
//           <Link
//             className="flex items-center px-6 py-2 mt-4 text-gray-100 bg-gray-700 bg-opacity-25"
//             href="/dashboard"
//             onClick={() => {
//               setSidebarOpen(false);
//             }}
//           >
//             <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
//             </svg>
//             <span className="mx-3">Details</span>
//           </Link>
//           {userData?.role == "patient" && (
//             <>
//               <Link
//                 className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
//                 href="/dashboard/Appointments"
//               >
//                 <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
//                 </svg>
//                 <span className="mx-3">Online Appointments</span>
//               </Link>

//               <Link
//                 className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
//                 href="/dashboard/Chat"
//                 onClick={() => {
//                   setSidebarOpen(false);
//                 }}
//               >
//                 <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//                 </svg>
//                 <span className="mx-3">Chatting</span>
//               </Link>

//               <Link
//                 className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
//                 href="/dashboard/Report"
//                 onClick={() => {
//                   setSidebarOpen(false);
//                 }}
//               >
//                 <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                 </svg>
//                 <span className="mx-3">Report</span>
//               </Link>
//             </>
//           )}
//           {userData?.role == "doctor" && (
//             <>
//             <Link
//               className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
//               href="/dashboard/Appointments"
//             >
//               <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
//               </svg>
//               <span className="mx-3">Online Appointments</span>
//             </Link>

//             <Link
//               className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
//               href="/dashboard/Chat"
//               onClick={() => {
//                 setSidebarOpen(false);
//               }}
//             >
//               <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//               </svg>
//               <span className="mx-3">Chatting</span>
//             </Link>

//             <Link
//               className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
//               href="/dashboard/Report"
//               onClick={() => {
//                 setSidebarOpen(false);
//               }}
//             >
//               <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//               </svg>
//               <span className="mx-3">Report</span>
//             </Link>
//           </>
//           )}
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Sidebar;




'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/app/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { BounceLoader } from 'react-spinners';
import { FaUser, FaCalendarAlt, FaComments, FaFileAlt, FaHome } from 'react-icons/fa';

const Sidebar = ({ isSidebarOpen }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error('User document not found');
          }
        } catch (err) {
          console.error('Error fetching user data: ', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <BounceLoader color="#2563EB" size={40} />
  //     </div>
  //   );
  // }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gradient-to-b from-blue-600 to-blue-500 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white">
              <FaUser size={24} />
            </div>
            <span className="mx-3 text-xl font-semibold text-white">
              Hi, {userData?.username || 'User'}
            </span>
          </div>
        </div>

        <nav className="mt-10 px-4">
          <Link
            className="flex items-center px-4 py-3 mt-2 text-white bg-blue-700 bg-opacity-30 rounded-lg"
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <FaHome className="w-5 h-5" />
            <span className="mx-3">Dashboard</span>
          </Link>

          {userData?.role === "patient" && (
            <>
              <Link
                className="flex items-center px-4 py-3 mt-2 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white rounded-lg transition-colors"
                href="/dashboard/Appointments"
              >
                <FaCalendarAlt className="w-5 h-5" />
                <span className="mx-3">Appointments</span>
              </Link>

              <Link
                className="flex items-center px-4 py-3 mt-2 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white rounded-lg transition-colors"
                href="/dashboard/Chat"
                onClick={() => setSidebarOpen(false)}
              >
                <FaComments className="w-5 h-5" />
                <span className="mx-3">Chat</span>
              </Link>

              <Link
                className="flex items-center px-4 py-3 mt-2 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white rounded-lg transition-colors"
                href="/dashboard/Report"
                onClick={() => setSidebarOpen(false)}
              >
                <FaFileAlt className="w-5 h-5" />
                <span className="mx-3">Reports</span>
              </Link>
            </>
          )}

          {userData?.role === "doctor" && (
            <>
              <Link
                className="flex items-center px-4 py-3 mt-2 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white rounded-lg transition-colors"
                href="/dashboard/Appointments"
              >
                <FaCalendarAlt className="w-5 h-5" />
                <span className="mx-3">Appointments</span>
              </Link>

              <Link
                className="flex items-center px-4 py-3 mt-2 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white rounded-lg transition-colors"
                href="/dashboard/Chat"
                onClick={() => setSidebarOpen(false)}
              >
                <FaComments className="w-5 h-5" />
                <span className="mx-3">Chat</span>
              </Link>

              <Link
                className="flex items-center px-4 py-3 mt-2 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white rounded-lg transition-colors"
                href="/dashboard/Report"
                onClick={() => setSidebarOpen(false)}
              >
                <FaFileAlt className="w-5 h-5" />
                <span className="mx-3">Reports</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;