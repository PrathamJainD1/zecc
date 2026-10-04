"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  X,
  ChevronDown,
  Package,
  Thermometer,
  Calendar,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import CircularProgress from "@/components/CircularProgress";

interface Produce {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  status: string;
  storedAt: string;
  targetTempMin: number;
  targetTempMax: number;
  shelfLifeDays: number;
  crate: string;
  notes: string | null;
}

const filters = ["All Produce", "Vegetables", "Fruits", "Herbs", "Grains"];
const produceEmojis: Record<string, string> = {
  vegetables: "🥬",
  fruits: "🍎",
  herbs: "🌿",
  grains: "🌾",
};

const statusColors: Record<string, string> = {
  optimal: "#16a34a",
  good: "#0ea5e9",
  attention: "#f59e0b",
  critical: "#ef4444",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `Stored ${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `Stored ${hours}h ago`;
  return "Freshly Added (Stored today)";
}

function shelfLifeLabel(storedAt: string, shelfLife: number): string {
  const stored = new Date(storedAt);
  const expiry = new Date(stored.getTime() + shelfLife * 24 * 60 * 60 * 1000);
  const now = new Date();
  const remaining = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (remaining <= 0) return "Expired";
  return `+${remaining} days shelf-life`;
}

interface AddProduceFormData {
  name: string;
  type: string;
  quantity: string;
  unit: string;
  targetTempMin: string;
  targetTempMax: string;
  shelfLifeDays: string;
  crate: string;
  notes: string;
}

export default function StorageTab() {
  const [produce, setProduce] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Produce");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AddProduceFormData>({
    name: "",
    type: "vegetables",
    quantity: "",
    unit: "kg",
    targetTempMin: "10",
    targetTempMax: "13",
    shelfLifeDays: "14",
    crate: "Crate-01",
    notes: "",
  });

  const fetchProduce = useCallback(async () => {
    try {
      const typeParam =
        activeFilter === "All Produce"
          ? "all"
          : activeFilter.toLowerCase().slice(0, -1); // Remove 's'
      const res = await fetch(
        `/api/produce?type=${encodeURIComponent(
          activeFilter === "All Produce" ? "all" : activeFilter.toLowerCase()
        )}`
      );
      const json = await res.json();
      if (json.success) setProduce(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchProduce();
  }, [fetchProduce]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this produce from storage?")) return;
    try {
      await fetch(`/api/produce?id=${id}`, { method: "DELETE" });
      setProduce((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
    setOpenMenu(null);
  };

  const handleAddProduce = async () => {
    if (!form.name || !form.quantity) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          quantity: parseFloat(form.quantity),
          unit: form.unit,
          targetTempMin: parseFloat(form.targetTempMin),
          targetTempMax: parseFloat(form.targetTempMax),
          shelfLifeDays: parseInt(form.shelfLifeDays),
          crate: form.crate,
          notes: form.notes || null,
          status: "good",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProduce((prev) => [json.data, ...prev]);
        setShowAddModal(false);
        setForm({
          name: "",
          type: "vegetables",
          quantity: "",
          unit: "kg",
          targetTempMin: "10",
          targetTempMax: "13",
          shelfLifeDays: "14",
          crate: "Crate-01",
          notes: "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProduce = produce.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCrates = new Set(produce.map((p) => p.crate)).size;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Stored Produce</h1>
            <p className="text-xs text-gray-500">{activeCrates} Active Crates</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search produce..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-400 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === f
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "All Produce" ? `All Produce (${produce.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity Summary */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CircularProgress value={68} size={64} strokeWidth={7} color="#16a34a">
                <span className="text-xs font-bold text-gray-800">68%</span>
              </CircularProgress>
              <div>
                <p className="text-sm font-semibold text-gray-800">Chamber Capacity</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {produce.reduce((sum, p) => sum + p.quantity, 0).toFixed(0)} kg stored
                </p>
                <p className="text-xs text-green-600 font-medium">Optimal airflow</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-lg font-bold text-gray-900">55 kg</p>
              <p className="text-[10px] text-gray-400">of 175 kg total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Produce List */}
      <div className="px-4 space-y-3 pb-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : filteredProduce.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No produce found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first batch to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              + Add Produce
            </button>
          </div>
        ) : (
          filteredProduce.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 card-shadow">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {produceEmojis[item.type] ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.status === "attention" && (
                          <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            New
                          </span>
                        )}
                        <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      </div>
                      <StatusBadge status={item.status} className="mt-1" />
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === item.id ? null : item.id)
                        }
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {openMenu === item.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-36">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-base font-bold" style={{ color: statusColors[item.status] }}>
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-600 font-medium">
                      {shelfLifeLabel(item.storedAt, item.shelfLifeDays)}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1">
                      <Thermometer size={10} className="text-orange-400" />
                      <span className="text-[10px] text-gray-600">
                        Target: {item.targetTempMin}°C – {item.targetTempMax}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1">
                      <Package size={10} className="text-gray-400" />
                      <span className="text-[10px] text-gray-600">{item.crate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Calendar size={10} />
                      {timeAgo(item.storedAt)}
                    </div>
                    {item.notes && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.status === "attention"
                            ? "bg-amber-100 text-amber-700"
                            : item.status === "optimal"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-300"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* Add Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Add New Produce</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Produce Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Country Tomatoes"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Type</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none appearance-none"
                    >
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="herbs">Herbs</option>
                      <option value="grains">Grains</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Unit</label>
                  <div className="relative">
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none appearance-none"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                      <option value="boxes">boxes</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Quantity *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Temperature Range (°C)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min (e.g., 10)"
                    value={form.targetTempMin}
                    onChange={(e) => setForm({ ...form, targetTempMin: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max (e.g., 13)"
                    value={form.targetTempMax}
                    onChange={(e) => setForm({ ...form, targetTempMax: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Shelf Life (days)
                  </label>
                  <input
                    type="number"
                    placeholder="14"
                    value={form.shelfLifeDays}
                    onChange={(e) => setForm({ ...form, shelfLifeDays: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Crate ID
                  </label>
                  <input
                    type="text"
                    placeholder="Crate-01"
                    value={form.crate}
                    onChange={(e) => setForm({ ...form, crate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Notes (optional)
                </label>
                <textarea
                  placeholder="Additional notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-green-400 focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleAddProduce}
                disabled={submitting || !form.name || !form.quantity}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {submitting ? "Adding..." : "Add to Storage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
