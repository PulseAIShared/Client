import React from 'react';
import './css/hero-section.css';

interface SectionTransitionProps {
  variant?: 'wave' | 'diagonal' | 'curve';
  color?: 'white-to-gray' | 'gray-to-white' | 'white-to-white';
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({ 
  variant = 'wave', 
  color = 'white-to-white' 
}) => {
  const getGradientColors = () => {
    switch (color) {
      case 'white-to-gray':
        return 'from-white to-gray-50/30';
      case 'gray-to-white':
        return 'from-gray-50/30 to-white';
      default:
        return 'from-white to-white';
    }
  };

  const renderWave = () => (
    <div className="relative h-16 overflow-hidden">
      <svg 
        className="absolute bottom-0 left-0 w-full h-16" 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
      >
        <path 
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
          className="fill-current text-sky-100/20"
        />
        <path 
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
          className="fill-current text-sky-200/15"
        />
      </svg>
      
      {/* Floating particles in transition */}
      {[...Array(6)].map((_, i) => {
        const delay = Math.random() * 3;
        const duration = 4 + Math.random() * 2;
        return (
          <div
            key={`transition-particle-${i}`}
            className="absolute opacity-40"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animation: `floatGentle ${duration}s ${delay}s infinite ease-in-out`,
            }}
          >
            <div 
              className="bg-sky-400 rounded-full w-2 h-2 blur-sm"
            ></div>
          </div>
        );
      })}
    </div>
  );

  const renderDiagonal = () => (
    <div className="relative h-12 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColors()} transform -skew-y-1`}>
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 animate-flow-bg"></div>
      </div>
    </div>
  );

  const renderCurve = () => (
    <div className="relative h-20 overflow-hidden">
      <div className="absolute inset-0">
        <svg 
          className="absolute top-0 left-0 w-full h-20" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 C150,60 350,60 600,30 C850,0 1050,60 1200,30 L1200,120 L0,120 Z" 
            className="fill-white"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 via-blue-400/8 to-purple-400/5 animate-flow-bg opacity-50"></div>
      </div>
    </div>
  );

  switch (variant) {
    case 'diagonal':
      return renderDiagonal();
    case 'curve':
      return renderCurve();
    default:
      return renderWave();
  }
};