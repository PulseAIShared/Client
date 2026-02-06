// src/components/ui/nav/sidebar.tsx
import {
  Burger,
  Code,
  Drawer,
  ScrollArea,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinksGroup } from './links';

import { PlatformAuthorization } from '@/lib/authorization';
import { PlatformRole } from '@/types/api';
import { FaUsersCog, FaNetworkWired, FaListUl, FaHeadset, FaFlask } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useTheme } from '@/lib/theme-context';

export type SideNavigationItem = {
  name: string;
  icon: IconType;
  to: string;
  end?: boolean;
  isActive?: (pathname: string, search: string) => boolean;
  badge?: string | number;
  hidden?: boolean;
};

export type SideNavigationSection = {
  title?: string;
  items: SideNavigationItem[];
};

type SidebarProps = {
  sections: SideNavigationSection[];
};

const Logo = () => {
  return (
    <Link className="flex items-center gap-2 group" to="/app">
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary group-hover:from-accent-secondary group-hover:to-accent-primary transition-all duration-300">
        PulseLTV
      </span>
      <Code fw={700} className="text-xs bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30 rounded px-1.5 py-0.5">BETA</Code>
    </Link>
  );
};

export const Sidebar = ({ sections }: SidebarProps) => {

  const [drawerOpened, setDrawerOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { theme } = useTheme();

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
    <PlatformAuthorization allowedPlatformRoles={[PlatformRole.Admin, PlatformRole.Moderator]}>
      <div className="mt-4 pt-5 border-t border-border-primary/30 space-y-2">
        <div className="px-2">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em]">Admin</h3>
        </div>
        <div className="space-y-1.5">
          <LinksGroup
            name="Users"
            icon={FaUsersCog}
            to="/app/admin/users"
            onClick={handleLinkClick}
            key="admin-users"
          />
          <LinksGroup
            name="Support Dashboard"
            icon={FaHeadset}
            to="/app/admin/support"
            onClick={handleLinkClick}
            key="admin-support"
          />
          <LinksGroup
            name="Waiting List"
            icon={FaListUl}
            to="/app/admin/waiting-list"
            onClick={handleLinkClick}
            key="admin-waiting-list"
          />
          <LinksGroup
            name="Connection Diagnostics"
            icon={FaNetworkWired}
            to="/app/admin/connection-diagnostics"
            onClick={handleLinkClick}
            key="admin-connection-diagnostics"
          />
<LinksGroup
            name="Testing Lab"
            icon={FaFlask}
            to="/app/admin/testing-lab"
            onClick={handleLinkClick}
            key="admin-testing-lab"
          />
        </div>
      </div>
    </PlatformAuthorization>
  );

  const renderItems = (items: SideNavigationItem[]) =>
    items
      .filter((item) => !item.hidden)
      .map((item) => (
        <LinksGroup
          key={item.name}
          name={item.name}
          icon={item.icon}
          to={item.to}
          end={item.end}
          isActive={item.isActive}
          badge={item.badge}
          onClick={handleLinkClick}
        />
      ));

  const sidebarContent = (
    <div className="h-full bg-surface-primary/95 backdrop-blur-xl border-r border-border-primary/30 flex flex-col shadow-lg">
      {/* Navigation - Scrollable area */}
      <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="space-y-6 px-3 py-6">
          {sections.map((section) => (
            <div key={section.title ?? section.items.map((item) => item.name).join('-')} className="space-y-2">
              {section.title && (
                <div className="px-2">
                  <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em]">
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1.5">
                {renderItems(section.items)}
              </div>
            </div>
          ))}
          {adminSection}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 border-t border-border-primary/30">
        <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl p-4 border border-accent-primary/20 hover:border-accent-primary/30 transition-all duration-300">
          <h3 className="text-sm font-medium text-text-primary mb-1">Need Help?</h3>
          <p className="text-xs text-text-secondary mb-3">Get support from our team</p>
          <button className="w-full px-3 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200">
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
          color={theme === 'dark' ? 'white' : 'black'}
          className="fixed left-4 top-3 z-50 hover:scale-110 transition-transform duration-200"
          aria-label={drawerOpened ? 'Close navigation' : 'Open navigation'}
        />
      )}

      {/* Sidebar for Desktop */}
      {!isMobile && (
        <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[264px] z-10">
          {sidebarContent}
        </nav>
      )}

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={toggleDrawer}
        title={<Logo />}
        padding="md"
        size="260px"
        zIndex={1000}
        withCloseButton
        styles={{
          content: {
            backgroundColor: 'rgb(var(--color-surface-primary) / 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgb(var(--color-border-primary) / 0.3)',
          },
          header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid rgb(var(--color-border-primary) / 0.3)',
          },
          title: {
            color: 'rgb(var(--color-text-primary))',
            fontWeight: 'bold',
          },
        }}
        overlayProps={{
          opacity: 0.3,
          blur: 3,
        }}
      >
        <ScrollArea style={{ height: 'calc(100vh - 120px)' }}>
          <div className="space-y-6 py-4">
            {sections.map((section) => (
              <div key={section.title ?? section.items.map((item) => item.name).join('-')} className="space-y-2 px-1.5">
                {section.title && (
                  <div className="px-1.5">
                    <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em]">
                      {section.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-1.5">
                  {renderItems(section.items)}
                </div>
              </div>
            ))}
            {adminSection}
          </div>
        </ScrollArea>
      </Drawer>
    </>
  );
};
