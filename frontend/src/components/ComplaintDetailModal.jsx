import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Tag, 
  Image as ImageIcon, 
  History, 
  Send, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ShieldAlert, 
  User 
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import ComplaintHistoryTimeline from './ComplaintHistoryTimeline';
import { complaintsApi } from '../api/client';

export default function ComplaintDetailModal({ 
  complaint, 
  isOpen, 
  onClose, 
  onComplaintUpdated, 
  isAdmin = false 
}) {
  const [newStatus, setNewStatus] = useState(complaint?.status || 'Open');
  const [newPriority, setNewPriority] = useState(complaint?.priority || 'Medium');
  const [note, setNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !complaint) return null;

  const isResolved = complaint.status === 'Resolved';

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (newStatus === complaint.status) return;
    setIsUpdatingStatus(true);
    setErrorMsg('');

    try {
      const res = await complaintsApi.updateStatus(complaint.id, {
        status: newStatus,
        note: note.trim() || undefined,
      });
      setNote('');
      if (onComplaintUpdated) onComplaintUpdated(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (priorityValue) => {
    setIsUpdatingPriority(true);
    setErrorMsg('');
    try {
      const res = await complaintsApi.updatePriority(complaint.id, {
        priority: priorityValue,
      });
      setNewPriority(priorityValue);
      if (onComplaintUpdated) onComplaintUpdated(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update priority');
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                #{complaint.id}
              </span>
              <StatusBadge status={complaint.status} isOverdue={complaint.is_overdue} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-slate-100">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Category</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 text-sm">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                {complaint.category}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Unit / Location</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 text-sm">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {complaint.unit_no || 'N/A'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Resident</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 text-sm truncate">
                <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{complaint.resident?.name || 'Resident'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Reported At</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {formatDate(complaint.created_at)}
              </div>
            </div>
          </div>

          <div className="pt-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {complaint.photo_url && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Attached Photo Evidence
                </h4>
                <div className="relative group max-w-xs rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer" onClick={() => setPhotoViewerOpen(true)}>
                  <img 
                    src={complaint.photo_url} 
                    alt="Complaint photo" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                    Click to enlarge
                  </div>
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="pt-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Admin Workflow & Status Actions
              </h4>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Change Priority:</span>
                <div className="flex gap-1.5">
                  {['Low', 'Medium', 'High'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={isUpdatingPriority || isResolved}
                      onClick={() => handleUpdatePriority(p)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        complaint.priority === p 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      } ${isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {isResolved ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Complaint Resolved & Closed</strong>
                    <p className="text-xs text-emerald-700">This complaint has been completed and locked against further modifications.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateStatus} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full text-sm rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 py-1.5"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved (Closes Complaint)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Status Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Technician assigned for 2 PM"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full text-sm rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 py-1.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingStatus || newStatus === complaint.status}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Save Status Update
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="pt-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Recorded Status History & Audit Log
            </h4>
            <ComplaintHistoryTimeline history={complaint.history} />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {photoViewerOpen && complaint.photo_url && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPhotoViewerOpen(false)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl relative">
            <img src={complaint.photo_url} alt="Full resolution photo" className="max-h-[85vh] w-auto object-contain rounded-lg" />
            <button 
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              onClick={() => setPhotoViewerOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
