import React from 'react';

export const SectionGradientSeparator = ({ className = "" }: { className?: string }) => (
  <div className={`w-full h-32 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent pointer-events-none ${className}`} />
);

export const SectionTransition = ({ variant = 'fade' }: { variant?: string }) => (
  <div className="h-24 w-full bg-gradient-to-b from-transparent to-slate-50/30 opacity-60" />
);