import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsApi, dashboardApi } from '../api/client';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Filter, 
  Sliders, 
  Plus, 
  Calendar, 
  Tag, 
  Search, 
  ChevronRight, 
  RefreshCw, 
  Bell, 
  Layers, 
  Activity, 
  ArrowUpDown, 
  Pin 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import NewNoticeModal from '../components/NewNoticeModal';
import SettingsModal from '../components/SettingsModal';

const CATEGORIES = [
  "All",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Appliance",
  "Common Area",
  "Security",
  "Other"
];

const STATUSES = ["All", "Open", "In Progress", "Resolved"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [complaintsRes, statsRes] = await Promise.all([
        complaintsApi.getAll(params),
        dashboardApi.getStats(),
      ]);

      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [selectedCategory, selectedStatus, startDate, endDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailOpen(true);
  };

  const handleComplaintUpdated = (updated) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedComplaint(updated);
    dashboardApi.getStats().then((res) => setStats(res.data));
  };

  const handleThresholdUpdated = () => {
    handleRefresh();
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const displayedComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      (c.resident?.name && c.resident.name.toLowerCase().includes(query)) ||
      (c.unit_no && c.unit_no.toLowerCase().includes(query)) ||
      (c.category && c.category.toLowerCase().includes(query)) ||
      c.id.toString().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-1">
            Society Administration
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Maintenance Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time complaint tracking, overdue monitoring, and community broadcasting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            Overdue Rules
          </button>

          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Complaints</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.total_complaints}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Open</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{stats.open_complaints}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{stats.in_progress_complaints}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Resolved</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.resolved_complaints}</span>
          </div>

          <div className={`p-5 rounded-2xl border shadow-xs ${
            stats.overdue_complaints > 0 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Overdue Issues</span>
              {stats.overdue_complaints > 0 && (
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              )}
            </div>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{stats.overdue_complaints}</span>
          </div>
        </div>
      )}

      {stats && stats.by_category && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Complaints by Category</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(stats.by_category).map(([cat, count]) => (
              <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] font-medium text-slate-500 block truncate">{cat}</span>
                <span className="text-lg font-bold text-slate-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, resident name, or unit #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold rounded-xl border-slate-300 py-1.5 px-2.5 shadow-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-semibold rounded-xl border-slate-300 py-1.5 px-2.5 shadow-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-medium rounded-xl border-slate-300 py-1 px-2 shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-medium rounded-xl border-slate-300 py-1 px-2 shadow-xs"
              />
            </div>

            {(selectedCategory !== 'All' || selectedStatus !== 'All' || startDate || endDate || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading complaints registry...</p>
            </div>
          ) : displayedComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-semibold">No complaints match the selected criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID / Title</th>
                  <th className="px-4 py-3">Resident & Unit</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedComplaints.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.is_overdue ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          #{item.id}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 max-w-xs truncate">{item.title}</div>
                          {item.photo_url && (
                            <span className="text-[11px] text-sky-600 font-semibold block">Photo attached</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{item.resident?.name || 'Resident'}</div>
                      <div className="text-xs text-slate-400">{item.unit_no || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={item.priority} size="sm" />
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} isOverdue={item.is_overdue} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(item.created_at)}
                      {item.is_overdue && (
                        <span className="block text-rose-600 font-bold text-[10px]">
                          ({item.days_open} days open)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Manage
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onComplaintUpdated={handleComplaintUpdated}
        isAdmin={true}
      />

      <NewNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onNoticeCreated={handleRefresh}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onThresholdUpdated={handleThresholdUpdated}
      />
    </div>
  );
}
