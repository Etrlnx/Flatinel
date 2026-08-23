import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { noticesApi } from '../api/client';
import { 
  Bell, 
  Pin, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Loader2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import NewNoticeModal from '../components/NewNoticeModal';

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const fetchNotices = async () => {
    try {
      const res = await noticesApi.getAll();
      setNotices(res.data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNotices().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    setDeletingId(id);
    try {
      await noticesApi.delete(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert('Failed to delete notice');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Society Notice Board
            </h1>
            <p className="text-xs text-slate-500">
              Official society updates, maintenance schedules & emergency alerts
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsNewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Post New Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No notices posted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Check back later for news and updates from the society management.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-6 rounded-3xl border transition-all ${
                notice.is_important
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {notice.is_important && (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900 shadow-xs">
                      <Pin className="w-3.5 h-3.5 fill-amber-900" />
                      Important Notice (Pinned)
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-slate-900">{notice.title}</h2>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(notice.id)}
                    disabled={deletingId === notice.id}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                    title="Delete Notice"
                  >
                    {deletingId === notice.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                {notice.body}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted by <strong className="text-slate-600">{notice.admin?.name || 'Society Office'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(notice.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewNoticeModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onNoticeCreated={(newNotice) => {
          setNotices((prev) => [newNotice, ...prev]);
        }}
      />
    </div>
  );
}
