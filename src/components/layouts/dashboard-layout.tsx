// src/components/layouts/dashboard-layout.tsx
import { Sidebar, SideNavigationItem } from "../ui/nav";
import { TopNav } from "../ui/nav/top-navigation";
import { BiSolidDashboard } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { TbPlugConnected } from "react-icons/tb";
import { GiProgression } from "react-icons/gi";
import { FaUser, FaUsers } from "react-icons/fa";
import { useMediaQuery } from "@mantine/hooks";
import { MdSegment, MdCampaign, MdPayments } from "react-icons/md";
import { BsChatDots } from "react-icons/bs";
import { useTheme } from "@/lib/theme-context";


type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { theme } = useTheme();

  const navigation: SideNavigationItem[] = [
    {
      name: 'Dashboard',
      icon: BiSolidDashboard,
      link: '/app'
    },

    {
      name: 'Customers',
      icon: FaUser,
      link: '/app/customers'
    },
    {
      name: 'Segments',
      icon: MdSegment,
      link: '/app/segments'
    },
    {
      name: 'Campaigns',
      icon: MdCampaign,
      link: '/app/campaigns'
    },
    {
      name: 'Recovery',
      icon: MdPayments,
      link: '/app/recovery'
    },
    {
      name: 'Insights',
      icon: GiProgression,
      link: '/app/insights'
    },
    {
      name: 'Conversations',
      icon: BsChatDots,
      link: '/app/conversations'
    },
    {
      name: 'Team',
      icon: FaUsers,
      link: '/app/team'
    },
    {
      name: 'Integrations',
      icon: TbPlugConnected,
      link: '/app/integrations'
    },
    {
      name: 'Settings',
      icon: IoMdSettings,
      link: '/app/settings'
    }
  ];

  return (
    <div className="flex w-full flex-col bg-bg-primary min-h-screen transition-colors duration-300">
      {/* Debug theme indicator */}

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
