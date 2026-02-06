// src/components/layouts/dashboard-layout.tsx
import { Sidebar, SideNavigationSection } from "../ui/nav";
import { TopNav } from "../ui/nav/top-navigation";
import { BiSolidDashboard } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { TbPlugConnected } from "react-icons/tb";
import { GiProgression } from "react-icons/gi";
import { FaUser, FaUsers } from "react-icons/fa";
import { useMediaQuery } from "@mantine/hooks";
import { MdSegment, MdCampaign, MdInsights } from "react-icons/md";
import { BsChatDots } from "react-icons/bs";
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { useGetDashboardData } from "@/features/dashboard/api/dashboard";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch pending count for badge on Work Queue
  const { data: dashboardData } = useGetDashboardData();
  const pendingApprovals = dashboardData?.workQueueSummary?.pendingApprovals;

  const navigationSections: SideNavigationSection[] = [
    {
      title: 'Core',
      items: [
        {
          name: 'Dashboard',
          icon: BiSolidDashboard,
          to: '/app',
          end: true,
        },
        {
          name: 'Customers',
          icon: FaUser,
          to: '/app/customers',
        },
        {
          name: 'Segments',
          icon: MdSegment,
          to: '/app/segments',
        },
      ],
    },
    {
      title: 'Automation',
      items: [
        {
          name: 'Playbooks',
          icon: MdCampaign,
          to: '/app/playbooks',
        },
        {
          name: 'Work Queue',
          icon: HiOutlineClipboardDocumentCheck,
          to: '/app/work-queue',
          badge: pendingApprovals && pendingApprovals > 0 ? pendingApprovals : undefined,
        },
        {
          name: 'Conversations',
          icon: BsChatDots,
          to: '/app/conversations',
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          name: 'Impact',
          icon: MdInsights,
          to: '/app/impact',
        },
        {
          name: 'Insights',
          icon: GiProgression,
          to: '/app/insights',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          name: 'Team',
          icon: FaUsers,
          to: '/app/team',
        },
        {
          name: 'Integrations',
          icon: TbPlugConnected,
          to: '/app/integrations',
        },
        {
          name: 'Settings',
          icon: IoMdSettings,
          to: '/app/settings',
        },
      ],
    },
  ];

  return (
    <div className="flex w-full flex-col bg-bg-primary min-h-screen transition-colors duration-300">
      <TopNav />
      <div className="flex flex-grow min-h-0">
        <Sidebar sections={navigationSections} />
        <div className="flex-1 overflow-x-hidden">
          <main className={`mt-16 md:mt-20 ${isMobile ? 'px-4 py-6' : 'pl-[264px] pr-8 py-8'} min-h-screen`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
