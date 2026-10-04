"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Shield,
  Activity,
  Clock,
  TrendingUp,
  Sun,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

// Thermal retention data (simulated hourly)
const thermalData = [
  { time: "04:00", indoor: 11.8, outdoor: 18 },
  { time: "08:00", indoor: 12.1, outdoor: 24 },
  { time: "12:00", indoor: 12.4, outdoor: 31 },
  { time: "14:00", indoor: 12.6, outdoor: 34 },
  { time: "16:00", indoor: 12.3, outdoor: 30 },
  { time: "20:00", indoor: 12.0, outdoor: 25 },
];

// Power balance data
const powerData = [
  { time: "06:00", solar: 20, consumption: 35 },
  { time: "09:00", solar: 55, consumption: 42 },
  { time: "12:00", solar: 82, consumption: 46 },
  { time: "15:00", solar: 75, consumption: 44 },
  { time: "18:00", solar: 30, consumption: 48 },
  { time: "21:00", solar: 0, consumption: 40 },
];

const subsystems = [
  {
    name: "Airflow circulation fan",
    status: "active",
    detail: "Active (Low RPM)",
    icon: Wind,
    color: "#16a34a",
    iconBg: "bg-green-100",
  },
  {
    name: "Misting nozzles",
    status: "good",
    detail: "Clear · No calcification",
    icon: Droplets,
    color: "#0ea5e9",
    iconBg: "bg-sky-100",
  },
  {
    name: "Magnetic door sensor",
    status: "optimal",
    detail: "Sealed & Locked",
    icon: Shield,
    color: "#8b5cf6",
    iconBg: "bg-purple-100",
  },
];

const coolingFeatures = [
  {
    icon: Zap,
    title: "Super-Insulated Beta",
    subtitle: "Chamber mode",
    description: "Chamber maintains 26°C below ambient farm temperature.",
    status: "active",
    color: "#0ea5e9",
    bg: "bg-sky-50",
  },
  {
    icon: Wind,
    title: "Hybrid Cooling Architecture",
    subtitle: "Biomimetic dual-stage system",
    description: "Dual-mode cooling with smart switching for efficiency.",
    status: "active",
    color: "#16a34a",
    bg: "bg-green-50",
    badge: "Dual Mode",
  },
  {
    icon: Droplets,
    title: "Evaporative Cooling",
    subtitle: "Natural-stage Zonal Air Circ.",
    description:
      "Primary baseline cooling maintaining high humidity without produce weight loss.",
    status: "active",
    color: "#0ea5e9",
    bg: "bg-sky-50",
    extra: "Misting Rate: 0.4 L/hr · Continuous",
  },
  {
    icon: Thermometer,
    title: "Peltier Thermoelectric Core",
    subtitle: "Solid-State Module TEC-...",
    description:
      "Auxiliary chill dialed down precisely to maintain strict cooling thresholds.",
    status: "cycling",
    statusLabel: "Cycling 45%",
    color: "#f59e0b",
    bg: "bg-amber-50",
    extra: "Power Draw: 38 W · Trigger: 13°C",
  },
];

interface ChamberReading {
  id: number;
  temperature: number;
  humidity: number;
  recordedAt: string;
}

type TimePeriod = "24hours" | "7Days" | "30Days";

