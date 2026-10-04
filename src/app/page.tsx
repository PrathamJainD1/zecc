"use client";

import { useState } from "react";
import TabBar from "@/components/TabBar";
import HomeTab from "@/components/tabs/HomeTab";
import StorageTab from "@/components/tabs/StorageTab";
import InsightsTab from "@/components/tabs/InsightsTab";
import MoreTab from "@/components/tabs/MoreTab";

export default function Page() {
  const [activeTab, setActiveTab] = useState("home");

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab onNavigate={setActiveTab} />;
      case "storage":
        return <StorageTab />;
      case "insights":
        return <InsightsTab />;
      case "more":
        return <MoreTab />;
      default:
        return <HomeTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="mobile-container">
      {/* Status bar simulation */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex items-center justify-between px-5 py-2 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <span className="text-[11px] font-semibold text-gray-700">9:41</span>
        <div className="w-20 h-5 bg-black rounded-full" />
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 items-end">
            <div className="w-0.5 h-1.5 bg-gray-700 rounded-full" />
            <div className="w-0.5 h-2 bg-gray-700 rounded-full" />
            <div className="w-0.5 h-2.5 bg-gray-700 rounded-full" />
            <div className="w-0.5 h-3 bg-gray-700 rounded-full" />
          </div>
          <svg width="14" height="10" viewBox="0 0 14 10" className="text-gray-700">
            <path d="M7 2.5C9.2 0.8 11.8 0 14 0s0 0 0 0L7 7 0 0c2.2 0 4.8.8 7 2.5z" fill="currentColor" opacity="0.3"/>
            <path d="M7 4.5C8.7 3.2 10.5 2.5 12 2.5L7 7.5 2 2.5c1.5 0 3.3.7 5 2z" fill="currentColor" opacity="0.6"/>
            <path d="M7 6.5C8.2 5.7 9.3 5.5 10 5.5L7 8.5 4 5.5c.7 0 1.8.2 3 1z" fill="currentColor"/>
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="w-5 h-2.5 border border-gray-700 rounded-sm p-0.5">
              <div className="bg-green-500 h-full rounded-sm" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="relative z-0 overflow-y-auto h-screen">
        {renderTab()}
      </div>

      {/* Tab bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
