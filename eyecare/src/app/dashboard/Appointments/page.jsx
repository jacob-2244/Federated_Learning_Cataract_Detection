






// 'use client';
// import { useState, useEffect } from 'react';
// import { auth, db } from '@/app/firebase/config';
// import { useRouter } from 'next/navigation';
// import {
//   getDocs,
//   collection,
//   query,
//   where,
//   addDoc,
//   serverTimestamp,
//   updateDoc,
//   doc,
// } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
// import { BounceLoader } from 'react-spinners';
// import { FaStar, FaStarHalfAlt, FaRegStar, FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa';

// const AppointmentsPage = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [reviews, setReviews] = useState({});
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     date: '',
//     time: '',
//     doctorId: '',
//     reason: '',
//   });
//   const [reviewForm, setReviewForm] = useState({
//     doctorId: '',
//     rating: 0,
//     comment: '',
//     hoverRating: 0,
//   });

//   const router = useRouter();

//   const fetchDoctors = async () => {
//     try {
//       const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
//       const querySnapshot = await getDocs(q);
//       const doctorsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setDoctors(doctorsList);
      
//       doctorsList.forEach(doctor => {
//         fetchDoctorReviews(doctor.id);
//       });
//     } catch (error) {
//       console.error('Error fetching doctors:', error);
//     }
//   };

//   const fetchDoctorReviews = async (doctorId) => {
//     try {
//       const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
//       const querySnapshot = await getDocs(q);
//       const reviewsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
      
//       setReviews(prev => ({
//         ...prev,
//         [doctorId]: reviewsList
//       }));
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//     }
//   };

//   const fetchPatientAppointments = async (patientUid) => {
//     try {
//       const q = query(collection(db, 'appointments'), where('patientId', '==', patientUid));
//       const querySnapshot = await getDocs(q);
//       const appointmentsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setAppointments(appointmentsList);
//     } catch (error) {
//       console.error('Error fetching patient appointments:', error);
//     }
//   };

//   const fetchDoctorAppointments = async (doctorUid) => {
//     try {
//       const q = query(collection(db, 'appointments'), where('doctorId', '==', doctorUid));
//       const querySnapshot = await getDocs(q);
//       const appointmentsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setAppointments(appointmentsList);
//     } catch (error) {
//       console.error('Error fetching doctor appointments:', error);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           const q = query(collection(db, 'users'), where('email', '==', user.email));
//           const querySnapshot = await getDocs(q);

//           if (!querySnapshot.empty) {
//             const docRef = querySnapshot.docs[0];
//             const userData = docRef.data();

//             const combinedUser = {
//               id: docRef.id,
//               uid: user.uid,
//               ...userData,
//             };

//             setCurrentUser(combinedUser);