export default function InsightsTab() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24hours");
  const [readings, setReadings] = useState<ChamberReading[]>([]);
  const [calibrating, setCalibrating] = useState(false);

  useEffect(() => {
    fetch("/api/chamber")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReadings(json.data);
      })
      .catch(console.error);
  }, []);

  const latestReading = readings[0];

  const handleCalibrate = async () => {
    setCalibrating(true);
    try {
      await fetch("/api/chamber", { method: "POST" });
      const res = await fetch("/api/chamber");
      const json = await res.json();
      if (json.success) setReadings(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setCalibrating(false), 1500);
    }
  };

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Insights</h1>
            <p className="text-xs text-gray-500">PER-ZECC Unit 01</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Microclimate banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-start gap-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Activity size={12} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-green-800">Microclimate Equilibrium</p>
              <StatusBadge status="optimal" />
            </div>
            <p className="text-xs text-green-700 mt-0.5">
              Produce fresh · No dehydration risk
            </p>
          </div>
        </div>

        {/* Live readings */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Chamber · Stable · Origin · Optimal</p>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-4xl font-bold text-gray-900">
                {latestReading?.temperature ?? 12.4}
                <span className="text-xl font-normal text-gray-500"> °C</span>
              </p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <p className="text-4xl font-bold text-gray-900">
                {latestReading?.humidity ?? 65}
                <span className="text-xl font-normal text-gray-500"> %RH</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500">Target: 10°C – 14°C</span>
            <span className="text-xs text-gray-500">Target: 60% – 70%</span>
          </div>

          {/* Produce image placeholder */}
          <div className="mt-3 rounded-xl overflow-hidden bg-gradient-to-br from-green-800 to-green-600 h-28 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="text-4xl">🥬🍅🌿</span>
            <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-1">
              <p className="text-white text-[10px] font-medium">
                🔴 Live · Chamber 01 · Active · 12.4°C · 65%RH
              </p>
            </div>
            <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              LIVE
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex gap-2 mb-4">
            {(["24hours", "7Days", "30Days"] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  timePeriod === p
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {p === "24hours" ? "24 Hours" : p}
              </button>
            ))}
          </div>

          {/* Thermal Retention Chart */}
          <div className="mb-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-800">Thermal Retention Profile</p>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-0.5 bg-green-500 rounded inline-block" />
                  Indoor
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-0.5 bg-orange-400 rounded inline-block" />
                  Outdoor
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">
              Chamber 12.4°C vs Outdoor 34°C · Day fresh
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={thermalData}>
                <defs>
                  <linearGradient id="indoorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outdoorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Area type="monotone" dataKey="outdoor" stroke="#f97316" fill="url(#outdoorGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="indoor" stroke="#16a34a" fill="url(#indoorGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cooling Features */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Cooling Architecture</h2>
          <div className="space-y-3">
            {coolingFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className={`${feature.bg} rounded-xl p-3`}>
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: feature.color + "22" }}
                    >
                      <Icon size={15} style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-800">{feature.title}</p>
                        {feature.badge ? (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white"
                            style={{ background: feature.color }}
                          >
                            {feature.badge}
                          </span>
                        ) : feature.statusLabel ? (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: feature.color + "22", color: feature.color }}
                          >
                            {feature.statusLabel}
                          </span>
                        ) : (
                          <StatusBadge status={feature.status} />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{feature.subtitle}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{feature.description}</p>
                      {feature.extra && (
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">{feature.extra}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chamber Subsystems */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Chamber Subsystems</h2>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              3 of 3 Healthy
            </span>
          </div>
          <div className="space-y-2.5">
            {subsystems.map((sys, i) => {
              const Icon = sys.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 ${sys.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} style={{ color: sys.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">{sys.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{sys.detail}</p>
                  </div>
                  <StatusBadge status={sys.status} />
                </div>
              );
            })}
          </div>

          {/* Calibrate Button */}
          <button
            onClick={handleCalibrate}
            disabled={calibrating}
            className="mt-3 w-full bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {calibrating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Activity size={15} />
            )}
            {calibrating ? "Calibrating..." : "Calibrate Setpoints"}
          </button>
        </div>

        {/* Power Balance Chart */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Daily Power Balance</h2>
              <p className="text-[10px] text-gray-500">Today (04:00 – 18:00)</p>
            </div>
            <Sun size={16} className="text-amber-500" />
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={powerData}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarGrad)" strokeWidth={2} dot={false} name="Solar (W)" />
              <Area type="monotone" dataKey="consumption" stroke="#0ea5e9" fill="url(#consGrad)" strokeWidth={2} dot={false} name="Usage (W)" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              100% Solar Independence achieved today
            </p>
          </div>
        </div>

        {/* Shelf Life Saved */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-4 text-white mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={12} className="text-white" />
            </div>
            <p className="text-sm font-semibold">Shelf-Life Extended</p>
          </div>
          <p className="text-2xl font-bold mb-1">
            -24 kg <span className="text-base font-normal opacity-90">saved this week</span>
          </p>
          <p className="text-xs opacity-80">
            PER-ZECC has prevented potential spoilage across crops through optimal cooling management.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Temp Accuracy", value: "±0.2°C" },
              { label: "Humidity Hold", value: "64–67%" },
              { label: "Uptime", value: "99.7%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 rounded-xl p-2 text-center">
                <p className="text-sm font-bold">{stat.value}</p>
                <p className="text-[9px] opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Recent Events</h2>
            <Clock size={14} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {[
              { time: "12:00", event: "Peak solar output 82W achieved", type: "success" },
              { time: "09:30", event: "Misting cycle completed — 0.4L used", type: "info" },
              { time: "07:15", event: "Chamber temp stabilized at 12.4°C", type: "success" },
              { time: "04:00", event: "Night mode: Peltier reduced to 20%", type: "info" },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full mt-1 ${
                      ev.type === "success" ? "bg-green-500" : "bg-sky-500"
                    }`}
                  />
                  {i < 3 && <div className="w-px flex-1 bg-gray-100 mt-1 h-6" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">{ev.event}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{ev.time} today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
