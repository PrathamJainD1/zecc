"use client";

import { Home, Package, BarChart2, MoreHorizontal } from "lucide-react";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "storage", label: "Storage", icon: Package },
  { id: "insights", label: "Insights", icon: BarChart2 },
  { id: "more", label: "More", icon: MoreHorizontal },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? "bg-green-50" : ""
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "stroke-green-600" : "stroke-gray-400"}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
