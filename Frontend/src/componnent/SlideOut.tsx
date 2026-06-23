import React from "react";
import { CheckCircle, Info, Loader2, X } from "lucide-react";
import type { User, Thread } from "../types/type";

interface SlideOutProps {
    isProfileDrawerOpen: boolean;
    setIsProfileDrawerOpen: (open: boolean) => void;
    profileDrawerTab: 'peer' | 'self';
    setProfileDrawerTab: (tab: 'peer' | 'self') => void;
    activeThread: Thread | null;
    myProfile: User;
    draftProfile: Partial<User> | null;
    setDraftProfile: (profile: Partial<User> | null) => void;
    handleSaveProfile: (e: React.FormEvent) => void;
    isSavingProfile: boolean;
    profileSaveSuccess: boolean;
}

const SlideOut: React.FC<SlideOutProps> = ({
    isProfileDrawerOpen,
    setIsProfileDrawerOpen,
    profileDrawerTab,
    setProfileDrawerTab,
    activeThread,
    myProfile,
    draftProfile,
    setDraftProfile,
    handleSaveProfile,
    isSavingProfile,
    profileSaveSuccess
}) => {
    return (
        <div className={`
          absolute md:relative top-0 bottom-0 right-0 w-80 md:w-[320px] bg-white dark:bg-[#161B24] flex flex-col h-full z-20 transition-transform duration-300 ease-in-out select-none
          ${isProfileDrawerOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : 'translate-x-full absolute md:hidden shadow-none'}
        `}>

            <div className="p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 font-mono tracking-wider">
                    {profileDrawerTab === 'self' ? 'MY sunChat ACCOUNT' : 'PROPERTIES INSPECTOR'}
                </span>
                <button
                    onClick={() => setIsProfileDrawerOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111622] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex bg-[#F4F6F8] dark:bg-[#0F131A] p-1">
                <button
                    onClick={() => {
                        if (activeThread) {
                            setProfileDrawerTab('peer');
                        }
                    }}
                    disabled={!activeThread}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer font-display ${profileDrawerTab === 'peer'
                        ? 'bg-white dark:bg-[#161B24] text-[#FF6B35] shadow'
                        : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                >
                    Peer Details
                </button>
                <button
                    onClick={() => setProfileDrawerTab('self')}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer font-display ${profileDrawerTab === 'self'
                        ? 'bg-white dark:bg-[#161B24] text-[#FF6B35] shadow'
                        : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                        }`}
                >
                    My Profile
                </button>
            </div>

            {profileDrawerTab === 'self' ? (
                <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="space-y-3">
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1 pl-1 font-mono text-left">
                            My Account Portrait
                        </div>
                        <div className="flex flex-col items-center gap-3 bg-slate-50 dark:bg-[#111622]/30 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/40">
                            <div className="relative">
                                <img
                                    src={draftProfile?.profilePicture || myProfile?.profilePicture}
                                    alt="Avatar Draft"
                                    className="relative w-16 h-16 rounded-2xl object-cover border-2 border-[#FF6B35]/35 shadow-md z-10"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1">
                            Workspace Status
                        </label>
                        <div className="flex bg-slate-100/50 dark:bg-[#111622] p-1 rounded-xl border border-slate-100 dark:border-zinc-805/40 gap-1">
                            {(['online', 'away', 'offline'] as const).map((statusVal) => {
                                const isSelected = draftProfile?.status === statusVal;
                                return (
                                    <button
                                        key={statusVal}
                                        type="button"
                                        onClick={() => setDraftProfile({ ...draftProfile, status: statusVal })}
                                        className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isSelected
                                            ? 'bg-white dark:bg-[#182131] text-slate-800 dark:text-zinc-100 shadow-sm border border-slate-200/10 dark:border-zinc-800/30'
                                            : 'text-slate-400 hover:text-slate-650 dark:hover:text-zinc-400'
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusVal === 'online' ? 'bg-emerald-500' : statusVal === 'away' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                        {statusVal}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-left">
                        <div>
                            <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={draftProfile?.fullname || ''}
                                onChange={(e) => setDraftProfile({ ...draftProfile, fullname: e.target.value })}
                                className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 focus:border-[#FF6B35]/40 focus:outline-none focus:bg-white dark:focus:bg-[#131924] transition-all dark:text-zinc-150 placeholder-slate-400 font-sans"
                                placeholder="Jane Doe"
                            />
                        </div>

                        {/* Username field: changed to read-only layout */}
                        <div>
                            <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1 opacity-70">Username tag (Locked)</label>
                            <div className="relative mt-1.5">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400/60 text-xs font-mono select-none">@</span>
                                <input
                                    type="text"
                                    readOnly
                                    value={myProfile?.username || ''}
                                    className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-[#0F131A] border border-slate-200/30 dark:border-zinc-900 text-slate-400 dark:text-zinc-500 cursor-not-allowed font-mono select-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1 opacity-70">Email address (Locked)</label>
                            <input
                                type="email"
                                readOnly
                                value={myProfile?.email || ''}
                                className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-[#0F131A] border border-slate-200/30 dark:border-zinc-900 text-slate-400 dark:text-zinc-500 cursor-not-allowed font-sans select-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-zinc-800/30 text-left">
                        <div>
                            <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1">Bio</label>
                            <textarea
                                value={draftProfile?.bio || ''}
                                onChange={(e) => setDraftProfile({ ...draftProfile, bio: e.target.value })}
                                className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 focus:border-[#FF6B35]/40 focus:outline-none focus:bg-white dark:focus:bg-[#131924] transition-all dark:text-zinc-150 placeholder-slate-400 font-sans resize-none"
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1">Phone Number</label>
                            <input
                                type="tel"
                                value={draftProfile?.phone || ''}
                                onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                                className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 focus:border-[#FF6B35]/40 focus:outline-none focus:bg-white dark:focus:bg-[#131924] transition-all dark:text-zinc-150 placeholder-slate-400 font-sans"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-bold text-xs shadow-lg shadow-[#FF6B35]/20 hover:bg-[#FF5E20] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSavingProfile ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    COMMITTING CHANGES...
                                </>
                            ) : profileSaveSuccess ? (
                                <>
                                    <CheckCircle size={14} />
                                    PROFILE COMMITTED
                                </>
                            ) : (
                                'UPDATE ACCOUNT PARAMETERS'
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {activeThread ? (
                        <div className="p-6 space-y-6">
                            {/* Top Profile Header */}
                            <div className="flex flex-col items-center text-center space-y-4 pb-5 border-b border-slate-100 dark:border-zinc-800/30">
                                <div className="relative">
                                    <img
                                        src={activeThread.peer.avatarUrl || activeThread.peer.profilePicture}
                                        alt={activeThread.peer.fullname || activeThread.peer.fullName}
                                        className="w-24 h-24 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-[#111622]"
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white dark:border-[#161B24] ${activeThread.peer.status === 'online' ? 'bg-emerald-500' : activeThread.peer.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">
                                        {activeThread.peer.fullname || activeThread.peer.fullName}
                                    </h3>
                                    <p className="text-xs font-mono text-slate-400 dark:text-zinc-500 mt-1">@{activeThread.peer.username}</p>
                                </div>
                                {activeThread.peer.classification && (
                                    <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                                        {activeThread.peer.classification}
                                    </div>
                                )}
                            </div>

                            {/* Detailed Info Section */}
                            <div className="space-y-4 text-left">
                                {/* Bio Field */}
                                <div>
                                    <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1 ">
                                        Bio
                                    </label>
                                    <div className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 font-sans min-h-[60px] overflow-heddin">
                                        {activeThread.peer.bio || 'No bio provided yet.'}
                                    </div>
                                </div>

                                {/* Email Field */}
                                {activeThread.peer.email && (
                                    <div>
                                        <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1">
                                            Email address
                                        </label>
                                        <div className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 font-sans overflow-x-auto whitespace-nowrap">
                                            {activeThread.peer.email}
                                        </div>
                                    </div>
                                )}

                
                                <div>
                                    <label className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider font-mono pl-1">
                                        Phone Number
                                    </label>
                                    <div className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 font-sans">
                                        {activeThread.peer.phone  || 'Not listed'}
                                    </div>
                                </div>

                                
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            <Info size={32} className="text-slate-200 dark:text-zinc-800 mb-4" />
                            <p className="text-xs text-slate-400 dark:text-zinc-600 font-medium">Select a node to inspect its workspace parameters and properties.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SlideOut;