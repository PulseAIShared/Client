import { Footer } from '@/components/ui/nav';
import { Navbar } from '@/components/ui/nav';
import { useUser } from '@/lib/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function LandingLayout({ children }: { children: React.ReactNode }){

  const user = useUser({
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false,
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
    <div>    
      <main>{children}</main>
    </div>
  );
};
