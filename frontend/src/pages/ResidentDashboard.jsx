import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsApi, noticesApi } from '../api/client';
import { 
  Plus, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Filter, 
  Image as ImageIcon, 
  ChevronRight, 
  Bell, 
  Pin 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import NewComplaintModal from '../components/NewComplaintModal';
import { Link } from 'react-router-dom';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await complaintsApi.getAll();
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await noticesApi.getAll();
      setNotices(res.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load notices:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchComplaints(), fetchNotices()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailOpen(true);
  };

  const handleComplaintCreated = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const handleComplaintUpdated = (updated) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedComplaint(updated);
  };

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const totalOpen = complaints.filter(c => c.status === 'Open').length;
  const totalInProgress = complaints.filter(c => c.status === 'In Progress').length;
  const totalResolved = complaints.filter(c => c.status === 'Resolved').length;

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-sky-300 text-xs font-bold uppercase tracking-wider block mb-1">
            Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sky-100 text-sm mt-1">
            Unit: <span className="font-semibold text-white">{user?.unit_no || 'Assigned Resident'}</span> &bull; Track repairs and community updates
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-lg hover:bg-sky-50 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 text-sky-600" />
          Raise Maintenance Complaint
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Open Requests</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{totalOpen}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{totalInProgress}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Resolved Issues</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{totalResolved}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">My Maintenance Complaints</h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {complaints.length}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading your complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No complaints found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {statusFilter === 'All'
                  ? "You haven't raised any maintenance issues yet. Click the button above to report a problem."
                  : `No complaints with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4 mb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          #{item.id}
                        </span>
                        <StatusBadge status={item.status} isOverdue={item.is_overdue} size="sm" />
                        <PriorityBadge priority={item.priority} size="sm" />
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-slate-400 group-hover:text-sky-600 transition-colors shrink-0">
                      <span className="text-xs font-semibold hidden sm:inline mr-1">View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span>Reported on {formatDate(item.created_at)}</span>
                      {item.photo_url && (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                          Photo attached
                        </span>
                      )}
                    </div>
                    {item.history && item.history.length > 0 && (
                      <span className="text-slate-500 font-medium">
                        {item.history.length} status update{item.history.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Society Notices</h2>
            </div>
            <Link
              to="/notices"
              className="text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              View Board ➔
            </Link>
          </div>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                No notices posted yet.
              </div>
            ) : (
              notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    n.is_important
                      ? 'bg-amber-50/70 border-amber-200/90 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{n.title}</h3>
                    {n.is_important && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 shrink-0">
                        <Pin className="w-2.5 h-2.5 fill-amber-900" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-2">
                    {n.body}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400 block text-right">
                    {formatDate(n.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NewComplaintModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onComplaintCreated={handleComplaintCreated}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onComplaintUpdated={handleComplaintUpdated}
        isAdmin={false}
      />
    </div>
  );
}
