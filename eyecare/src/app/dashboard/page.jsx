



'use client';
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { getDocs, collection, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { BounceLoader } from "react-spinners";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAllUsers(user.uid);
      } else {
        router.push("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAllUsers = async (currentUserId) => {
    try {
      const userCollection = collection(db, "users");
      const querySnapshot = await getDocs(userCollection);

      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);

      const currentUserData = usersList.find((user) => user.id === currentUserId);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (confirmDelete) {
      try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        alert("User deleted successfully!");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const handleCertificateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPEG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setCertificateFile(file);
  };

  const saveCertificate = async () => {
    if (!certificateFile || !currentUser?.id) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(certificateFile);

      reader.onloadend = async () => {
        const base64Certificate = reader.result;
        const userRef = doc(db, "users", currentUser.id);

        await updateDoc(userRef, {
          certificate: base64Certificate,
          certificateUploadedAt: new Date().toISOString()
        });

        alert('Certificate uploaded successfully!');
        const updatedUser = await getDoc(userRef);
        if (updatedUser.exists()) {
          setCurrentUser({
            id: updatedUser.id,
            ...updatedUser.data()
          });
        }
        setCertificateFile(null);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error("Error uploading certificate:", error);
      alert('Failed to upload certificate');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteCertificate = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your medical certificate?"
    );

    if (!confirmDelete) return;

    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        certificate: null,
        certificateUploadedAt: null
      });

      alert('Certificate deleted successfully!');
      setCurrentUser(prev => ({
        ...prev,
        certificate: null,
        certificateUploadedAt: null
      }));
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert('Failed to delete certificate');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <BounceLoader color="#2563EB" size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {currentUser?.role === "admin" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  All Users
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border border-blue-100 rounded-lg bg-blue-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}: {user.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              Email: {user.email}
                            </p>
                          </div>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No users found.</p>
                  )}
                </div>
              </div>
            )}

            {currentUser?.role === "doctor" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Doctor Profile
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {currentUser.username}</p>
                    <p><span className="font-medium">Email:</span> {currentUser.email}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-medium mb-2 text-blue-700">Professional Certificate</h4>
                    {currentUser.certificate ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <img 
                            src={currentUser.certificate} 
                            alt="Certificate" 
                            className="max-w-full h-auto max-h-64 object-contain border border-blue-200 rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Uploaded on: {new Date(currentUser.certificateUploadedAt).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={deleteCertificate}
                            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            Delete Certificate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Certificate
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCertificateUpload}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                        {certificateFile && (
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <img
                                src={URL.createObjectURL(certificateFile)}
                                alt="Certificate Preview"
                                className="max-w-full h-auto max-h-64 object-contain border border-blue-200 rounded-lg"
                              />
                            </div>
                            <button
                              onClick={saveCertificate}
                              disabled={isUploading}
                              className={`px-4 py-2 rounded-full ${
                                isUploading
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              {isUploading ? 'Uploading...' : 'Save Certificate'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentUser?.role === "patient" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                  Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push("/dashboard/uploadEyeImage")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Check Your Eye Disease</span>
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/Appointments")}
                    className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;