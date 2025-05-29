import * as React from 'react';

type ContentLayoutProps = {
  children: React.ReactNode;
};

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <div className="w-full">
      <div className="max-w-3xl sm:px-0 ">
        {children}
      </div>
    </div>
  );
};


