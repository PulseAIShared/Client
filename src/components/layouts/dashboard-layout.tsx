// src/components/layouts/dashboard-layout.tsx
import { Sidebar, SideNavigationItem } from "../ui/nav";
import { TopNav } from "../ui/nav/top-navigation";
import { BiSolidDashboard } from "react-icons/bi";
import { VscNotebookTemplate } from "react-icons/vsc";
import { IoMdSettings } from "react-icons/io";
import { GiProgression } from "react-icons/gi";
import { FaUser } from "react-icons/fa";
import { useMediaQuery } from "@mantine/hooks";
import { MdSegment } from "react-icons/md";
type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const navigation: SideNavigationItem[] = [
    {
      name: 'Dashboard',
      icon: BiSolidDashboard,
      link:  '/app'
    },
    {
      name: 'Customers',
      icon: FaUser,
      link: './customers'
    },
    {
      name: 'Segments',
      icon: MdSegment,
      link: './segments'
    },
    {
      name: 'Insights',
      icon: GiProgression,
      link: './insights'
    },
    {
      name: 'Settings',
      icon: IoMdSettings,
      link: './settings'
    },
  ];

  return (
    <div className="flex w-full flex-col bg-gradient-to-br from-slate-900 via-purple-800 to-slate-900 min-h-screen">
      <TopNav />
      <div className="flex flex-grow min-h-0">
        <Sidebar navigation={navigation} />
        <div className="flex-1 overflow-x-hidden">
          <main className={`mt-16 md:mt-20 ${isMobile ? 'px-4 py-6' : 'pl-[300px] pr-8 py-8'} min-h-screen`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}