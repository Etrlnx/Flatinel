import React, { useState } from 'react';
import { X, Send, Loader2, Pin, BellRing, AlertCircle } from 'lucide-react';
import { noticesApi } from '../api/client';

export default function NewNoticeModal({ isOpen, onClose, onNoticeCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMsg('Please enter both title and announcement details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await noticesApi.create({
        title: title.trim(),
        body: body.trim(),
        is_important: isImportant,
      });
      if (onNoticeCreated) onNoticeCreated(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to post notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Post Society Notice</h2>
            <p className="text-xs text-slate-500">Publish announcements to the community notice board</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scheduled Lift Maintenance Tomorrow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 px-3 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notice Body / Details *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Describe the notice, dates, instructions, or society guidelines..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 px-3 shadow-xs"
            ></textarea>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  Mark as Important (Pin to Top)
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pinned notices stay at the top of every resident's notice board and automatically dispatch an urgent email notification to all residents.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish Notice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
