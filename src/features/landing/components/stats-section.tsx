import React from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaChartLine, FaUserFriends } from 'react-icons/fa';

export const StatsSection = () => {
  return (
    <section className="relative z-10 py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Active Users Stat */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-blue-600 flex justify-center items-center gap-3 mb-3">
              <span>10k+</span>
              <FaUserFriends className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-lg font-medium text-gray-900">Active Users</div>
            <div className="text-sm text-gray-500 mt-2">Join our growing community today</div>
          </div>
          
          {/* Workouts Completed Stat */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-blue-600 flex justify-center items-center gap-3 mb-3">
              <span>1M+</span>
              <FaDumbbell className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-lg font-medium text-gray-900">Workouts Completed</div>
            <div className="text-sm text-gray-500 mt-2">Pushing our users to their goals</div>
          </div>
          
          {/* Goal Achievement Stat */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-blue-600 flex justify-center items-center gap-3 mb-3">
              <span>85%</span>
              <FaChartLine className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-lg font-medium text-gray-900">Goal Achievement</div>
            <div className="text-sm text-gray-500 mt-2">Users who reach their fitness targets</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};