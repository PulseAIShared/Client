import { Sidebar, SideNavigationItem } from "../ui/nav";
import { TopNav } from "../ui/nav/top-navigation";
import { BiSolidDashboard } from "react-icons/bi";
import { VscNotebookTemplate } from "react-icons/vsc";
import { IoMdSettings } from "react-icons/io";
import { GiProgression } from "react-icons/gi";
import { FaBell } from "react-icons/fa";
import { useMediaQuery } from "@mantine/hooks";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const navigation: SideNavigationItem[] = [
    {
      name: 'Dashboard',
      icon: BiSolidDashboard,
      link: '/app'
    },
    {
      name: 'Templates',
      icon: VscNotebookTemplate,
      link: '/app/templates'
    },
    {
      name: 'Progress',
      icon: GiProgression,
      link: '/app/progress'
    },
    {
      name: 'Inbox',
      icon: FaBell,
      link: '/app/inbox'
    },
    {
      name: 'Settings',
      icon: IoMdSettings,
      link: '/app/settings'
    },
  ];

  return (
    <div className="flex w-full flex-col bg-gray-50 min-h-screen">
      <TopNav />
      <div className="flex flex-grow min-h-0">
        <Sidebar navigation={navigation} />
        <div className="flex-1 overflow-x-hidden">
          <main className={`mt-16 ${isMobile ? 'p-4' : 'ml-64 p-6'} max-w-none w-full`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}