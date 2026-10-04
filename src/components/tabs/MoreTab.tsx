"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Sun,
  Battery,
  Server,
  Cpu,
  TrendingUp,
  Activity,
  Shield,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Wind,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const powerFlowData = [
  { time: "6am", solar: 15, battery: 40, load: 35 },
  { time: "9am", solar: 55, battery: 65, load: 42 },
  { time: "12pm", solar: 82, battery: 78, load: 46 },
  { time: "3pm", solar: 75, battery: 80, load: 44 },
  { time: "6pm", solar: 30, battery: 75, load: 48 },
  { time: "9pm", solar: 0, battery: 60, load: 40 },
];

interface PowerData {
  solarWatts: number;
  storageWatts: number;
  storagePercent: number;
  systemWatts: number;
  toServerWatts: number;
}

export default function MoreTab() {
  const [power, setPower] = useState<PowerData | null>(null);
  const [running, setRunning] = useState(false);
  const [alerts, setAlerts] = useState<Array<{
    id: number;
    title: string;
    message: string;
    severity: string;
    isRead: boolean;
  }>>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setPower(json.data.power);
          setAlerts(json.data.alerts || []);
        }
      })
      .catch(console.error);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunDiagnostics = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 3000);
  };

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">PER-ZECC Unit 01</h1>
            <p className="text-xs text-gray-500">More · System Overview</p>
          </div>
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <Activity size={16} className="text-green-600" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Cooling System Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-green-800 mb-1">
            Cooling automatically blends evaporative moisture with thermoelectric chill to prevent produce dehydration
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Wind size={12} className="text-green-600" />
            <span className="text-[10px] text-green-700">Active hybrid mode · Optimal efficiency</span>
          </div>
        </div>

        {/* Live Microgrid Flow */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Live Microgrid Flow</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-500">Sustaining</span>
            </div>
          </div>

          {/* Power Flow Diagram */}
          <div className="flex items-center justify-between mb-4">
            {/* Solar */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Sun size={20} className="text-amber-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{power?.solarWatts ?? 82}W</p>
                <p className="text-[10px] text-gray-500">Solar</p>
                <p className="text-[9px] text-green-600">Peak today 11:00</p>
              </div>
            </div>

            {/* Flow arrows */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-0.5 bg-gradient-to-r from-amber-300 to-sky-300 rounded-full" />
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[9px] text-gray-500">Net Energy Balance</p>
              </div>
              <p className="text-[10px] font-bold text-green-600">+{power?.toServerWatts ?? 8.4}W</p>
            </div>

            {/* Storage */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
                <Battery size={20} className="text-sky-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{power?.storagePercent ?? 78}%</p>
                <p className="text-[10px] text-gray-500">Storage</p>
                <p className="text-[9px] text-sky-600">+{power?.storageWatts ?? 46}W charging</p>
              </div>
            </div>
          </div>

          {/* System & Server */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={14} className="text-green-600" />
                <p className="text-xs font-medium text-gray-700">System Load</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-gray-900">{power?.systemWatts ?? 46}</p>
                <p className="text-xs text-gray-500">W</p>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Peak today 70W</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Server size={14} className="text-blue-500" />
                <p className="text-xs font-medium text-gray-700">To Server</p>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-gray-900">+{power?.toServerWatts ?? 8.4}</p>
                <p className="text-xs text-gray-500">W</p>
              </div>
              <p className="text-[10px] text-green-600 mt-0.5">Surplus recovered</p>
            </div>
          </div>
        </div>

        {/* Peltier Energy Recovery */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800">Peltier Energy Recovery</h2>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
              79% · ≈0% efficiency
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Heat dissipated from the Peltier hot-side is captured by fins treated to generate electricity from the temperature differential, and in turn powers auxiliary inner cooling saving energy and amplifying efficiency by 15%.
          </p>

          {/* Mini chart */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "79%" }} />
            </div>
            <span className="text-xs font-bold text-green-600">79%</span>
          </div>

          <div className="bg-amber-50 rounded-xl p-2.5">
            <p className="text-[10px] text-amber-700">
              ⚡ Aux Sensor 02: Running at elevated temperature. Monitor trend.
            </p>
          </div>
        </div>

        {/* Daily Power Balance Chart */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Daily Power Balance</h2>
              <p className="text-[10px] text-gray-500">Today (04:00 – 18:00)</p>
            </div>
            <BarChart3 size={14} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={powerFlowData}>
              <defs>
                <linearGradient id="solarGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, border: "none" }} />
              <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarGrad2)" strokeWidth={2} dot={false} name="Solar (W)" />
              <Area type="monotone" dataKey="load" stroke="#0ea5e9" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Load (W)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-2 flex items-center gap-2">
            <CheckCircle size={12} className="text-green-600" />
            <p className="text-[10px] text-green-700 font-medium">
              100% Solar Independence achieved today
            </p>
          </div>
        </div>

        {/* Hardware Reliability */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Hardware Reliability</h2>
            <Shield size={14} className="text-green-600" />
          </div>

          <div className="space-y-3">
            {[
              {
                name: "PV Array Status",
                detail: "Optimal · 0 shading detected",
                value: "96%",
                valueColor: "text-green-600",
                icon: Sun,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-500",
              },
              {
                name: "Cell Degradation",
                detail: "Annual estimate: -0.3% loss",
                value: "Grade A",
                valueColor: "text-blue-600",
                icon: Battery,
                iconBg: "bg-sky-100",
                iconColor: "text-sky-500",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-9 h-9 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={item.iconColor} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                  <p className={`text-sm font-bold ${item.valueColor}`}>{item.value}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={running}
            className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-green-200"
          >
            {running ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Activity size={14} />
            )}
            {running ? "Running Diagnostics..." : "Run Microgrid Efficiency Diagnostics"}
          </button>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Notifications</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {alerts.filter((a) => !a.isRead).length} unread
              </span>
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl p-3 border ${
                    alert.isRead
                      ? "bg-gray-50 border-gray-100"
                      : alert.severity === "warning"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.severity === "warning" ? (
                      <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">{alert.title}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{alert.message}</p>
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="text-[10px] text-green-600 font-medium mt-1"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="space-y-1">
            {[
              { icon: TrendingUp, label: "Export Data Report", color: "text-green-600", bg: "bg-green-50" },
              { icon: Shield, label: "Security & Privacy Settings", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: RefreshCw, label: "Check for Firmware Updates", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: Zap, label: "Configure Power Thresholds", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={14} className={action.color} />
                  </div>
                  <p className="text-sm text-gray-700 flex-1 text-left">{action.label}</p>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4 pb-8">
          <p className="text-xs text-gray-400">PER-ZECC Smart Storage v2.1.4</p>
          <p className="text-[10px] text-gray-300 mt-0.5">© 2024 ZeroEnergy Cold Chain</p>
        </div>
      </div>
    </div>
  );
}
