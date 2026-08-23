import React, { useState } from 'react';
import { X, Upload, Loader2, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { complaintsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Appliance",
  "Common Area",
  "Security",
  "Other"
];

export default function NewComplaintModal({ isOpen, onClose, onComplaintCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [unitNo, setUnitNo] = useState(user?.unit_no || '');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size cannot exceed 5MB');
      return;
    }

    setErrorMsg('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in both title and description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let photoUrl = null;

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await complaintsApi.uploadPhoto(formData);
        photoUrl = uploadRes.data.photo_url;
      }

      const payload = {
        title: title.trim(),
        category,
        unit_no: unitNo.trim() || undefined,
        description: description.trim(),
        photo_url: photoUrl
      };

      const res = await complaintsApi.create(payload);
      if (onComplaintCreated) onComplaintCreated(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Raise Maintenance Complaint</h2>
            <p className="text-xs text-slate-500">Submit an issue with details and optional photo</p>
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
              Complaint Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Geyser not heating water"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 px-3 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 px-3 shadow-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit / Flat No.
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 304, Block B"
                value={unitNo}
                onChange={(e) => setUnitNo(e.target.value)}
                className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 px-3 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description of Issue *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Please describe the defect, location, and any urgent safety details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2 px-3 shadow-xs"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Photo Evidence (Optional)
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden max-w-xs group">
                <img src={photoPreview} alt="Preview" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-lg shadow-sm hover:bg-rose-700 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
                <span className="text-[11px] text-slate-400">JPEG, PNG, WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
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
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
