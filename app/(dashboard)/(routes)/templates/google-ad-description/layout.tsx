import { Heading } from "@/components/heading";
import { Zap } from "lucide-react";
import React, { FC } from "react";
import { getHistory } from "@/lib/actions";
import HistorySidebarMobile from "@/components/history-sidebar-mobile";
import HistorySidebar from "@/components/history-sidebar";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google-ad-description",
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: FC<LayoutProps> = async ({ children }) => {
  const history = await getHistory("GOOGLE_AD_DESCRIPTION");
  return (
    <div className="relative h-[calc(100vh-4.5rem)] overflow-y-auto flex md:divide-x">
      <div className="flex grow overflow-y-auto flex-col">
        <div className="flex justify-between items-start pr-6">
          <Heading
            title="GOOGLE AD DESCRIPTION"
            description={`Generate compelling and original content for the "Description" section of your Google Ads that effectively drives conversions.`}
            icon={Zap}
            iconColor="text-gray-500 dark:text-gray-300"
            bgColor="bg-gray-100 dark:bg-gray-800"
          />
          <HistorySidebarMobile
            generateNewEndpoint="/templates/google-ad-description"
            history={history}
          />
        </div>

        {children}
      </div>

      <div className="hidden lg:block">
        <HistorySidebar
          generateNewEndpoint="/templates/google-ad-description"
          history={history}
        />
      </div>
    </div>
  );
};

export default Layout;
