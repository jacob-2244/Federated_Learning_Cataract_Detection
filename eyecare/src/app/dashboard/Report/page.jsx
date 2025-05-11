



'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from "react";


const Page = () => {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [report, setReport] = useState("");
    const [submitted, setSubmitted] = useState(false);


    const router=useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Report submitted:', { username, role, report });
        setSubmitted(true);
    };

    const handleBack = () => {
        setSubmitted(false);
        setUsername("");
        setRole("");
        setReport("");
    };

    const handleBackButton = () => {
        // window.location.href = '/dashboard';
        router.push("/dashboard")
     

        
    };

    return (
        <div className="min-h-screen bg-blue-50 p-6 font-sans flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                    <h2 className="text-2xl font-bold">Report an Issue</h2>
                </div>
                
                {submitted ? (
                    <div className="p-6 text-center">
                        <div className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-6">Thank you for your report!</p>
                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                Submit Another
                            </button>
                            <button
                                onClick={handleBackButton}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="">Select your role</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Patient">Patient</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Describe the issue
                            </label>
                            <textarea
                                rows="4"
                                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                value={report}
                                onChange={(e) => setReport(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                Submit Report
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleBackButton}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Page;