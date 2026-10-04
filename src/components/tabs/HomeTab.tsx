"use client";

import { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Zap,
  Sun,
  Battery,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Wind,
  Cpu,
  Activity,
} from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import StatusBadge from "@/components/StatusBadge";

interface DashboardData {
  produce: Array<{
    id: number;
    name: string;
    type: string;
    quantity: number;
    unit: string;
    status: string;
    storedAt: string;
    notes: string | null;
  }>;
  produceCount: number;
  chamber: {
    temperature: number;
    humidity: number;
    capacity: number;
    maxCapacity: number;
  } | null;
  systemHealth: Array<{
    id: number;
    componentName: string;
    status: string;
    value: number | null;
    unit: string | null;
    description: string | null;
  }>;
  alerts: Array<{
    id: number;
    title: string;
    message: string;
    severity: string;
    isRead: boolean;
  }>;
  power: {
    solarWatts: number;
    storageWatts: number;
    storagePercent: number;
    systemWatts: number;
    toServerWatts: number;
  } | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

const produceEmojis: Record<string, string> = {
  vegetables: "🥬",
  fruits: "🍎",
  herbs: "🌿",
  grains: "🌾",
};

export default function HomeTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const chamber = data?.chamber;
  const power = data?.power;
  const capacityPct = chamber
    ? Math.round((chamber.capacity / chamber.maxCapacity) * 100)
    : 0;
  const freeKg = chamber ? chamber.maxCapacity - chamber.capacity : 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      optimal: "#16a34a",
      good: "#0ea5e9",
      attention: "#f59e0b",
      critical: "#ef4444",
    };
    return colors[status] ?? "#94a3b8";
  };

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 pt-12 pb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-green-100 text-xs font-medium">PER-ZECC Unit 01</span>
              <span className="text-green-200 text-xs">• Connected (91%)</span>
            </div>
            <h1 className="text-white text-xl font-bold">{greeting}, Ramesh</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <RefreshCw size={14} className={`text-white ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
          </div>
        </div>

        {/* Chamber Climate Card */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Chamber Microclimate</p>
              <p className="text-white font-semibold text-sm mt-0.5">Storage is Healthy</p>
            </div>
            <StatusBadge status="optimal" />
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="flex items-center gap-1">
                <Thermometer size={14} className="text-orange-300" />
                <span className="text-green-100 text-xs">Chamber Temp</span>
              </div>
              <p className="text-white text-3xl font-bold mt-1">
                {chamber?.temperature ?? "—"}
                <span className="text-lg font-normal"> °C</span>
              </p>
              <p className="text-green-200 text-xs mt-0.5">Till the clear layer</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <div className="flex items-center gap-1">
                <Droplets size={14} className="text-blue-300" />
                <span className="text-green-100 text-xs">Relative RH</span>
              </div>
              <p className="text-white text-3xl font-bold mt-1">
                {chamber?.humidity ?? "—"}
                <span className="text-lg font-normal"> %</span>
              </p>
              <p className="text-green-200 text-xs mt-0.5">Mild moisture locked</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-200">Safe range: 10°C – 14°C</span>
              <span className="text-green-200">12.4°C Target Match</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap size={10} /> Hybrid Cooling Active
            </span>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Wind size={10} /> Evaporative + Peltier
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Capacity Overview */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Chamber Capacity</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Unit 01</span>
          </div>
          <div className="flex items-center gap-4">
            <CircularProgress value={capacityPct} size={90} strokeWidth={9} color="#16a34a">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{capacityPct}%</p>
              </div>
            </CircularProgress>
            <div className="flex-1">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-gray-900">{chamber?.capacity ?? 0}</span>
                <span className="text-gray-500 text-sm">/ {chamber?.maxCapacity ?? 175} kg</span>
                <span className="text-xs text-green-600 font-medium ml-1">{freeKg} kg free</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Targeting optimum airflow velocity</p>
              <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-lg">
                🌡️ Chamber 1: 12.2°C · 66% RH · Atmospheric rec...
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">System Health</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Live Sync · Just now</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Compressor */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Compressor</p>
                  <StatusBadge status="active" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {data?.systemHealth?.find(h => h.componentName === "Compressor")?.value ?? 82}
                <span className="text-xs font-normal text-gray-500 ml-0.5">W</span>
              </p>
              <p className="text-xs text-gray-500">Auto-regulating</p>
            </div>

            {/* Solar */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Sun size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Solar Panel</p>
                  <p className="text-[10px] text-amber-600">Day</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {data?.systemHealth?.find(h => h.componentName === "Solar Panel")?.value ?? 46}
                <span className="text-xs font-normal text-gray-500 ml-0.5">W</span>
              </p>
              <p className="text-xs text-gray-500">Direct solar peak</p>
            </div>

            {/* Evaporative Water */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Droplets size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Evap. Water</p>
                  <p className="text-[10px] text-blue-600">
                    {data?.systemHealth?.find(h => h.componentName === "Evaporative Water")?.value ?? 45}%
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {data?.systemHealth?.find(h => h.componentName === "Evaporative Water")?.description ?? "Good"}
              </p>
              <p className="text-xs text-gray-500">Main chamber full</p>
            </div>

            {/* Battery */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Battery size={14} className="text-sky-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Battery</p>
                  <StatusBadge status="charging" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {data?.systemHealth?.find(h => h.componentName === "Battery Reserve")?.value ?? 92}
                <span className="text-xs font-normal text-gray-500 ml-0.5">%</span>
              </p>
              <p className="text-xs text-gray-500">4.2 hrs remaining</p>
            </div>
          </div>

          {/* Alert Banner */}
          {data?.alerts?.filter(a => !a.isRead).slice(0, 1).map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl p-3 flex gap-2 ${
                alert.severity === "warning"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              {alert.severity === "warning" ? (
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-semibold text-gray-800">{alert.title}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{alert.message}</p>
                <button className="text-xs text-amber-600 font-medium mt-1 underline">
                  View Alert →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stored Produce */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Stored Produce</h2>
              <p className="text-xs text-gray-500">{data?.produceCount ?? 0} Batches</p>
            </div>
            <button
              onClick={() => onNavigate("storage")}
              className="text-xs text-green-600 font-medium flex items-center gap-0.5"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {data?.produce?.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {produceEmojis[item.type] ?? "🥬"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <span
                      className="text-sm font-bold ml-2"
                      style={{ color: getStatusColor(item.status) }}
                    >
                      {item.quantity} kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: item.status === "optimal" ? "#dcfce7" :
                          item.status === "good" ? "#dbeafe" : "#fef3c7",
                        color: item.status === "optimal" ? "#15803d" :
                          item.status === "good" ? "#1d4ed8" : "#d97706",
                      }}
                    >
                      ● {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <span className="text-[10px] text-gray-400">{timeAgo(item.storedAt)}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Power Status */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Power Status</h2>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              ⚡ Solar Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <Sun size={16} className="text-amber-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{power?.solarWatts ?? 82}W</p>
              <p className="text-[10px] text-gray-500">Solar</p>
            </div>
            <div className="bg-sky-50 rounded-xl p-3 text-center">
              <Battery size={16} className="text-sky-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{power?.storagePercent ?? 78}%</p>
              <p className="text-[10px] text-gray-500">Battery</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <Cpu size={16} className="text-green-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{power?.systemWatts ?? 46}W</p>
              <p className="text-[10px] text-gray-500">System</p>
            </div>
          </div>
          {power && (
            <div className="mt-3 bg-green-50 rounded-xl p-2.5 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700">
                100% Solar Independence achieved today. Net Energy Balance: +{power.toServerWatts}W
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={() => onNavigate("storage")}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            <span>+</span> Add Produce
          </button>
          <button className="flex-1 bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Activity size={15} /> Run Self-Test
          </button>
        </div>
      </div>
    </div>
  );
}
