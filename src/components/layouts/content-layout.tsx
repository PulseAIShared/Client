// src/components/layouts/content-layout.tsx
import * as React from 'react';

type ContentLayoutProps = {
  children: React.ReactNode;
};

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <div className="w-full">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};