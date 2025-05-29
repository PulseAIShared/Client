import React from 'react';
import { Link } from '@/components/ui/link';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      ></div>
      
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-blue-900/60 z-1"></div>
      
      {/* Animated floating particles (dots) */}
      <div className="absolute inset-0 z-1">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              FITNESS
            </span>
            <br />
            <span className="text-white">REIMAGINED</span>
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 drop-shadow-md font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Track your progress. Crush your goals.<br />
          The ultimate fitness companion for your journey.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          <Link 
            to="/auth/register" 
            className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-200"
          >
            START YOUR JOURNEY
          </Link>
          <Link 
            to="/auth/login" 
            className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white/30 backdrop-blur-sm rounded-lg hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-200"
          >
            SIGN IN
          </Link>
        </motion.div>
      </div>
      
      {/* Animated arrow pointing down */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M12 5V19M12 19L19 12M12 19L5 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      
      {/* App preview floating at the bottom */}
      <motion.div 
        className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-10"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
 
      </motion.div>
    </section>
  );
};