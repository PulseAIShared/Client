import {
  Burger,
  Code,
  Drawer,
  Group,
  ScrollArea,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classes from './css/sidebar.module.css';
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
    <Link className="flex items-center" to="/app">

      <span className="text-lg sm:text-xl font-bold text-black">BodyLedger</span>
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
        <nav className={classes.navbar}>
 

          <ScrollArea className={classes.links}>
            <div className={classes.linksInner}>

              {adminLink}
            </div>
          </ScrollArea>

          <div className={classes.footer}>
            {/* Footer content */}
          </div>
        </nav>
      )}

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={toggleDrawer}
        title={<Logo />}
        padding="md"
        size="100%"
        zIndex={1000}
        withCloseButton
        overlayProps={{
          color: theme.colors.gray[2],
          opacity: 0.55,
          blur: 3,
        }}
      >
        <ScrollArea style={{ height: 'calc(100vh - 60px)' }}>
          <div className={classes.linksInner}>
  
            {adminLink}
          </div>
        </ScrollArea>
      </Drawer>
    </>
  );
};