//             if (userData.role === 'patient') {
//               await fetchDoctors();
//               await fetchPatientAppointments(user.uid);
//             } else if (userData.role === 'doctor') {
//               await fetchDoctorAppointments(user.uid);
//               await fetchDoctorReviews(docRef.id);
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         router.push('/auth/login');
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleReviewChange = (e) => {
//     const { name, value } = e.target;
//     setReviewForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleStarClick = (rating) => {
//     setReviewForm(prev => ({ ...prev, rating }));
//   };

//   const handleStarHover = (hoverRating) => {
//     setReviewForm(prev => ({ ...prev, hoverRating }));
//   };

//   const handleStarLeave = () => {
//     setReviewForm(prev => ({ ...prev, hoverRating: 0 }));
//   };

//   const handleBookAppointment = async (e) => {
//     e.preventDefault();

//     if (!formData.date || !formData.time || !formData.doctorId) {
//       alert('Please fill in all fields.');
//       return;
//     }

//     try {
//       const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

//       if (!selectedDoctor) {
//         alert('Doctor not found');
//         return;
//       }

//       await addDoc(collection(db, 'appointments'), {
//         patientId: currentUser.uid,
//         patientName: currentUser.username,
//         doctorId: selectedDoctor.id,
//         doctorName: selectedDoctor.username,
//         date: formData.date,
//         time: formData.time,
//         reason: formData.reason,
//         status: 'pending',
//         createdAt: serverTimestamp(),
//       });

//       alert('Appointment requested!');
//       setFormData({ date: '', time: '', doctorId: '', reason: '' });
//       fetchPatientAppointments(currentUser.uid);
//     } catch (error) {
//       console.error('Error booking appointment:', error);
//       alert('Failed to book appointment.');
//     }
//   };

//   const handleSubmitReview = async (e) => {
//     e.preventDefault();
    
//     if (!reviewForm.doctorId || !reviewForm.rating) {
//       alert('Please select a doctor and provide a rating');
//       return;
//     }

//     try {
//       await addDoc(collection(db, 'reviews'), {
//         doctorId: reviewForm.doctorId,
//         patientId: currentUser.uid,
//         patientName: currentUser.username,
//         rating: reviewForm.rating,
//         comment: reviewForm.comment,
//         createdAt: serverTimestamp(),
//       });

//       alert('Review submitted successfully!');
//       setReviewForm({
//         doctorId: '',
//         rating: 0,
//         comment: '',
//         hoverRating: 0,
//       });
      
//       fetchDoctorReviews(reviewForm.doctorId);
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('Failed to submit review.');
//     }
//   };

//   const handleAppointmentAction = async (appointmentId, action) => {
//     try {
//       await updateDoc(doc(db, 'appointments', appointmentId), {
//         status: action,
//         updatedAt: serverTimestamp(),
//       });

//       alert(`Appointment ${action}ed`);
//       fetchDoctorAppointments(currentUser.uid);
//     } catch (error) {
//       console.error(`Error ${action}ing appointment:`, error);
//     }
//   };

//   const calculateAverageRating = (doctorId) => {
//     if (!reviews[doctorId] || reviews[doctorId].length === 0) return 0;
    
//     const sum = reviews[doctorId].reduce((total, review) => total + review.rating, 0);
//     return (sum / reviews[doctorId].length).toFixed(1);
//   };

//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 1; i <= 5; i++) {
//       if (i <= fullStars) {
//         stars.push(<FaStar key={i} className="text-yellow-400" />);
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
//       } else {
//         stars.push(<FaRegStar key={i} className="text-yellow-400" />);
//       }
//     }

//     return stars;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-blue-50">
//         <BounceLoader color="#2563EB" size={60} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-blue-50 p-6">
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         {currentUser?.role === 'patient' && (
//           <>
//             <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
//               <h1 className="text-2xl font-bold">Patient Dashboard</h1>
//             </div>

//             <div className="p-6 space-y-8">
//               {/* Available Doctors Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Available Doctors
//                 </h2>
//                 {doctors.length > 0 ? (
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {doctors.map((doctor) => {
//                       const avgRating = calculateAverageRating(doctor.id);
//                       return (
//                         <div key={doctor.id} className="p-4 border border-blue-100 rounded-lg bg-blue-50">
//                           <div className="flex items-center space-x-4">
//                             <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
//                               {doctor.username?.charAt(0).toUpperCase() || 'D'}
//                             </div>
//                             <div className="flex-1">
//                               <p className="font-medium">{doctor.username}</p>
//                               <p className="text-sm text-gray-600">{doctor.specialization || 'Eye Specialist'}</p>
//                               <div className="flex items-center mt-1">
//                                 <div className="flex mr-2">
//                                   {renderStars(avgRating)}
//                                 </div>
//                                 <span className="text-sm text-gray-600">
//                                   ({avgRating}) {reviews[doctor.id]?.length || 0} reviews
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
                          
//                           {reviews[doctor.id]?.length > 0 && (
//                             <div className="mt-4 border-t pt-3">
//                               <h4 className="text-sm font-medium mb-2">Recent Reviews:</h4>
//                               <div className="space-y-3 max-h-40 overflow-y-auto">
//                                 {reviews[doctor.id].slice(0, 3).map(review => (
//                                   <div key={review.id} className="text-sm p-2 bg-white rounded border">
//                                     <div className="flex items-center mb-1">
//                                       <div className="flex mr-1">
//                                         {renderStars(review.rating)}
//                                       </div>
//                                       <span className="text-xs text-gray-500 ml-1">
//                                         by {review.patientName}
//                                       </span>
//                                     </div>
//                                     {review.comment && (
//                                       <p className="text-gray-700">"{review.comment}"</p>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No doctors available</p>
//                 )}
//               </div>

//               {/* Book New Appointment Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Book New Appointment
//                 </h2>
//                 <form onSubmit={handleBookAppointment} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor*</label>
//                       <select
//                         name="doctorId"
//                         value={formData.doctorId}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       >
//                         <option value="">Choose a doctor</option>
//                         {doctors.map(doctor => (
//                           <option key={doctor.id} value={doctor.id}>
//                             {doctor.username}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
//                       <input
//                         type="date"
//                         name="date"
//                         value={formData.date}
//                         onChange={handleInputChange}
//                         min={new Date().toISOString().split('T')[0]}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Time*</label>
//                       <input
//                         type="time"
//                         name="time"
//                         value={formData.time}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
//                       <input
//                         type="text"
//                         name="reason"
//                         value={formData.reason}
//                         onChange={handleInputChange}
//                         placeholder="Brief reason for appointment"
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                   >
//                     Request Appointment
//                   </button>
//                 </form>
//               </div>

//               {/* Your Appointments Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Your Appointments
//                 </h2>
//                 {appointments.length > 0 ? (
//                   <div className="space-y-4">
//                     {appointments.map(appointment => (
//                       <div key={appointment.id} className={`p-4 border rounded-lg ${appointment.status === 'confirmed'
//                         ? 'border-green-100 bg-green-50'
//                         : appointment.status === 'rejected'
//                           ? 'border-red-100 bg-red-50'
//                           : 'border-yellow-100 bg-yellow-50'
//                         }`}>
//                         <div>
//                           <p className="font-medium">Dr. {appointment.doctorName}</p>
//                           <p>Date: {appointment.date} at {appointment.time}</p>
//                           {appointment.reason && <p>Reason: {appointment.reason}</p>}
//                           <p className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${appointment.status === 'confirmed'
//                             ? 'bg-green-100 text-green-800'
//                             : appointment.status === 'rejected'
//                               ? 'bg-red-100 text-red-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                             {appointment.status.toUpperCase()}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">You have no appointments yet</p>
//                 )}
//               </div>

//               {/* Leave a Review Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Leave a Review
//                 </h2>
//                 <form onSubmit={handleSubmitReview} className="space-y-4">
//                   <div className="grid grid-cols-1 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor*</label>
//                       <select
//                         name="doctorId"
//                         value={reviewForm.doctorId}
//                         onChange={handleReviewChange}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       >
//                         <option value="">Choose a doctor</option>
//                         {doctors.map(doctor => (
//                           <option key={doctor.id} value={doctor.id}>
//                             {doctor.username}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Rating*</label>
//                       <div className="flex space-x-1">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <button
//                             key={star}
//                             type="button"
//                             className="text-2xl focus:outline-none"
//                             onClick={() => handleStarClick(star)}
//                             onMouseEnter={() => handleStarHover(star)}
//                             onMouseLeave={handleStarLeave}
//                           >
//                             {(reviewForm.hoverRating || reviewForm.rating) >= star ? (
//                               <FaStar className="text-yellow-400" />
//                             ) : (
//                               <FaRegStar className="text-yellow-400" />
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
//                       <textarea
//                         name="comment"
//                         value={reviewForm.comment}
//                         onChange={handleReviewChange}
//                         placeholder="Share your experience with this doctor"
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         rows="3"
//                       />
//                     </div>
//                   </div>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                   >
//                     Submit Review
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}

//         {currentUser?.role === 'doctor' && (
//           <>
//             <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
//               <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
//             </div>

//             <div className="p-6 space-y-8">
//               {/* Appointment Requests Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Appointment Requests
//                 </h2>
//                 {appointments.filter(a => a.status === 'pending').length > 0 ? (
//                   <div className="space-y-4">
//                     {appointments.filter(a => a.status === 'pending').map(appointment => (
//                       <div key={appointment.id} className="p-4 border border-blue-100 rounded-lg bg-blue-50">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <p className="font-medium">Patient: {appointment.patientName}</p>
//                             <p>Date: {appointment.date} at {appointment.time}</p>
//                             {appointment.reason && <p>Reason: {appointment.reason}</p>}
//                           </div>
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
//                               className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
//                             >
//                               Accept
//                             </button>
//                             <button
//                               onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
//                               className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No pending appointment requests</p>
//                 )}
//               </div>

//               {/* Confirmed Appointments Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Confirmed Appointments
//                 </h2>
//                 {appointments.filter(a => a.status === 'confirmed').length > 0 ? (
//                   <div className="space-y-4">
//                     {appointments.filter(a => a.status === 'confirmed').map(appointment => (
//                       <div key={appointment.id} className="p-4 border border-green-100 rounded-lg bg-green-50">
//                         <div>
//                           <p className="font-medium">Patient: {appointment.patientName}</p>
//                           <p>Date: {appointment.date} at {appointment.time}</p>
//                           {appointment.reason && <p>Reason: {appointment.reason}</p>}
//                           <p className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
//                             CONFIRMED
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No confirmed appointments</p>
//                 )}
//               </div>

//               {/* Reviews Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Your Reviews
//                 </h2>
//                 {reviews[currentUser.id]?.length > 0 ? (
//                   <div className="space-y-4">
//                     {reviews[currentUser.id].map(review => (
//                       <div key={review.id} className="p-4 border border-gray-200 rounded-lg bg-white">
//                         <div className="flex items-center mb-2">
//                           <div className="flex mr-2">
//                             {renderStars(review.rating)}
//                           </div>
//                           <span className="text-sm font-medium">
//                             by {review.patientName}
//                           </span>
//                           <span className="text-xs text-gray-500 ml-auto">
//                             {review.createdAt?.toDate ? 
//                               review.createdAt.toDate().toLocaleDateString() : 
//                               new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
//                           </span>
//                         </div>
//                         {review.comment && (
//                           <p className="text-gray-700 mt-1">"{review.comment}"</p>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//                     <p className="text-gray-500">No reviews yet</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppointmentsPage;





// 'use client';
// import { useState, useEffect } from 'react';
// import { auth, db, storage } from '@/app/firebase/config';
// import { useRouter } from 'next/navigation';
// import {
//   getDocs,
//   collection,
//   query,
//   where,
//   addDoc,
//   serverTimestamp,
//   updateDoc,
//   doc,
// } from 'firebase/firestore';
// import { ref, getDownloadURL } from 'firebase/storage';
// import { onAuthStateChanged } from 'firebase/auth';
// import { BounceLoader } from 'react-spinners';
// import { FaStar, FaStarHalfAlt, FaRegStar, FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa';
// import Image from 'next/image';
// import Link from 'next/link';

// const AppointmentsPage = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [reviews, setReviews] = useState({});
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [doctorImages, setDoctorImages] = useState({});
//   const [formData, setFormData] = useState({
//     date: '',
//     time: '',
//     doctorId: '',
//     reason: '',
//   });
//   const [reviewForm, setReviewForm] = useState({
//     doctorId: '',
//     rating: 0,
//     comment: '',
//     hoverRating: 0,
//   });

//   const router = useRouter();

//   const fetchDoctors = async () => {
//     try {
//       const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
//       const querySnapshot = await getDocs(q);
//       const doctorsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setDoctors(doctorsList);
      
//       // Fetch images for each doctor
//       const images = {};
//       for (const doctor of doctorsList) {
//         try {
//           const imageRef = ref(storage, `doctors/${doctor.id}/profile.jpg`);
//           const url = await getDownloadURL(imageRef);
//           images[doctor.id] = url;
//         } catch (error) {
//           images[doctor.id] = '/default-doctor.jpg';
//         }
//       }
//       setDoctorImages(images);
      
//       doctorsList.forEach(doctor => {
//         fetchDoctorReviews(doctor.id);
//       });
//     } catch (error) {
//       console.error('Error fetching doctors:', error);
//     }
//   };

//   const fetchDoctorReviews = async (doctorId) => {
//     try {
//       const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
//       const querySnapshot = await getDocs(q);
//       const reviewsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
      
//       setReviews(prev => ({
//         ...prev,
//         [doctorId]: reviewsList
//       }));
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//     }
//   };

//   const fetchPatientAppointments = async (patientUid) => {
//     try {
//       const q = query(collection(db, 'appointments'), where('patientId', '==', patientUid));
//       const querySnapshot = await getDocs(q);
//       const appointmentsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setAppointments(appointmentsList);
//     } catch (error) {
//       console.error('Error fetching patient appointments:', error);
//     }
//   };

//   const fetchDoctorAppointments = async (doctorUid) => {
//     try {
//       const q = query(collection(db, 'appointments'), where('doctorId', '==', doctorUid));
//       const querySnapshot = await getDocs(q);
//       const appointmentsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setAppointments(appointmentsList);
//     } catch (error) {
//       console.error('Error fetching doctor appointments:', error);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           const q = query(collection(db, 'users'), where('email', '==', user.email));
//           const querySnapshot = await getDocs(q);

//           if (!querySnapshot.empty) {
//             const docRef = querySnapshot.docs[0];
//             const userData = docRef.data();

//             const combinedUser = {
//               id: docRef.id,
//               uid: user.uid,
//               ...userData,
//             };

//             setCurrentUser(combinedUser);

//             if (userData.role === 'patient') {
//               await fetchDoctors();
//               await fetchPatientAppointments(user.uid);
//             } else if (userData.role === 'doctor') {
//               await fetchDoctorAppointments(user.uid);
//               await fetchDoctorReviews(docRef.id);
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         router.push('/auth/login');
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleReviewChange = (e) => {
//     const { name, value } = e.target;
//     setReviewForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleStarClick = (rating) => {
//     setReviewForm(prev => ({ ...prev, rating }));
//   };

//   const handleStarHover = (hoverRating) => {
//     setReviewForm(prev => ({ ...prev, hoverRating }));
//   };

//   const handleStarLeave = () => {
//     setReviewForm(prev => ({ ...prev, hoverRating: 0 }));
//   };

//   const handleBookAppointment = async (e) => {
//     e.preventDefault();

//     if (!formData.date || !formData.time || !formData.doctorId) {
//       alert('Please fill in all fields.');
//       return;
//     }

//     try {
//       const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

//       if (!selectedDoctor) {
//         alert('Doctor not found');
//         return;
//       }

//       await addDoc(collection(db, 'appointments'), {
//         patientId: currentUser.uid,
//         patientName: currentUser.username,
//         doctorId: selectedDoctor.id,
//         doctorName: selectedDoctor.username,
//         date: formData.date,
//         time: formData.time,
//         reason: formData.reason,
//         status: 'pending',
//         createdAt: serverTimestamp(),
//       });

//       alert('Appointment requested!');
//       setFormData({ date: '', time: '', doctorId: '', reason: '' });
//       fetchPatientAppointments(currentUser.uid);
//     } catch (error) {
//       console.error('Error booking appointment:', error);
//       alert('Failed to book appointment.');
//     }
//   };

//   const handleSubmitReview = async (e) => {
//     e.preventDefault();
    
//     if (!reviewForm.doctorId || !reviewForm.rating) {
//       alert('Please select a doctor and provide a rating');
//       return;
//     }

//     try {
//       await addDoc(collection(db, 'reviews'), {
//         doctorId: reviewForm.doctorId,
//         patientId: currentUser.uid,
//         patientName: currentUser.username,
//         rating: reviewForm.rating,
//         comment: reviewForm.comment,
//         createdAt: serverTimestamp(),
//       });

//       alert('Review submitted successfully!');
//       setReviewForm({
//         doctorId: '',
//         rating: 0,
//         comment: '',
//         hoverRating: 0,
//       });
      
//       fetchDoctorReviews(reviewForm.doctorId);
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('Failed to submit review.');
//     }
//   };

//   const handleAppointmentAction = async (appointmentId, action) => {
//     try {
//       await updateDoc(doc(db, 'appointments', appointmentId), {
//         status: action,
//         updatedAt: serverTimestamp(),
//       });

//       alert(`Appointment ${action}ed`);
//       fetchDoctorAppointments(currentUser.uid);
//     } catch (error) {
//       console.error(`Error ${action}ing appointment:`, error);
//     }
//   };

//   const calculateAverageRating = (doctorId) => {
//     if (!reviews[doctorId] || reviews[doctorId].length === 0) return 0;
    
//     const sum = reviews[doctorId].reduce((total, review) => total + review.rating, 0);
//     return (sum / reviews[doctorId].length).toFixed(1);
//   };

//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 1; i <= 5; i++) {
//       if (i <= fullStars) {
//         stars.push(<FaStar key={i} className="text-yellow-400" />);
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
//       } else {
//         stars.push(<FaRegStar key={i} className="text-yellow-400" />);
//       }
//     }

//     return stars;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-blue-50">
//         <BounceLoader color="#2563EB" size={60} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-blue-50 p-6">
//       <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         {currentUser?.role === 'patient' && (
//           <>
//             <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
//               <h1 className="text-2xl font-bold">Patient Dashboard</h1>
//             </div>

//             <div className="p-6 space-y-8">
//               {/* Available Doctors Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Available Doctors
//                 </h2>
//                 {doctors.length > 0 ? (
//                   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                     {doctors.map((doctor) => {
//                       const avgRating = calculateAverageRating(doctor.id);
//                       return (
//                         <Link 
//                           href={`/doctors/${doctor.id}`} 
//                           key={doctor.id} 
//                           className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
//                         >
//                           <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 h-full">
//                             <div className="flex flex-col items-center">
//                               <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
//                                 <Image
//                                   src={doctorImages[doctor.id] || '/default-doctor.jpg'}
//                                   alt={doctor.username}
//                                   fill
//                                   className="object-cover"
//                                   sizes="(max-width: 128px) 100vw, 128px"
//                                 />
//                               </div>
//                               <div className="text-center">
//                                 <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
//                                   Dr. {doctor.username}
//                                 </h3>
//                                 <p className="text-sm text-blue-600 font-medium mb-1">
//                                   {doctor.specialization || 'General Practitioner'}
//                                 </p>
//                                 <div className="flex justify-center items-center">
//                                   <div className="flex mr-2">
//                                     {renderStars(avgRating)}
//                                   </div>
//                                   <span className="text-sm text-gray-600">
//                                     ({avgRating}) {reviews[doctor.id]?.length || 0} reviews
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No doctors available</p>
//                 )}
//               </div>

//               {/* Book New Appointment Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Book New Appointment
//                 </h2>
//                 <form onSubmit={handleBookAppointment} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor*</label>
//                       <select
//                         name="doctorId"
//                         value={formData.doctorId}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       >
//                         <option value="">Choose a doctor</option>
//                         {doctors.map(doctor => (
//                           <option key={doctor.id} value={doctor.id}>
//                             Dr. {doctor.username} ({doctor.specialization || 'General Practitioner'})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
//                       <input
//                         type="date"
//                         name="date"
//                         value={formData.date}
//                         onChange={handleInputChange}
//                         min={new Date().toISOString().split('T')[0]}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Time*</label>
//                       <input
//                         type="time"
//                         name="time"
//                         value={formData.time}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
//                       <input
//                         type="text"
//                         name="reason"
//                         value={formData.reason}
//                         onChange={handleInputChange}
//                         placeholder="Brief reason for appointment"
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                   >
//                     Request Appointment
//                   </button>
//                 </form>
//               </div>

//               {/* Your Appointments Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Your Appointments
//                 </h2>
//                 {appointments.length > 0 ? (
//                   <div className="space-y-4">
//                     {appointments.map(appointment => (
//                       <div key={appointment.id} className={`p-4 border rounded-lg ${appointment.status === 'confirmed'
//                         ? 'border-green-100 bg-green-50'
//                         : appointment.status === 'rejected'
//                           ? 'border-red-100 bg-red-50'
//                           : 'border-yellow-100 bg-yellow-50'
//                         }`}>
//                         <div>
//                           <p className="font-medium">Dr. {appointment.doctorName}</p>
//                           <p>Date: {appointment.date} at {appointment.time}</p>
//                           {appointment.reason && <p>Reason: {appointment.reason}</p>}
//                           <p className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${appointment.status === 'confirmed'
//                             ? 'bg-green-100 text-green-800'
//                             : appointment.status === 'rejected'
//                               ? 'bg-red-100 text-red-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                             {appointment.status.toUpperCase()}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">You have no appointments yet</p>
//                 )}
//               </div>

//               {/* Leave a Review Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Leave a Review
//                 </h2>
//                 <form onSubmit={handleSubmitReview} className="space-y-4">
//                   <div className="grid grid-cols-1 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor*</label>
//                       <select
//                         name="doctorId"
//                         value={reviewForm.doctorId}
//                         onChange={handleReviewChange}
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         required
//                       >
//                         <option value="">Choose a doctor</option>
//                         {doctors.map(doctor => (
//                           <option key={doctor.id} value={doctor.id}>
//                             Dr. {doctor.username} ({doctor.specialization || 'General Practitioner'})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Rating*</label>
//                       <div className="flex space-x-1">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <button
//                             key={star}
//                             type="button"
//                             className="text-2xl focus:outline-none"
//                             onClick={() => handleStarClick(star)}
//                             onMouseEnter={() => handleStarHover(star)}
//                             onMouseLeave={handleStarLeave}
//                           >
//                             {(reviewForm.hoverRating || reviewForm.rating) >= star ? (
//                               <FaStar className="text-yellow-400" />
//                             ) : (
//                               <FaRegStar className="text-yellow-400" />
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
//                       <textarea
//                         name="comment"
//                         value={reviewForm.comment}
//                         onChange={handleReviewChange}
//                         placeholder="Share your experience with this doctor"
//                         className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
//                         rows="3"
//                       />
//                     </div>
//                   </div>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                   >
//                     Submit Review
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}

//         {currentUser?.role === 'doctor' && (
//           <>
//             <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
//               <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
//             </div>

//             <div className="p-6 space-y-8">
//               {/* Appointment Requests Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Appointment Requests
//                 </h2>
//                 {appointments.filter(a => a.status === 'pending').length > 0 ? (
//                   <div className="space-y-4">
//                     {appointments.filter(a => a.status === 'pending').map(appointment => (
//                       <div key={appointment.id} className="p-4 border border-blue-100 rounded-lg bg-blue-50">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <p className="font-medium">Patient: {appointment.patientName}</p>
//                             <p>Date: {appointment.date} at {appointment.time}</p>
//                             {appointment.reason && <p>Reason: {appointment.reason}</p>}
//                           </div>
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
//                               className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
//                             >
//                               Accept
//                             </button>
//                             <button
//                               onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
//                               className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No pending appointment requests</p>
//                 )}
//               </div>

//               {/* Confirmed Appointments Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Confirmed Appointments
//                 </h2>
//                 {appointments.filter(a => a.status === 'confirmed').length > 0 ? (
//                   <div className="space-y-4">
//                     {appointments.filter(a => a.status === 'confirmed').map(appointment => (
//                       <div key={appointment.id} className="p-4 border border-green-100 rounded-lg bg-green-50">
//                         <div>
//                           <p className="font-medium">Patient: {appointment.patientName}</p>
//                           <p>Date: {appointment.date} at {appointment.time}</p>
//                           {appointment.reason && <p>Reason: {appointment.reason}</p>}
//                           <p className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
//                             CONFIRMED
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No confirmed appointments</p>
//                 )}
//               </div>

//               {/* Reviews Section */}
//               <div>
//                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
//                   Your Reviews
//                 </h2>
//                 {reviews[currentUser.id]?.length > 0 ? (
//                   <div className="space-y-4">
//                     {reviews[currentUser.id].map(review => (
//                       <div key={review.id} className="p-4 border border-gray-200 rounded-lg bg-white">
//                         <div className="flex items-center mb-2">
//                           <div className="flex mr-2">
//                             {renderStars(review.rating)}
//                           </div>
//                           <span className="text-sm font-medium">
//                             by {review.patientName}
//                           </span>
//                           <span className="text-xs text-gray-500 ml-auto">
//                             {review.createdAt?.toDate ? 
//                               review.createdAt.toDate().toLocaleDateString() : 
//                               new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
//                           </span>
//                         </div>
//                         {review.comment && (
//                           <p className="text-gray-700 mt-1">"{review.comment}"</p>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//                     <p className="text-gray-500">No reviews yet</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppointmentsPage;




'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { BounceLoader } from 'react-spinners';
import { FaStar, FaStarHalfAlt, FaRegStar, FaCalendarAlt, FaClock,FaUserMd } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

const AppointmentsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  const fetchDoctors = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const querySnapshot = await getDocs(q);
      const doctorsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsList);
      
      await Promise.all(doctorsList.map(doctor => fetchDoctorReviews(doctor.id)));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    }
  };

  const fetchDoctorReviews = async (doctorId) => {
    try {
      const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);
      const reviewsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setReviews(prev => ({
        ...prev,
        [doctorId]: reviewsList
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchPatientAppointments = async (patientUid) => {
    try {
      const q = query(collection(db, 'appointments'), where('patientId', '==', patientUid));
      const querySnapshot = await getDocs(q);
      const appointmentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      setError('Failed to load appointments. Please try again.');
    }
  };

  const fetchDoctorAppointments = async (doctorUid) => {
    try {
      const q = query(collection(db, 'appointments'), where('doctorId', '==', doctorUid));
      const querySnapshot = await getDocs(q);
      const appointmentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      setError('Failed to load appointments. Please try again.');
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: action
      });
      
      // Refresh appointments
      if (currentUser?.role === 'doctor') {
        await fetchDoctorAppointments(currentUser.uid);
      } else if (currentUser?.role === 'patient') {
        await fetchPatientAppointments(currentUser.uid);
      }
      
      alert(`Appointment ${action} successfully!`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'users'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0];
            const userData = docRef.data();

            const combinedUser = {
              id: docRef.id,
              uid: user.uid,
              ...userData,
            };

            setCurrentUser(combinedUser);

            if (userData.role === 'patient') {
              await Promise.all([
                fetchDoctors(),
                fetchPatientAppointments(user.uid)
              ]);
            } else if (userData.role === 'doctor') {
              await Promise.all([
                fetchDoctorAppointments(user.uid),
                fetchDoctorReviews(docRef.id)
              ]);
            }
          } else {
            setError('User data not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const calculateAverageRating = (doctorId) => {
    if (!reviews[doctorId] || reviews[doctorId].length === 0) return 0;
    
    const sum = reviews[doctorId].reduce((total, review) => total + review.rating, 0);
    return (sum / reviews[doctorId].length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-50">
        <BounceLoader color="#2563EB" size={60} />
        <p className="mt-4 text-blue-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-50 p-6">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Page</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {currentUser?.role === 'patient' && (
          <>
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <h1 className="text-2xl font-bold">Patient Dashboard</h1>
              <p className="mt-1">Welcome back, {currentUser.username}</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Available Doctors Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Available Doctors
                </h2>
                {doctors.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {doctors.map((doctor) => {
                      const avgRating = calculateAverageRating(doctor.id);
                      return (
                        <Link 
                          href={`/dashboard/doctors/${doctor.id}`} 
                          key={doctor.id} 
                          className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                        >
                          <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 h-full">
                            <div className="flex flex-col items-center">
                              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
                                {doctor.profileImage ? (
                                  <Image
                                    src={doctor.profileImage}
                                    alt={doctor.username}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 128px) 100vw, 128px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                                    {doctor.username?.charAt(0).toUpperCase() || 'D'}
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                  Dr. {doctor.username}
                                </h3>
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                  {doctor.specialization || 'General Practitioner'}
                                </p>
                                <div className="flex justify-center items-center">
                                  <div className="flex mr-2">
                                    {renderStars(avgRating)}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    ({avgRating}) {reviews[doctor.id]?.length || 0} reviews
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No doctors available at this time.</p>
                )}
              </div>

              {/* Your Appointments Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Your Appointments
                </h2>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map(appointment => (
                      <div key={appointment.id} className={`p-4 border rounded-lg ${appointment.status === 'confirmed'
                        ? 'border-green-100 bg-green-50'
                        : appointment.status === 'rejected'
                          ? 'border-red-100 bg-red-50'
                          : 'border-yellow-100 bg-yellow-50'
                        }`}>
                        <div>
                          <p className="font-medium">Dr. {appointment.doctorName}</p>
                          <p className="flex items-center text-gray-600 mt-1">
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                            Date: {appointment.date}
                          </p>
                          <p className="flex items-center text-gray-600 mt-1">
                            <FaClock className="mr-2 text-blue-500" />
                            Time: {appointment.time}
                          </p>
                          {appointment.reason && (
                            <p className="mt-2 text-gray-700">
                              <span className="font-medium">Reason:</span> {appointment.reason}
                            </p>
                          )}
                          <p className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {appointment.status.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 text-center">
                    <p className="text-gray-500">You have no appointments scheduled yet.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentUser?.role === 'doctor' && (
          <>
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
              <p className="mt-1">Welcome back, Dr. {currentUser.username}</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Appointment Requests Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Appointment Requests
                </h2>
                {appointments.filter(a => a.status === 'pending').length > 0 ? (
                  <div className="space-y-4">
                    {appointments.filter(a => a.status === 'pending').map(appointment => (
                      <div key={appointment.id} className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium flex items-center">
                              <FaUserMd className="mr-2 text-blue-500" />
                              Patient: {appointment.patientName}
                            </p>
                            <p className="flex items-center text-gray-600 mt-1">
                              <FaCalendarAlt className="mr-2 text-blue-500" />
                              Date: {appointment.date}
                            </p>
                            <p className="flex items-center text-gray-600 mt-1">
                              <FaClock className="mr-2 text-blue-500" />
                              Time: {appointment.time}
                            </p>
                            {appointment.reason && (
                              <p className="mt-2 text-gray-700">
                                <span className="font-medium">Reason:</span> {appointment.reason}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 text-center">
                    <p className="text-gray-500">No pending appointment requests</p>
                  </div>
                )}
              </div>

              {/* Confirmed Appointments Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Confirmed Appointments
                </h2>
                {appointments.filter(a => a.status === 'confirmed').length > 0 ? (
                  <div className="space-y-4">
                    {appointments.filter(a => a.status === 'confirmed').map(appointment => (
                      <div key={appointment.id} className="p-4 border border-green-100 rounded-lg bg-green-50">
                        <div>
                          <p className="font-medium flex items-center">
                            <FaUserMd className="mr-2 text-green-500" />
                            Patient: {appointment.patientName}
                          </p>
                          <p className="flex items-center text-gray-600 mt-1">
                            <FaCalendarAlt className="mr-2 text-green-500" />
                            Date: {appointment.date}
                          </p>
                          <p className="flex items-center text-gray-600 mt-1">
                            <FaClock className="mr-2 text-green-500" />
                            Time: {appointment.time}
                          </p>
                          {appointment.reason && (
                            <p className="mt-2 text-gray-700">
                              <span className="font-medium">Reason:</span> {appointment.reason}
                            </p>
                          )}
                          <p className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            CONFIRMED
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 text-center">
                    <p className="text-gray-500">No confirmed appointments</p>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Your Reviews
                </h2>
                {reviews[currentUser.id]?.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {reviews[currentUser.id].map(review => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm font-medium">
                            by {review.patientName}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {review.createdAt?.toDate ? 
                              review.createdAt.toDate().toLocaleDateString() : 
                              new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 mt-1">"{review.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 text-center">
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;


