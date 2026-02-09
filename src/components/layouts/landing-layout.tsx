import { Footer, LandingNavbar } from '@/components/ui/nav';
import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const user = useUser({
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false, 
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
    <div className="min-h-screen bg-white font-inter flex flex-col" id="hero" >
      <LandingNavbar />
      <main className="pt-16 flex-1">{children}</main>
      <Footer />
    </div>
  );
};
