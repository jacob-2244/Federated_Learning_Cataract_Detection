// 'use client';
// import { useState, useEffect } from 'react';
// import { auth, db, storage } from '@/app/firebase/config';
// import { useRouter, useParams } from 'next/navigation';
// import { getDoc, doc, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
// import { ref, getDownloadURL } from 'firebase/storage';
// import { onAuthStateChanged } from 'firebase/auth';
// import { BounceLoader } from 'react-spinners';
// import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft } from 'react-icons/fa';
// import Image from 'next/image';
// import Link from 'next/link';

// const DoctorProfilePage = () => {
//   const [doctor, setDoctor] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [imageUrl, setImageUrl] = useState('/default-doctor.jpg');
//   const [reviewForm, setReviewForm] = useState({
//     rating: 0,
//     comment: '',
//     hoverRating: 0,
//   });

//   const router = useRouter();
//   const params = useParams();
//   const doctorId = params.id;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch doctor data
//         const docRef = doc(db, 'users', doctorId);
//         const docSnap = await getDoc(docRef);
        
//         if (docSnap.exists()) {
//           setDoctor({ id: docSnap.id, ...docSnap.data() });
          
//           // Fetch doctor image
//           try {
//             const imageRef = ref(storage, `doctors/${doctorId}/profile.jpg`);
//             const url = await getDownloadURL(imageRef);
//             setImageUrl(url);
//           } catch (error) {
//             console.log('Using default doctor image');
//           }
//         } else {
//           router.push('/appointments');
//         }

//         // Fetch reviews
//         const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
//         const querySnapshot = await getDocs(q);
//         const reviewsList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setReviews(reviewsList);

//         // Check auth state
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//           if (user) {
//             const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
//             const userSnapshot = await getDocs(userQuery);
//             if (!userSnapshot.empty) {
//               const docRef = userSnapshot.docs[0];
//               setCurrentUser({
//                 id: docRef.id,
//                 uid: user.uid,
//                 ...docRef.data(),
//               });
//             }
//           }
//           setLoading(false);
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         router.push('/appointments');
//       }
//     };

//     fetchData();
//   }, [doctorId, router]);

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

//   const handleSubmitReview = async (e) => {
//     e.preventDefault();
    
//     if (!reviewForm.rating || !currentUser) {
//       alert('Please provide a rating and make sure you are logged in');
//       return;
//     }

//     try {
//       await addDoc(collection(db, 'reviews'), {
//         doctorId,
//         patientId: currentUser.uid,
//         patientName: currentUser.username,
//         rating: reviewForm.rating,
//         comment: reviewForm.comment,
//         createdAt: serverTimestamp(),
//       });

//       alert('Review submitted successfully!');
//       setReviewForm({
//         rating: 0,
//         comment: '',
//         hoverRating: 0,
//       });
      
//       // Refresh reviews
//       const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
//       const querySnapshot = await getDocs(q);
//       const reviewsList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setReviews(reviewsList);
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('Failed to submit review.');
//     }
//   };

//   const calculateAverageRating = () => {
//     if (reviews.length === 0) return 0;
//     const sum = reviews.reduce((total, review) => total + review.rating, 0);
//     return (sum / reviews.length).toFixed(1);
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

//   if (loading || !doctor) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-blue-50">
//         <BounceLoader color="#2563EB" size={60} />
//       </div>
//     );
//   }

//   const avgRating = calculateAverageRating();

//   return (
//     <div className="min-h-screen bg-blue-50 p-6">
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
//           <div className="flex items-center">
//             <Link href="/appointments" className="mr-4 hover:text-blue-200">
//               <FaArrowLeft className="text-xl" />
//             </Link>
//             <h1 className="text-2xl font-bold">Doctor Profile</h1>
//           </div>
//         </div>

//         <div className="p-6">
//           <div className="flex flex-col md:flex-row gap-8">
//             {/* Doctor Image and Basic Info */}
//             <div className="w-full md:w-1/3 flex flex-col items-center">
//               <div className="relative h-64 w-64 rounded-full overflow-hidden border-4 border-blue-100 mb-4">
//                 <Image
//                   src={imageUrl}
//                   alt={doctor.username}
//                   fill
//                   className="object-cover"
//                 />
//               </div>
              
//               <h2 className="text-2xl font-bold text-center">{doctor.username}</h2>
//               <p className="text-blue-600 font-medium text-center">{doctor.specialization || 'General Practitioner'}</p>
              
//               <div className="flex items-center mt-2">
//                 <div className="flex mr-2">
//                   {renderStars(avgRating)}
//                 </div>
//                 <span className="text-gray-600">
//                   ({avgRating}) {reviews.length} reviews
//                 </span>
//               </div>
              
//               {doctor.bio && (
//                 <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//                   <h3 className="font-semibold text-blue-800 mb-2">About</h3>
//                   <p className="text-gray-700">{doctor.bio}</p>
//                 </div>
//               )}
//             </div>

//             {/* Doctor Details and Reviews */}
//             <div className="w-full md:w-2/3">
//               {/* Doctor Details */}
//               <div className="mb-8">
//                 <h3 className="text-xl font-semibold text-blue-800 mb-4">Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <p className="font-medium">Education</p>
//                     <p className="text-gray-600">{doctor.education || 'Not specified'}</p>
//                   </div>
//                   <div>
//                     <p className="font-medium">Experience</p>
//                     <p className="text-gray-600">{doctor.experience || 'Not specified'}</p>
//                   </div>
//                   <div>
//                     <p className="font-medium">Hospital</p>
//                     <p className="text-gray-600">{doctor.hospital || 'Not specified'}</p>
//                   </div>
//                   <div>
//                     <p className="font-medium">Languages</p>
//                     <p className="text-gray-600">{doctor.languages || 'Not specified'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Reviews Section */}
//               <div className="mb-8">
//                 <h3 className="text-xl font-semibold text-blue-800 mb-4">Patient Reviews</h3>
                
