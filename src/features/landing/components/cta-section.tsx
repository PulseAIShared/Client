import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/components/ui/link';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

export const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to start your fitness journey?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands of users who have transformed their fitness tracking with BodyLedger.
            Our platform gives you all the tools you need to achieve your fitness goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/auth/register"
              className="inline-block px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-200"
            >
              Get started for free
            </Link>
            <Link 
              to="/auth/login" 
              className="inline-block px-6 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200"
            >
              Log in
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <p className="text-gray-500 text-sm">Coming soon to:</p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
                <FaApple className="h-5 w-5" />
                <span>App Store</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
                <FaGooglePlay className="h-5 w-5" />
                <span>Play Store</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};