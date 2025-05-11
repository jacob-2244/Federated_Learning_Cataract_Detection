



'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const UploadEyeImage = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            setImageFile(file);
            setPrediction(null); // Reset previous prediction

            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePredict = async () => {
        if (!imageFile) {
            alert('Please upload an image first');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setPrediction(result);
        } catch (error) {
            console.error('Prediction failed:', error);
            setPrediction({ error: 'Prediction failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                    <h1 className="text-2xl font-bold">Upload Retina Image</h1>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <label className="block mb-4">
                            <span className="block text-sm font-medium text-gray-700 mb-2">Select Retina Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100 cursor-pointer"
                            />
                        </label>
                    </div>

                    {imagePreview && (
                        <div className="text-center space-y-4">
                            <h2 className="text-lg font-semibold text-blue-800">Image Preview</h2>
                            <div className="flex justify-center">
                                <img
                                    src={imagePreview}
                                    alt="Uploaded eye"
                                    className="max-w-xs max-h-64 object-contain rounded-lg border border-blue-200 shadow-sm"
                                />
                            </div>

                            <button
                                onClick={handlePredict}
                                disabled={isLoading}
                                className={`px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                                    isLoading
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                                }`}
                            >
                                {isLoading ? 'Processing...' : 'Predict Disease'}
                            </button>
                        </div>
                    )}

                    {prediction && (
                        <div className={`p-4 rounded-lg ${
                            prediction.error 
                                ? 'bg-red-50 border border-red-100'
                                : 'bg-green-50 border border-green-100'
                        }`}>
                            {prediction.error ? (
                                <p className="text-red-600 font-medium">{prediction.error}</p>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Prediction Result</h3>
                                    <div className="space-y-1">
                                        <p className="text-gray-700">
                                            <span className="font-medium">Condition:</span> {prediction.class}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Confidence:</span> {prediction.confidence}%
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="pt-4 text-center">
                        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadEyeImage;


