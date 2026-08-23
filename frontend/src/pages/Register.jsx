import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, UserPlus, Loader2, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [unitNo, setUnitNo] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('resident');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        unit_no: unitNo.trim() || undefined,
        phone: phone.trim() || undefined,
        role
      });
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/resident');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-xl shadow-sky-500/30 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create an Account
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Join the society portal to raise and track maintenance issues
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-white/20">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2.5 px-3 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@domain.com"
                  className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2.5 px-3 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2.5 px-3 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit / Flat Number
                </label>
                <input
                  type="text"
                  value={unitNo}
                  onChange={(e) => setUnitNo(e.target.value)}
                  placeholder="e.g. Flat 301, Tower C"
                  className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2.5 px-3 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full text-sm rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 py-2.5 px-3 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer text-sm font-semibold transition-all ${
                  role === 'resident' 
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="resident"
                    checked={role === 'resident'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  Resident
                </label>
                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer text-sm font-semibold transition-all ${
                  role === 'admin' 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  Admin / Staff
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 shadow-lg shadow-sky-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
