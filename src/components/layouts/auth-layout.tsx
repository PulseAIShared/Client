import * as React from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';
import { resolveReturnPath } from '@/lib/auth-redirect';


type LayoutProps = {
  children: React.ReactNode;
};

export const AuthLayout = ({ children }: LayoutProps) => {

  const user = useUser({
    refetchOnMount: 'always',
    retry: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const hasToken = Boolean(getToken());
  const returnTo = resolveReturnPath(new URLSearchParams(location.search).get('returnTo'));

  useEffect(() => {
    if (user.data && hasToken) {
      navigate(returnTo ?? '/app', {
        replace: true,
      });
    }
  }, [hasToken, navigate, returnTo, user.data]);

  return (
  <> {children} </>
  );
};
