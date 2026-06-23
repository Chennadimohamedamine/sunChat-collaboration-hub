import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Mail, 
  Compass, 
  Zap, 
  AlertCircle,
  Inbox
} from "lucide-react"; 
import { useAuth } from "../context/AuthContext";

type Status = "loading" | "success" | "error" | "unverified" | "inactive" | "deleted";



export default function StatusCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<Status | null>(null);
  const [resendErrorMessage, setResendErrorMessage] = useState("");
  
  const { isAuthenticated, setIsAuthenticated } = useAuth(); 

  // Compute validation state coming from URL search parameters
  const callbackState = useMemo(() => {
    const statusParam = searchParams.get("status");
    const accessToken = searchParams.get("accessToken");
    const messageParam = searchParams.get("message");

    if (!statusParam) {
      return {
        status: "error" as Status,
        errorMessage: "Invalid verification link structural format.",
        accessToken: null,
      };
    }

    if (statusParam === "success") {
      return {
        status: "success" as Status,
        errorMessage: "",
        accessToken,
      };
    }

    if (statusParam === "unverified") {
      return {
        status: "unverified" as Status,
        errorMessage: "",
        accessToken: null,
      };
    }

    if (statusParam === "inactive") {
      return {
        status: "inactive" as Status,
        errorMessage: "Your account is inactive. Please contact system gateway administrators for structural workspace profile clearance.",
        accessToken: null,
      };
    }

    if (statusParam === "deleted") {
      return {
        status: "deleted" as Status,
        errorMessage: "Your account has been purged from active registries. Check workspace records for operational recovery options.",
        accessToken: null,
      };
    }

    return {
      status: "error" as Status,
      errorMessage: messageParam
        ? decodeURIComponent(messageParam)
        : "Verification failed. This magic signature link has expired.",
      accessToken: null,
    };
  }, [searchParams]);

  const status = resendStatus ?? callbackState.status;
  const errorMessage = resendErrorMessage || callbackState.errorMessage;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (callbackState.accessToken) {
      localStorage.setItem("accessToken", callbackState.accessToken);
      setIsAuthenticated(true);
    }

    if (callbackState.status !== "success") {
      return;
    }

    const timer = window.setTimeout(() => navigate("/", { replace: true }), 3500);
    return () => window.clearTimeout(timer);
  }, [callbackState.accessToken, callbackState.status, navigate]);

  const handleResendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setResendErrorMessage("Please enter your workspace email address to resend validation tokens.");
      setResendStatus("error");
      return;
    }

    setIsResending(true);
    setResendErrorMessage("");
    setResendStatus("loading");
    
    try {
      // Integration hook area for ApiService.resendVerification(email)
      window.setTimeout(() => {
        setResendStatus("unverified");
        setIsResending(false);
      }, 1500);
    } catch (error: unknown) {
      setResendErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to broadcast email request parameters. Please retry shortly."
      );
      setResendStatus("error");
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-850 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* LEFT PANEL / Brand Introduction: Matched clean layout alignment */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-between p-10 md:p-14 lg:p-16 bg-white dark:bg-[#121824] border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-[#1E293B]/60 relative overflow-hidden">
        {/* Dynamic ambient gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF6B35]/5 dark:bg-[#FF6B35]/8 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-slate-400/5 dark:bg-slate-700/5 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10 select-none">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white font-display font-bold text-xl shadow-[0_4px_12px_rgba(255,107,53,0.3)] rotate-3">
            S
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
            sunChat
          </span>
        </div>

        {/* Core Workspace Messaging */}
        <div className="my-auto py-12 md:py-0 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#FF6B35]/10 text-[#FF6B35] mb-6 border border-[#FF6B35]/20">
            <Zap size={11} className="fill-current" /> Security Gateway
          </span>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-semibold text-slate-900 dark:text-white leading-tight tracking-tight mb-6 animate-fade-in">
            Instant.<br />Beautiful.<br />Accessible.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm lg:text-base max-w-sm mb-8">
            System verification clearing center. Confirming registry architecture credentials to map secure user container allocations.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1B2230] transition-all">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                <Compass size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">Unified Member Registry</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Automated validation tracking matching handles, permissions tokens, and access channels.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Info footer */}
        <div className="text-xs text-slate-400 dark:text-slate-500 flex gap-4 mt-8 relative z-10 pb-2">
          <span>© 2026 sunChat Labs. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT PANEL / Dynamic Verification Container Response Panels */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 relative bg-[#F8FAFC] dark:bg-[#0B0F17]">
        <div className="w-full max-w-md bg-white dark:bg-[#121824] border border-slate-200/70 dark:border-[#1E293B]/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.15)] relative backdrop-blur-md text-center animate-fade-in">
          
          {/* LOADING STATE */}
          {status === "loading" && (
            <div className="py-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center mb-6">
                <Loader2 className="h-8 w-8 text-[#FF6B35] animate-spin" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] font-mono">
                Security Hub
              </span>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mt-1">
                Validating Security Token
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Securing your terminal alignment with sunChat infrastructure gateways. Hold tight while we confirm parameters...
              </p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === "success" && (
            <div className="py-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-500 flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 font-mono">
                Verification Success
              </span>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mt-1">
                Account Activated
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Your parameters are securely registered. Preparing your collaborative sunChat workspace session now.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-emerald-500 text-xs font-mono font-bold animate-pulse">
                Redirecting to application panel
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* UNVERIFIED / EXPIRED PENDING ACCESS STATE */}
          {status === "unverified" && (
            <div>
              <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 text-amber-500 flex items-center justify-center mb-6 shadow-sm">
                <Inbox className="h-8 w-8" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 font-mono">
                Action Required
              </span>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mt-1">
                Link Blocked or Expired
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                We couldn't verify your workspace email with that structural link payload. It may have expired, or a newer registry criteria token has taken priority.
              </p>

              <form onSubmit={handleResendLink} className="mt-6 space-y-4 text-left">
                <div>
                  <label htmlFor="resend-email" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    Workspace Email Address
                  </label>
                  <div className="relative font-sans">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={16} />
                    </span>
                    <input
                      id="resend-email"
                      type="email"
                      placeholder="name@sunChat.space"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-11 pr-4 py-3 rounded-xl border border-slate-200/70 dark:border-[#1E293B]/85 bg-slate-50/50 dark:bg-[#0B0F17] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-[#FF6B35] dark:focus:border-[#FF6B35] transition-colors outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full font-display font-semibold transition-all py-3 px-4 rounded-xl text-white bg-[#FF6B35] hover:bg-[#E55B24] active:scale-98 shadow-[0_4px_12px_rgba(255,107,53,0.15)] flex items-center justify-center text-xs cursor-pointer disabled:opacity-50"
                >
                  {isResending ? "Broadcasting Link..." : "Resend Verification Instructions"}
                </button>
                
                <div className="text-center pt-2 font-sans">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-400 hover:text-[#FF6B35] underline transition-colors"
                  >
                    Return to Profile Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* CRITICAL FAILURE / EXCLUSION PROFILE ACTIONS STATES */}
          {(status === "error" || status === "inactive" || status === "deleted") && (
            <div className="py-2">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-500 flex items-center justify-center mb-6 shadow-sm">
                <XCircle className="h-8 w-8" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 font-mono">
                {status === "deleted" ? "Account Purged" : status === "inactive" ? "Workspace Locked" : "Gateway Error"}
              </span>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mt-1">
                {status === "error" ? "Verification Failed" : `Identity Space ${status}`}
              </h2>
              
              <div className="my-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 text-left">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="font-mono leading-relaxed text-[11px]">{errorMessage}</span>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="flex-1 font-display font-semibold transition-all py-3 px-4 rounded-xl text-white bg-[#FF6B35] hover:bg-[#E55B24] text-center text-xs shadow-md"
                >
                  Sign In Panel
                </Link>
                {status === "error" && (
                  <button
                    type="button"
                    onClick={() => setResendStatus("unverified")}
                    className="flex-1 font-sans font-semibold py-3 px-4 rounded-xl text-xs border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B2230] transition-all cursor-pointer"
                  >
                    Retry Validation
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}