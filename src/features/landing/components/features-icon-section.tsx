import React from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { BiRun } from 'react-icons/bi';
import { TbWeight } from 'react-icons/tb';

export const FeatureIconsSection = () => {
  const features = [
    {
      name: 'Workout Tracking',
      description: 'Log sets, reps, and weights for every exercise',
      icon: <FaDumbbell className="h-10 w-10 text-blue-500" />
    },
    {
      name: 'Weight Monitoring',
      description: 'Track your body weight changes over time',
      icon: <TbWeight className="h-10 w-10 text-blue-500" />
    },
    {
      name: 'Fitness Progress',
      description: 'Monitor your cardio and endurance improvements',
      icon: <BiRun className="h-10 w-10 text-blue-500" />
    },
    {
      name: 'Calendar View',
      description: 'Plan your workouts with our intuitive calendar',
      icon: <FaCalendarAlt className="h-10 w-10 text-blue-500" />
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Track everything in one place
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            BodyLedger combines all your fitness tracking needs in a single, intuitive platform
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};