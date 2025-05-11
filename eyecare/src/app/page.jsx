'use client'

import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEye, FaShieldAlt, FaUserMd, FaUpload, FaClock, FaComments } from 'react-icons/fa';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ message: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', isError: false });

    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setStatus({ message: 'Message sent successfully!', isError: false });
      setFormData({ name: '', email: '', message: '' });

    } catch (error) {
      console.error('Submission error:', error);
      setStatus({
        message: error.message.includes('credentials')
          ? 'Email service configuration error. Please try again later.'
          : error.message || 'Failed to send message',
        isError: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>Cataract Detection App | AI-Powered Eye Care</title>
        <meta name="description" content="Revolutionary AI-powered cataract detection with secure, private analysis and doctor consultation." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Animated Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <FaEye className="text-2xl" />
              <h1 className="text-2xl font-bold">EyeCare </h1>
            </motion.div>

            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-white hover:text-blue-200 transition-colors">Features</a>
              <a href="#how-it-works" className="text-white hover:text-blue-200 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-white hover:text-blue-200 transition-colors">Testimonials</a>
              <a href="#contact" className="text-white hover:text-blue-200 transition-colors">Contact</a>
            </nav>

            <div className="flex space-x-4">
              <Link href="/auth/login" className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-gray-100 transition-colors font-medium">
                Login
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition-colors font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section with Animation */}
        <section className="relative py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/eye-pattern.svg')] opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                Advanced <span className="text-blue-600">Cataract/Glocuma Detection</span> System
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get accurate, instant analysis of eye scans with our secure platform that connects you to specialists.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="dashboard/uploadEyeImage" className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                  Start Free Analysis
                </Link>
                <a href="#how-it-works" className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg shadow hover:bg-gray-50 transition-colors font-medium text-lg">
                  How It Works
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-12 max-w-4xl mx-auto"
            >
              <img

                src="/images/eye-scan.png"
                // width="700px" height="700px"

                alt="AI Eye Scan Analysis"
                className="rounded-xl shadow-2xl border-8 border-white"
              />
            </motion.div>
          </div>


        </section>

        {/* Trust Indicators */}
        <div className="bg-blue-50 py-6 border-y border-blue-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
              <div className="flex items-center">
                <FaShieldAlt className="text-blue-500 mr-2" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center">
                <FaEye className="text-blue-500 mr-2" />
                <span>95% Detection Accuracy</span>
              </div>
              <div className="flex items-center">
                <FaUserMd className="text-blue-500 mr-2" />
                <span>Certified Ophthalmologists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-blue-800">Powerful Features</h3>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with medical expertise for comprehensive eye care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaEye className="text-4xl text-blue-500" />,
                  title: "AI-Powered Analysis",
                  desc: "Our deep learning models detect cataract signs with 95% accuracy using retinal scans.",
                  bg: "bg-blue-50"
                },
                {
                  icon: <FaShieldAlt className="text-4xl text-blue-500" />,
                  title: "Data Privacy",
                  desc: "Federated learning ensures your sensitive health data never leaves your device.",
                  bg: "bg-blue-50"
                },
                {
                  icon: <FaUserMd className="text-4xl text-blue-500" />,
                  title: "Doctor Network",
                  desc: "Instant access to our network of certified ophthalmologists for consultation.",
                  bg: "bg-blue-50"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`p-8 rounded-xl shadow-md ${feature.bg} border border-blue-100`}
                >
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold text-center text-blue-800 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-center">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-blue-800">Simple 3-Step Process</h3>
              <p className="text-gray-600 mt-2">Get your analysis in minutes, not days</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload Scan",
                  desc: "Securely upload your eye scan through our encrypted portal.",
                  icon: <FaUpload className="text-2xl" />
                },
                {
                  step: "2",
                  title: "AI Analysis",
                  desc: "Our AI processes your scan with state-of-the-art algorithms.",
                  icon: <FaClock className="text-2xl" />
                },
                {
                  step: "3",
                  title: "Get Results",
                  desc: "Receive detailed report and optional doctor consultation.",
                  icon: <FaComments className="text-2xl" />
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-md border border-blue-100 text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-blue-600 font-bold mb-2">STEP {step.step}</div>
                  <h4 className="text-xl font-semibold text-blue-800 mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <img
                  src="/images/doctor-consultation.jpg"
                  alt="Doctor consultation"
                  className="rounded-xl shadow-lg w-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h4 className="text-2xl font-semibold text-blue-800 mb-4">Why Choose Our Platform?</h4>
                <p className="text-gray-600 mb-6">
                  Our AI-powered platform revolutionizes cataract detection by combining medical imaging expertise with
                  the latest advancements in artificial intelligence. We prioritize both accuracy and patient privacy.
                </p>
                <ul className="space-y-3">
                  {[
                    "Instant results with 95% accuracy",
                    "Secure end-to-end encrypted platform",
                    "Network of certified ophthalmologists",
                    "Affordable compared to traditional screening",
                    "Easy-to-understand reports"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-blue-800">Trusted by Patients</h3>
              <p className="text-gray-600 mt-2">What our users say about our service</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "The AI detected my early-stage cataract that my local doctor missed. Lifesaver!",
                  name: "Afzal",
                  role: "Patient"
                },
                {
                  quote: "As a busy professional, the quick online consultation was perfect for me.",
                  name: "M.Yaqoob",
                  role: "Software Engineer"
                },
                {
                  quote: "The detailed report helped me understand my condition better than any clinic visit.",
                  name: "Irshad Ullah",
                  role: "Teacher"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-blue-50 p-6 rounded-xl border border-blue-100"
                >
                  <div className="text-blue-600 text-4xl mb-4">"</div>
                  <p className="text-gray-700 italic mb-4">{testimonial.quote}</p>
                  <div className="font-medium text-blue-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Check Your Eye Health?</h3>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands who've discovered early cataract signs with our AI technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/signup" className="px-8 py-3 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100 transition-colors font-medium text-lg">
                Get Started Free
              </Link>
              <a href="#how-it-works" className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Contact Section
        <section id="contact" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 bg-blue-600 text-white p-8">
                  <h3 className="text-2xl font-bold mb-4">Contact Our Team</h3>
                  <p className="mb-6">
                    Have questions about our service or need support? Our team is here to help.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <span>yaqoob@gmail.com</span>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </div>
                      <span>+92 (348) 954534</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <h4 className="text-xl font-semibold text-blue-800 mb-4">Send us a message</h4>
                  <form className="space-y-4">
                    <div>
                      <input type="text" placeholder="Your Name" className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div>
                      <input type="email" placeholder="Email Address" className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div>
                      <textarea placeholder="Your Message" rows="4" className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"></textarea>
                    </div>
                    <button  type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section> */}




        {/* Contact Section */}
        <section id="contact" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 bg-blue-600 text-white p-8">
                  <h3 className="text-2xl font-bold mb-4">Contact Our Team</h3>
                  <p className="mb-6">
                    Have questions about our service or need support? Our team is here to help.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <span>yaqoob@gmail.com</span>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </div>
                      <span>+92 (348) 954534</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <h4 className="text-xl font-semibold text-blue-800 mb-4">Send us a message</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your Message"
                        rows="4"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        required
                      />
                    </div>
                    {status.message && (
                      <div className={`p-3 rounded-lg ${status.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {status.message}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <FaEye className="text-2xl text-blue-400 mr-2" />
                  <span className="text-xl font-bold">EyeCare AI</span>
                </div>
                <p className="text-gray-400">
                  Advanced AI-powered cataract detection and consultation platform.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">HIPAA Compliance</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                  </a>
                </div>
                <p className="text-gray-400 mt-4">
                  Subscribe to our newsletter for updates
                </p>
                <div className="mt-2 flex">
                  <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} EyeCare . All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}