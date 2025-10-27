// src/components/ui/nav/links.tsx
import {
  Group,
  Box,
  ThemeIcon,
  rem,
} from '@mantine/core';

import { Link, useLocation } from 'react-router-dom';
import { IconType } from 'react-icons';

interface LinksGroupProps {
  icon: IconType;
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
  const location = useLocation();
  const isActive = location.pathname === link || 
    (link !== '/app' && location.pathname.startsWith(link));

  return (
    <Link
      to={link}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20
        ${isActive 
          ? 'bg-gradient-to-r from-accent-primary/15 to-accent-secondary/15 text-text-primary shadow-sm' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
        }
      `}
    >
      {/* Enhanced active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-accent-primary to-accent-secondary rounded-r-full shadow-sm"></div>
      )}
      
      <Group justify="space-between" gap={0} className="flex-1">
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeIcon 
            variant="light" 
            size={32}
            className={`
              transition-all duration-200 group-hover:scale-110
              ${isActive 
                ? 'bg-gradient-to-r from-accent-primary/25 to-accent-secondary/25 shadow-sm' 
                : 'bg-surface-secondary/50 group-hover:bg-surface-tertiary/50'
              }
            `}
          >
            <Icon 
              style={{ width: rem(16), height: rem(16) }} 
              className={`transition-colors duration-200 ${
                isActive 
                  ? 'text-accent-primary' 
                  : 'text-text-secondary group-hover:text-text-primary'
              }`}
            />
          </ThemeIcon>
          <Box ml="sm" className="text-sm font-medium transition-colors duration-200">
            {name}
          </Box>
        </Box>
      </Group>
    </Link>
  );
}
