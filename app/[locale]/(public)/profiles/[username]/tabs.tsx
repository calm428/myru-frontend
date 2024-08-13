"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function Tabs({ tabs, activeTab }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || activeTab;
    setCurrentTab(tabFromUrl);
  }, [searchParams, activeTab]);

  const handleTabClick = (tabLabel: string) => {
    setCurrentTab(tabLabel);
    const newUrl = `${pathname}?tab=${tabLabel}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div>
      <div className="tabs pb-4">
        {tabs.map((tab: any) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(tab.label)}
            className={`p-4 ${currentTab === tab.label ? 'border-b-2 border-blue-500' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.map(
          (tab: any) =>
            currentTab === tab.label && (
              <div key={tab.label}>{tab.component}</div>
            )
        )}
      </div>
    </div>
  );
}
