import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, AuthUser, PlannerData } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, planner?: PlannerData) => void;
  currentPlannerState: { programs: string[]; completed: string[]; electives: string[] };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentPlannerState,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, name);
        // Automatically save current work to the newly registered account
        await api.savePlanner({
          programs: currentPlannerState.programs,
          completed: currentPlannerState.completed,
          electives: currentPlannerState.electives,
        });
        onAuthSuccess(res.user, {
          programs: currentPlannerState.programs,
          completed: currentPlannerState.completed,
          electives: currentPlannerState.electives,
        });
      } else {
        const res = await api.login(email, password);
        onAuthSuccess(res.user, res.planner);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl max-w-md w-full overflow-hidden border border-[#DEDEDE]">
        {/* Header */}
        <div className="bg-[#BA0C2F] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <h3 className="font-display text-base font-semibold tracking-wide">
              {isRegister ? 'Create Student Account' : 'Sign In to Save Progress'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          <p className="text-xs text-[#666666] mb-4">
            {isRegister
              ? 'Create a free student account using any valid email and password to securely save your degree progress across devices.'
              : 'Sign in with your email and password to load and sync your degree progress.'}
          </p>

          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border-l-4 border-[#BA0C2F] text-[#BA0C2F] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isRegister && (
              <div>
                <label className="block font-medium text-black mb-1">Your Name (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full px-3 py-2 pl-8 border border-[#DEDEDE] rounded bg-white text-black focus:border-[#BA0C2F] focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-black mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3 py-2 pl-8 border border-[#DEDEDE] rounded bg-white text-black focus:border-[#BA0C2F] focus:outline-none"
                />
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-black mb-1">Password (min. 6 characters)</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pl-8 border border-[#DEDEDE] rounded bg-white text-black focus:border-[#BA0C2F] focus:outline-none"
                />
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 bg-[#BA0C2F] hover:bg-[#990A26] text-white font-medium rounded transition-colors cursor-pointer disabled:opacity-50 text-xs"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account & Save' : 'Sign In & Load Progress'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#DEDEDE] text-center text-xs text-[#666666]">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-[#BA0C2F] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="text-[#BA0C2F] font-semibold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
