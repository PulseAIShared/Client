import { Link } from 'react-router-dom';



import { useUser } from '@/lib/auth';

export const Navbar = () => {


  const Logo = () => {
    return (
      <Link className="-ml-60 flex items-center" to="/">

        <span className="text-xl font-bold text-white">Trackspace</span>
      </Link>
    );
  };

  return (
    <nav className="bg-purple-900 py-4 text-white">
      <div className="container mx-auto flex items-center justify-between">   
        <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-purple-200">
              Login
            </Link>
        </div>
      </div>
    </nav>
  );
};
