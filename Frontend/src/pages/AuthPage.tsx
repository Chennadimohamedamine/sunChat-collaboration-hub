import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Check, Loader2, Sun, Moon, Eye, EyeOff, Zap, ArrowLeft, MailCheck } from 'lucide-react';
import type { AppConfig } from '../types/type';
import ApiService from '../service/ApiService';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;

}

type AuthMode = 'signin' | 'signup' | 'forgot_password';
type HandleCheckState = 'idle' | 'checking' | 'valid' | 'invalid';

export default function AuthPage({ config, setConfig }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  // Custom states for verification & success pathways
  const [isRegistered, setIsRegistered] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const [handleState, setHandleState] = useState<HandleCheckState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    setApiError(null);
    setForgotPasswordSuccess(false);
    setResendStatus('idle');
  }, [authMode]);

  // Username live lookups
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9__]/g, '').toLowerCase();
    setUsername(value);

    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    if (!value || value.length < 3) {
      setHandleState('idle');
      return;
    }

    setHandleState('checking');

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await ApiService.validUserName(value);
        if (response && response.valid) {
          setHandleState('valid');
        } else {
          setHandleState('invalid');
        }
      } catch (err) {
        setHandleState('invalid');
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        if (!email || !password) return;
        const data = await ApiService.login(email, password);
        if (data && data.accessToken){
          localStorage.setItem('accessToken', data.accessToken);
            setIsAuthenticated(true);
        }
        else throw new Error('Login failed: No access token received');
      } 
      else if (authMode === 'signup') {
        if (!email || !password || !fullName || !username || handleState !== 'valid') return;
        await ApiService.register(fullName, username, email, password);
        setIsRegistered(true); // Switches window to verification notification layout
      } 
      else if (authMode === 'forgot_password') {
        if (!email) return;
        await ApiService.forgotPassword(email);
        setForgotPasswordSuccess(true);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      await ApiService.resendVerification(email);
      setResendStatus('sent');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not trigger verification loop pipeline');
      setResendStatus('idle');
    }
  };

  const toggleTheme = () => {
    setConfig((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-850 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Floating Theme Selector */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200/60 dark:border-[#1E293B]/80 bg-white/80 dark:bg-[#121824]/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] cursor-pointer"
          title={config.darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {config.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* LEFT PANEL / Brand Introduction */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-between p-10 md:p-14 lg:p-16 bg-white dark:bg-[#121824] border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-[#1E293B]/60 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF6B35]/5 dark:bg-[#FF6B35]/8 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-slate-400/5 dark:bg-slate-700/5 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 relative z-10 select-none">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white font-display font-bold text-xl shadow-[0_4px_12px_rgba(255,107,53,0.3)] rotate-3">
            S
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Sunday</span>
        </div>

        <div className="my-auto py-12 md:py-0 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#FF6B35]/10 text-[#FF6B35] mb-6 border border-[#FF6B35]/20">
            <Zap size={11} className="fill-current" /> Sunday Workspace
          </span>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-semibold text-slate-900 dark:text-white leading-tight tracking-tight mb-6 animate-fade-in">
            Instant.<br />Beautiful.<br />Accessible.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm lg:text-base max-w-sm mb-8">
            A high-fidelity communication platform for modern teams requiring beautiful layouts, streamlined chats, and consistent visual polish.
          </p>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 flex gap-4 mt-8 relative z-10 pb-2">
          <span>© 2026 Sunday Labs. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT PANEL / Dynamic States Interface */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 relative bg-[#F8FAFC] dark:bg-[#0B0F17]">
        <div className="w-full max-w-md bg-white dark:bg-[#121824] border border-slate-200/70 dark:border-[#1E293B]/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.15)] relative backdrop-blur-md">
          
          {/* STATE A: Registration Completed Verification Notice */}
          {isRegistered ? (
            <div className="text-center py-4 font-sans animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MailCheck size={32} />
              </div>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs px-2 leading-relaxed mb-6">
                We've delivered a secure confirmation routing parameter link to <strong className="text-slate-700 dark:text-slate-300 font-medium">{email}</strong>. Please confirm ownership registry to load your account workspace.
              </p>
              
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={resendStatus !== 'idle'}
                  onClick={handleResendVerification}
                  className="w-full font-display font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B2230] transition-all disabled:opacity-50"
                >
                  {resendStatus === 'idle' && 'Resend Verification Link'}
                  {resendStatus === 'sending' && 'Requesting fresh gateway token...'}
                  {resendStatus === 'sent' && '✓ Transmission Sent Successfully'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setIsRegistered(false); setAuthMode('signin'); }}
                  className="text-xs font-semibold text-[#FF6B35] hover:underline flex items-center gap-1.5 justify-center mx-auto pt-2"
                >
                  <ArrowLeft size={14} /> Back to standard registration login
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Navigation Tabs (Hidden when exploring password parameters) */}
              {authMode !== 'forgot_password' && (
                <div className="flex space-x-1 p-1 bg-slate-50 dark:bg-[#0D121F] rounded-2xl mb-8 border border-slate-200/50 dark:border-[#1E293B]/50">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setAuthMode('signin')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      authMode === 'signin' ? 'bg-white dark:bg-[#121824] text-[#FF6B35] shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >Sign In</button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      authMode === 'signup' ? 'bg-white dark:bg-[#121824] text-[#FF6B35] shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >Create Account</button>
                </div>
              )}

              {/* Dynamic Header Titles */}
              <div className="mb-6">
                {authMode === 'forgot_password' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FF6B35] transition-colors mb-4 font-semibold"
                  >
                    <ArrowLeft size={14} /> Back to sign in
                  </button>
                )}
                <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
                  {authMode === 'signin' && 'Sign into Sunday'}
                  {authMode === 'signup' && 'Get Sunday Handle'}
                  {authMode === 'forgot_password' && 'Recover access criteria'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  {authMode === 'signin' && 'Enter your certified workspace email to query your dashboard.'}
                  {authMode === 'signup' && 'Claim an available username handle in the unified member registry.'}
                  {authMode === 'forgot_password' && 'Input workspace identity strings to trigger credentials restoration link resets.'}
                </p>
              </div>

              {/* Operational System Rejections Alerts */}
              {apiError && (
                <div className="mb-4 p-3 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 font-medium">
                  {apiError}
                </div>
              )}

              {/* Recovery Form Status Handler */}
              {authMode === 'forgot_password' && forgotPasswordSuccess ? (
                <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/40 dark:bg-emerald-950/10 text-center font-sans animate-fade-in">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                    Infrastructure instructions broadcasted. Verify validation configurations inside mailbox matching <strong>{email}</strong> if it correlates with dynamic system records.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Conditional Profile Fields for New Accounts */}
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Full Name</label>
                        <div className="relative font-sans">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><User size={16} /></span>
                          <input type="text" required disabled={isSubmitting} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="w-full text-xs pl-11 pr-4 py-3 rounded-xl border border-slate-200/70 dark:border-[#1E293B]/85 bg-slate-50/50 dark:bg-[#0B0F17] text-slate-800 dark:text-white focus:border-[#FF6B35] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Username Handle ID</label>
                        <div className="relative font-sans">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 dark:text-slate-500">@</span>
                          <input type="text" required disabled={isSubmitting} value={username} onChange={handleUsernameChange} placeholder="user_handle" maxLength={15} className={`w-full text-xs pl-9 pr-12 py-3 rounded-xl border bg-slate-50/50 dark:bg-[#0B0F17] text-slate-800 dark:text-white transition-colors ${handleState === 'valid' ? 'border-emerald-500/80' : handleState === 'invalid' ? 'border-rose-500/80' : 'border-slate-200/70 dark:border-[#1E293B]/85'}`} />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                            {handleState === 'checking' && <Loader2 size={16} className="text-[#FF6B35] animate-spin" />}
                            {handleState === 'valid' && <Check size={16} className="text-emerald-500" />}
                            {handleState === 'invalid' && <span className="text-xs text-rose-500 font-semibold font-mono">taken</span>}
                          </div>
                        </div>
                        <div className="mt-1.5 min-h-[16px] px-1 text-[10px] font-mono">
                          {handleState === 'valid' && <span className="text-emerald-500">● @{username} is available in workspace</span>}
                          {handleState === 'invalid' && <span className="text-rose-500">✖ Taken. Try another handle</span>}
                          {handleState === 'checking' && <span className="text-slate-400">Verifying with registry system...</span>}
                          {handleState === 'idle' && <span className="text-slate-400">Handles must be 3 characters minimum.</span>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Core Workspace email string inputs */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Workspace Email Address</label>
                    <div className="relative font-sans">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Mail size={16} /></span>
                      <input type="email" required disabled={isSubmitting} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@sunday.space" className="w-full text-xs pl-11 pr-4 py-3 rounded-xl border border-slate-200/70 dark:border-[#1E293B]/85 bg-slate-50/50 dark:bg-[#0B0F17] text-slate-800 dark:text-white focus:border-[#FF6B35] transition-colors" />
                    </div>
                  </div>

                  {/* Passwords structures */}
                  {authMode !== 'forgot_password' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5 px-1 font-sans">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Secure Password</label>
                        {authMode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => setAuthMode('forgot_password')}
                            className="text-[11px] font-semibold text-[#FF6B35] hover:underline cursor-pointer"
                          >Forgot Password?</button>
                        )}
                      </div>
                      <div className="relative font-sans">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Lock size={16} /></span>
                        <input type={showPassword ? "text" : "password"} required disabled={isSubmitting} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full text-xs pl-11 pr-11 py-3 rounded-xl border border-slate-200/70 dark:border-[#1E293B]/85 bg-slate-50/50 dark:bg-[#0B0F17] text-slate-800 dark:text-white focus:border-[#FF6B35] transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || (authMode === 'signup' && handleState !== 'valid')}
                    className="w-full font-display font-semibold transition-all mt-6 py-3.5 px-4 rounded-xl text-white bg-[#FF6B35] hover:bg-[#E55B24] active:scale-98 shadow-[0_4px_12px_rgba(255,107,53,0.15)] flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : authMode === 'signin' ? (
                      'Sign In to Sunday'
                    ) : authMode === 'signup' ? (
                      'Create Sunday Account'
                    ) : (
                      'Trigger Restoration Reset'
                    )}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}