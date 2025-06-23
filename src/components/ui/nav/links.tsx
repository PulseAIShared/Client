// src/components/ui/nav/links.tsx
import {
  Group,
  Box,
  ThemeIcon,
  rem,
} from '@mantine/core';

import { Link, useLocation } from 'react-router-dom';

interface LinksGroupProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
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
        group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none
        ${isActive 
          ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-text-primary' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-accent-primary to-accent-secondary rounded-r-full" />
      )}
      
      <Group justify="space-between" gap={0} className="flex-1">
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeIcon 
            variant="light" 
            size={32}
            className={`
              ${isActive 
                ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30' 
                : 'bg-surface-secondary/50 group-hover:bg-surface-tertiary/50'
              }
            `}
          >
            <Icon 
              style={{ width: rem(18), height: rem(18) }} 
              className={isActive ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'}
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