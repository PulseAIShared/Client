import {
  Burger,
  Drawer,
  Group,
  ScrollArea,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LinksGroup } from './links';
import { Authorization, ROLES } from '@/lib/authorization';
import { FaUsersCog } from 'react-icons/fa';

export type SideNavigationItem = {
  name: string;
  icon: unknown;
  link: string;
};

type SidebarProps = {
  navigation: SideNavigationItem[];
};

const Logo = () => {
  return (
    <Link className="flex items-center gap-3" to="/app">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">P</span>
      </div>
      <span className="text-lg font-bold text-slate-900">Pulse AI</span>
    </Link>
  );
};

export const Sidebar = ({ navigation }: SidebarProps) => {
  const theme = useMantineTheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  // Close drawer when screen size changes from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpened(false);
    }
  }, [isMobile]);

  // Close drawer when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setDrawerOpened(false);
    }
  }, [location.pathname, isMobile]);

  const toggleDrawer = () => {
    setDrawerOpened((o) => !o);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      toggleDrawer();
    }
  };

  const adminLink = (
    <Authorization allowedRoles={[ROLES.Admin]}>
      <LinksGroup
        name="Admin Panel"
        icon={FaUsersCog}
        link="/app/admin/users"
        onClick={handleLinkClick}
        key="admin-panel"
      />
    </Authorization>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo - only shown in mobile drawer */}
      {isMobile && (
        <div className="p-4 border-b border-slate-200">
          <Logo />
        </div>
      )}

      {/* Navigation Links */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => (
            <LinksGroup
              key={item.name}
              name={item.name}
              icon={item.icon}
              link={item.link}
              onClick={handleLinkClick}
            />
          ))}
          {adminLink}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 text-center">
          Pulse AI Dashboard
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger Icon for Mobile */}
      {isMobile && (
        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          size="sm"
          color={theme.colors.gray[6]}
          className="fixed left-4 top-3 z-50"
          aria-label={drawerOpened ? 'Close navigation' : 'Open navigation'}
        />
      )}

      {/* Sidebar for Desktop */}
      {!isMobile && (
        <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-10">
          {sidebarContent}
        </nav>
      )}

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={toggleDrawer}
        title={null}
        padding={0}
        size="280px"
        zIndex={1000}
        withCloseButton={false}
        overlayProps={{
          color: theme.colors.gray[2],
          opacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
          },
          body: {
            padding: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}