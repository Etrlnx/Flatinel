import React, { useState, useEffect } from 'react';
import { X, Sliders, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { settingsApi } from '../api/client';

export default function SettingsModal({ isOpen, onClose, onThresholdUpdated }) {
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(true);
      settingsApi.getOverdueThreshold()
        .then((res) => {
          setDays(res.data.days);
          setLoading(false);
        })
        .catch(() => {
          setErrorMsg('Failed to load settings');
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (days < 1) {
      setErrorMsg('Threshold must be at least 1 day');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await settingsApi.updateOverdueThreshold(days);
      setSuccessMsg(`Overdue threshold successfully updated to ${days} days.`);
      if (onThresholdUpdated) onThresholdUpdated(days);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">System Configuration</h2>
              <p className="text-xs text-slate-500">Tune maintenance rules and thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Overdue Threshold (Days)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Complaints that remain Open or In Progress for longer than this period will be flagged as <strong>OVERDUE</strong> and prioritized at the top of the Admin dashboard.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                  className="w-24 text-center font-bold text-slate-900 text-base rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 shadow-xs"
                />
                <span className="text-sm font-semibold text-slate-600">days after creation</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50 transition-colors"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Threshold
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
