import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';


type LayoutProps = {
  children: React.ReactNode;
};

export const AuthLayout = ({ children }: LayoutProps) => {

  const user = useUser({
    refetchOnMount: 'always',
    retry: false,
  });

  const navigate = useNavigate();
  const hasToken = Boolean(getToken());

  useEffect(() => {
    if (user.data && hasToken) {
      navigate('/app', {
        replace: true,
      });
    }
  }, [hasToken, user.data, navigate]);

  return (
  <> {children} </>
  );
};