//                 {reviews.length > 0 ? (
//                   <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
//                     {reviews.map(review => (
//                       <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <p className="font-medium">{review.patientName}</p>
//                             <div className="flex items-center mb-2">
//                               {renderStars(review.rating)}
//                             </div>
//                             {review.comment && (
//                               <p className="text-gray-700">"{review.comment}"</p>
//                             )}
//                           </div>
//                           <span className="text-xs text-gray-500">
//                             {review.createdAt?.toDate ? 
//                               review.createdAt.toDate().toLocaleDateString() : 
//                               new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No reviews yet</p>
//                 )}
//               </div>

//               {/* Leave a Review Form */}
//               {currentUser?.role === 'patient' && (
//                 <div>
//                   <h3 className="text-xl font-semibold text-blue-800 mb-4">Leave a Review</h3>
//                   <form onSubmit={handleSubmitReview} className="space-y-4">
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
//                     <button
//                       type="submit"
//                       className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                     >
//                       Submit Review
//                     </button>
//                   </form>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorProfilePage;




'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/app/firebase/config';
import { useRouter, useParams } from 'next/navigation';
import { 
  getDoc, 
  doc, 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp,
  getDocs  // Added this import
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { BounceLoader } from 'react-spinners';
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

const DoctorProfilePage = () => {
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    hoverRating: 0,
  });

  const router = useRouter();
  const params = useParams();
  const doctorId = params.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctor data
        const docRef = doc(db, 'users', doctorId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDoctor({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push('/appointments');
          return;
        }

        // Fetch reviews
        const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
        const querySnapshot = await getDocs(q);
        const reviewsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsList);

        // Check auth state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const docRef = userSnapshot.docs[0];
                setCurrentUser({
                  id: docRef.id,
                  uid: user.uid,
                  ...docRef.data(),
                });
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load doctor profile. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (hoverRating) => {
    setReviewForm(prev => ({ ...prev, hoverRating }));
  };

  const handleStarLeave = () => {
    setReviewForm(prev => ({ ...prev, hoverRating: 0 }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: currentUser.uid,
        patientName: currentUser.username,
        doctorId: doctor.id,
        doctorName: doctor.username,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('Appointment requested successfully!');
      setFormData({ date: '', time: '', reason: '' });
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.rating || !currentUser) {
      alert('Please provide a rating and make sure you are logged in');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        doctorId,
        patientId: currentUser.uid,
        patientName: currentUser.username,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: serverTimestamp(),
      });

      alert('Review submitted successfully!');
      setReviewForm({
        rating: 0,
        comment: '',
        hoverRating: 0,
      });
      
      // Refresh reviews
      const q = query(collection(db, 'reviews'), where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);
      const reviewsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
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
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <BounceLoader color="#2563EB" size={60} />
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

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <p className="text-gray-700">Doctor not found</p>
      </div>
    );
  }

  const avgRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
          <div className="flex items-center">
            <Link href="/dashboard/Appointments" className="mr-4 hover:text-blue-200">
              <FaArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold">Doctor Profile</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Doctor Image and Basic Info */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative h-64 w-64 rounded-full overflow-hidden border-4 border-blue-100 mb-4">
                {doctor.profileImage ? (
                  <Image
                    src={doctor.profileImage}
                    alt={doctor.username}
                    fill
                    className="object-cover"
                    sizes="(max-width: 256px) 100vw, 256px"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                    {doctor.username?.charAt(0).toUpperCase() || 'D'}
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-center">Dr. {doctor.username}</h2>
              <p className="text-blue-600 font-medium text-center">
                {doctor.specialization || 'General Practitioner'}
              </p>
              
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStars(avgRating)}
                </div>
                <span className="text-gray-600">
                  ({avgRating}) {reviews.length} reviews
                </span>
              </div>
              
              {doctor.bio && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">About</h3>
                  <p className="text-gray-700">{doctor.bio}</p>
                </div>
              )}
            </div>

            {/* Doctor Details and Actions */}
            <div className="w-full md:w-2/3">
              {/* Doctor Details */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Education</p>
                    <p className="text-gray-600">{doctor.education || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Experience</p>
                    <p className="text-gray-600">{doctor.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Hospital</p>
                    <p className="text-gray-600">{doctor.hospital || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Languages</p>
                    <p className="text-gray-600">{doctor.languages || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Book Appointment Section (for patients) */}
              {currentUser?.role === 'patient' && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">Book Appointment</h3>
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time*</label>
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                        <input
                          type="text"
                          name="reason"
                          value={formData.reason}
                          onChange={handleInputChange}
                          placeholder="Brief reason for appointment"
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Request Appointment
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Patient Reviews</h3>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{review.patientName}</p>
                            <div className="flex items-center mb-2">
                              {renderStars(review.rating)}
                            </div>
                            {review.comment && (
                              <p className="text-gray-700">"{review.comment}"</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.createdAt?.toDate ? 
                              review.createdAt.toDate().toLocaleDateString() : 
                              new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </div>

              {/* Leave a Review Form (for patients) */}
              {currentUser?.role === 'patient' && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating*</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="text-2xl focus:outline-none"
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => handleStarHover(star)}
                            onMouseLeave={handleStarLeave}
                          >
                            {(reviewForm.hoverRating || reviewForm.rating) >= star ? (
                              <FaStar className="text-yellow-400" />
                            ) : (
                              <FaRegStar className="text-yellow-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        placeholder="Share your experience with this doctor"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        rows="3"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;