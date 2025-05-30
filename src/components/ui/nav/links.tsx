import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LinksGroupProps {
  icon: React.FC<any>;
  name: string;
  initiallyOpened?: boolean;
  link: string;
  onClick: () => void;
}

export function LinksGroup({
  icon: Icon,
  name,
  initiallyOpened,
  link,
  onClick,
}: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);
  const location = useLocation();
  
  // Check if the current link is active
  const isActive = location.pathname === link || 
    (link !== '/app' && location.pathname.startsWith(link));
  
  return (
    <Link
      to={link}
      onClick={onClick}
      className={`
        group flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' 
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
        }
      `}
    >
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600'
        }
      `}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-medium text-sm">{name}</span>
    </Link>
  );
}