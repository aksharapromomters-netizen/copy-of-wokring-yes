import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PlatformAdminLogin() {
  const { signInWithGoogle, user, profile, loading, profileError, signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (profileError) {
      setError(`Profile Error: ${profileError.message}`);
      setProcessing(false);
      return;
    }

    if (user && profile) {
      if (profile.role === 'platform_admin') {
        navigate('/admin', { replace: true });
      } else {
        // Automatically sign out non-admins
        signOut();
        setError('This account is not a platform admin.');
        setProcessing(false);
      }
    }
  }, [loading, user, profile, profileError, navigate, signOut]);

  const handleGoogleLogin = async () => {
    setProcessing(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic font-['Bangers']">Platform Admin</h1>
          <p className="text-slate-500 font-medium">Restricted Access Area</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center">

          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl">
              🛡️
            </div>
          </div>

          <p className="text-slate-600 mb-8 font-medium">
            Sign in with your authorized Google account to access the administrative dashboard.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={processing}
            className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            {processing ? 'Connecting...' : 'Sign In with Google'}
          </button>
        </div>

        <p className="text-center mt-8 text-[10px] uppercase font-black text-slate-300 tracking-widest">
          Protected by Etiquette Security
        </p>
      </div>
    </div>
  );
}
