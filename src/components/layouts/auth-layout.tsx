import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/lib/auth';


type LayoutProps = {
  children: React.ReactNode;
};

export const AuthLayout = ({ children }: LayoutProps) => {

  const user = useUser({

  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user.data) {
      navigate('/app', {
        replace: true,
      });
    }
  }, [user.data, navigate]);

  return (
  <> {children} </>
  );
};
