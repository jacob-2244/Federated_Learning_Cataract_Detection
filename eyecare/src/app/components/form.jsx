'use client';

import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import Button from './button';
import { doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { auth, db } from '@/app/firebase/config';
import { getDoc, collection, query, onSnapshot } from 'firebase/firestore';

const UserRole = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [image, setImage] = useState(null);
  const [occupat, setOccupat] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          if (currentUser) {
            try {
              const userDocRef = doc(db, 'users', currentUser.uid);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                setRole(userDoc.data().role);
                setOccupat(userDoc.data())
              } else {
                console.error('User document not found');
              }
            } catch (err) {
              console.error('Error fetching user data: ', err);
            } finally {
              setLoading(false);
            }
          } else {
            console.error('No authenticated user found');
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing Firebase Auth Listener:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection);

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const usersList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || null,
          }));
          setUsers(usersList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, email) => {
    if (window.confirm(`Are you sure you want to delete user ${email}?`)) {
      try {
        const userDocRef = doc(db, 'users', userId); // Reference to the user's document
        await deleteDoc(userDocRef); // Delete the user document
        alert(`User ${email} has been deleted successfully.`);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
      }
    }
  };


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = async () => {
    if (navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        setImage(canvas.toDataURL('image/png'));
        stream.getTracks().forEach((track) => track.stop());
      });
    } else {
      alert('Camera not supported in this browser.');
    }
  };

  return (
    <div style={{ overflowY: 'scroll' }}>
      {role === 'admin' ? (
        <Card className="w-full max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Admin Dashboard - User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Role</th>
                    <th className="py-2 px-4 text-left">Created At</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                            }`}
                        >
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {occupat.occupation === 'doctor' && (
            <div className="p-6">
              <h3 className="text-gray-700 text-3xl font-medium">Image Uploader</h3>
              <div className="mt-8">
                <div className="w-full bg-white shadow-md rounded-md p-6">
                  <h2 className="text-lg text-gray-700 font-semibold capitalize mb-4">
                    Upload Your Degree - Certificates
                  </h2>
                  <div className="flex flex-col gap-4">
                    <label className="block text-gray-700">
                      Select an Image:
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full mt-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </label>
                    <Button
                      onClick={handleCapture}
                      className="bg-indigo-600 hover:bg-indigo-500"
                    >
                      Open Camera
                    </Button>
                  </div>
                  {image && (
                    <div className="mt-6">
                      <h3 className="text-gray-600 mb-2">Preview:</h3>
                      <img
                        src={image}
                        alt="Uploaded or Captured"
                        className="w-full h-64 object-cover border rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setImage(null)}>
                      Cancel
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-500">
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {occupat.occupation === 'patient' && (
            <div className="p-6">
              <h3 className="text-gray-700 text-3xl font-medium">Image Uploader</h3>
              <div className="mt-8">
                <div className="w-full bg-white shadow-md rounded-md p-6">
                  <h2 className="text-lg text-gray-700 font-semibold capitalize mb-4">
                    Upload Your Medical Records
                  </h2>
                  <div className="flex flex-col gap-4">
                    <label className="block text-gray-700">
                      Select an Image:
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full mt-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </label>
                    <Button
                      onClick={handleCapture}
                      className="bg-indigo-600 hover:bg-indigo-500"
                    >
                      Open Camera
                    </Button>
                  </div>
                  {image && (
                    <div className="mt-6">
                      <h3 className="text-gray-600 mb-2">Preview:</h3>
                      <img
                        src={image}
                        alt="Uploaded or Captured"
                        className="w-full h-64 object-cover border rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setImage(null)}>
                      Cancel
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-500">
                      Submit
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="w-full bg-white shadow-md rounded-md p-6">
                  <h2 className="text-lg text-gray-700 font-semibold capitalize mb-4">
                    Online Appointment
                  </h2>
                  <div className="flex flex-col gap-4">
                    <Link
                      href="/dashboard/chat"
                      className="px-4 py-2 text-white bg-indigo-600 rounded-md shadow hover:bg-indigo-500 focus:outline-none text-center"
                    >
                      Make Online Appointment with Doctor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserRole;