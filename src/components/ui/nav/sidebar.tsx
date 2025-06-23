// src/components/ui/nav/sidebar.tsx
import {
  Burger,
  Code,
  Drawer,
  ScrollArea,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinksGroup } from './links';

import { Authorization, ROLES } from '@/lib/authorization';
import { FaUsersCog, FaNetworkWired } from 'react-icons/fa';
import { IconType } from 'react-icons';

export type SideNavigationItem = {
  name: string;
  icon: IconType;
  link: string;
};


type SidebarProps = {
  navigation: SideNavigationItem[];
};

const Logo = () => {
  return (
    <Link className="flex items-center gap-2" to="/app">
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
        PulseLTV
      </span>
      <Code fw={700} className="text-xs">BETA</Code>
    </Link>
  );
};

export const Sidebar = ({ navigation }: SidebarProps) => {
  const theme = useMantineTheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Close drawer when screen size changes from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpened(false);
    }
  }, [isMobile]);

  const toggleDrawer = () => {
    setDrawerOpened((o) => !o);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      toggleDrawer();
    }
  };

  const adminSection = (
    <Authorization allowedRoles={[ROLES.Admin]}>
      <div className="mt-6 pt-6 border-t border-border-primary/50">
        <div className="px-4 mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Admin</h3>
        </div>
        <LinksGroup
          name="Users"
          icon={FaUsersCog}
          link="/app/admin/users"
          onClick={handleLinkClick}
          key="admin-users"
        />
        <LinksGroup
          name="Connection Diagnostics"
          icon={FaNetworkWired}
          link="/app/admin/connection-diagnostics"
          onClick={handleLinkClick}
          key="admin-connection-diagnostics"
        />
      </div>
    </Authorization>
  );

  const sidebarContent = (
    <div className="h-full bg-surface-primary/95 backdrop-blur-lg border-r border-border-primary/50">
      {/* Header */}


      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-6">
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
          {adminSection}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 border-t border-border-primary/50">
        <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-lg p-4 border border-accent-primary/30">
          <h3 className="text-sm font-medium text-text-primary mb-1">Need Help?</h3>
          <p className="text-xs text-text-secondary mb-3">Get support from our team</p>
          <button className="w-full px-3 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-medium rounded-md hover:shadow-lg transition-all duration-200">
            Contact Support
          </button>
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
          color="white"
          className="fixed left-4 top-3 z-50"
          aria-label={drawerOpened ? 'Close navigation' : 'Open navigation'}
        />
      )}

      {/* Sidebar for Desktop */}
      {!isMobile && (
        <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[300px] z-10">
          {sidebarContent}
        </nav>
      )}

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={toggleDrawer}
        title={<Logo />}
        padding="md"
        size="280px"
        zIndex={1000}
        withCloseButton
        styles={{
          content: {
            backgroundColor: 'rgb(var(--color-surface-primary) / 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgb(var(--color-border-primary) / 0.5)',
          },
          header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid rgb(var(--color-border-primary) / 0.5)',
          },
          title: {
            color: 'rgb(var(--color-text-primary))',
            fontWeight: 'bold',
          },
        }}
        overlayProps={{
          color: theme.colors.gray[2],
          opacity: 0.55,
          blur: 3,
        }}
      >
        <ScrollArea style={{ height: 'calc(100vh - 120px)' }}>
          <div className="space-y-2 py-4">
            {navigation.map((item) => (
              <LinksGroup
                key={item.name}
                name={item.name}
                icon={item.icon}
                link={item.link}
                onClick={handleLinkClick}
              />
            ))}
            {adminSection}
          </div>
        </ScrollArea>
      </Drawer>
    </>
  );
};