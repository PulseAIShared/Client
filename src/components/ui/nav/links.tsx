// src/components/ui/nav/links.tsx
import {
  Group,
  Box,
  ThemeIcon,
  rem,
} from '@mantine/core';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LinksGroupProps {
  icon: React.FC<any>;
  name: string;
  initiallyOpened?: boolean;
  link: string
  onClick: () => void;
}

export function LinksGroup({
  icon: Icon,
  name,
  initiallyOpened,
  link,
  onClick,
}: LinksGroupProps) {
  const location = useLocation();
  const isActive = location.pathname === link || 
    (link !== '/app' && location.pathname.startsWith(link));

  return (
    <Link
      to={link}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
        ${isActive 
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white' 
          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
      )}
      
      <Group justify="space-between" gap={0} className="flex-1">
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeIcon 
            variant="light" 
            size={32}
            className={`
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30' 
                : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }
            `}
          >
            <Icon 
              style={{ width: rem(18), height: rem(18) }} 
              className={isActive ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}
            />
          </ThemeIcon>
          <Box ml="md" className="font-medium">
            {name}
          </Box>
        </Box>
      </Group>
    </Link>
  );
}