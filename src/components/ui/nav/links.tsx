// src/components/ui/nav/links.tsx
import {
  Group,
  Box,
  ThemeIcon,
  rem,
} from '@mantine/core';

import { NavLink, useLocation } from 'react-router-dom';
import { IconType } from 'react-icons';

export interface LinksGroupProps {
  icon: IconType;
  name: string;
  to: string;
  end?: boolean;
  isActive?: (pathname: string, search: string) => boolean;
  badge?: string | number;
  onClick?: () => void;
}

export function LinksGroup({
  icon: Icon,
  name,
  to,
  end,
  isActive: isActiveFn,
  badge,
  onClick,
}: LinksGroupProps) {
  const location = useLocation();

  // Custom active check takes priority, then fall back to NavLink's built-in matching
  const customActive = isActiveFn
    ? isActiveFn(location.pathname, location.search)
    : undefined;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive: rrActive }) => {
        const active = customActive ?? rrActive;
        return `
          group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 no-underline
          ${active
            ? 'bg-gradient-to-r from-accent-primary/15 to-accent-secondary/15 text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
          }
        `;
      }}
    >
      {({ isActive: rrActive }) => {
        const active = customActive ?? rrActive;
        return (
          <>
            {/* Active indicator bar */}
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-accent-primary to-accent-secondary rounded-r-full shadow-sm"></div>
            )}

            <Group justify="space-between" gap={0} className="flex-1">
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <ThemeIcon
                  variant="light"
                  size={32}
                  className={`
                    transition-all duration-200 group-hover:scale-110
                    ${active
                      ? 'bg-gradient-to-r from-accent-primary/25 to-accent-secondary/25 shadow-sm'
                      : 'bg-surface-secondary/50 group-hover:bg-surface-tertiary/50'
                    }
                  `}
                >
                  <Icon
                    style={{ width: rem(16), height: rem(16) }}
                    className={`transition-colors duration-200 ${
                      active
                        ? 'text-accent-primary'
                        : 'text-text-secondary group-hover:text-text-primary'
                    }`}
                  />
                </ThemeIcon>
                <Box ml="sm" className="text-sm font-medium transition-colors duration-200">
                  {name}
                </Box>
              </Box>

              {badge != null && (
                <span className="ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-full bg-accent-primary/15 text-accent-primary border border-accent-primary/25 min-w-[22px] text-center">
                  {badge}
                </span>
              )}
            </Group>
          </>
        );
      }}
    </NavLink>
  );
}
