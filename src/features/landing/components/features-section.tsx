import React from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Everything you need to reach your fitness goals
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            BodyLedger provides all the tools you need to track your fitness journey, from workout templates to progress tracking.
          </motion.p>
        </div>

        {/* Feature 1 - Templates */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            className="order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-xl overflow-hidden">
              <img 
                src="/path/to/template-screenshot.jpg" 
                alt="Template creation interface" 
                className="w-full rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div 
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaDumbbell className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Customizable Templates</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Create personalized workout templates with detailed exercise sets, reps, and weights. Build a library of routines for any fitness goal.
            </p>
            <ul className="space-y-3">
              {[
                'Multiple template types (Workout, Fitness, Supplements)',
                'Easily customize exercises, sets, and rep ranges',
                'Clone and modify existing templates',
                'Save your favorites for quick access'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Feature 2 - Scheduling */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaCalendarAlt className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Smart Scheduling</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Assign templates to specific days and times, create recurring activities, and keep your fitness routine consistent.
            </p>
            <ul className="space-y-3">
              {[
                'Flexible scheduling for any day of the week',
                'Set morning, afternoon, or evening routines',
                'Automatic recurring workouts',
                'Visual weekly calendar view'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-xl overflow-hidden">
              <img 
                src="/path/to/calendar-screenshot.jpg" 
                alt="Weekly schedule view" 
                className="w-full rounded-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Feature 3 - Progress Tracking */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-xl overflow-hidden">
              <img 
                src="/path/to/progress-screenshot.jpg" 
                alt="Progress tracking charts" 
                className="w-full rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div 
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaChartLine className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Comprehensive Tracking</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Track your workout progress, body measurements, and fitness achievements all in one place.
            </p>
            <ul className="space-y-3">
              {[
                'Visualize weightlifting progression',
                'Track body measurements and weight changes',
                'Monitor fitness paces and cardio improvements',
                'Celebrate achievements with milestone badges'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};