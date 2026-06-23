import React from "react";
import {LogOut, Moon, Search, Sun, X } from "lucide-react";
import ApiService from "../service/ApiService";
import type { AppConfig, User } from "../types/type";

interface NavBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleToggleTheme: () => void;
    config: AppConfig;
    setIsProfileDrawerOpen: (open: boolean) => void;
    isProfileDrawerOpen: boolean;
    profileDrawerTab: 'peer' | 'self';
    setProfileDrawerTab: (tab: 'peer' | 'self') => void;
    myProfile: User;
}

const NavBar: React.FC<NavBarProps> = ({
    searchQuery,
    setSearchQuery,
    handleToggleTheme,
    config,
 
    setIsProfileDrawerOpen,
    isProfileDrawerOpen,
    profileDrawerTab,
    setProfileDrawerTab,
    myProfile,
}) => {
    return (
        <header className="h-16 px-6 bg-white dark:bg-[#161B24] border-b border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between z-10 select-none">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white font-display font-bold text-lg shadow rotate-2 shadow-[#FF6B35]/20">S</div>
                <span className="font-display font-semibold text-lg tracking-tight hidden sm:inline-block">Sunday</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/40 dark:border-zinc-800/50 hidden md:inline-block">v2.4-stable</span>
            </div>

            <div className="flex-1 max-w-md mx-6 hidden sm:block">
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full text-xs pl-11 pr-4 py-2 rounded-xl bg-[#F4F6F8] dark:bg-[#0F131A] border border-transparent dark:border-zinc-800/50 text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:border-[#FF6B35] transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF6B35]">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={handleToggleTheme} className="p-2.5 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors hover:text-[#FF6B35]">
                    {config.darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>


                <div
                    onClick={() => {
                        if (isProfileDrawerOpen && profileDrawerTab === 'self') {
                            setIsProfileDrawerOpen(false);
                        } else {
                            setIsProfileDrawerOpen(true);
                            setProfileDrawerTab('self');
                        }

                    }}
                    className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 sm:pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/40 dark:border-zinc-800/40 cursor-pointer select-none transition-colors"
                >
                    <img
                        src={myProfile?.profilePicture}
                        alt={myProfile?.fullname || myProfile?.fullName}
                        className="w-7 h-7 rounded-full object-cover border border-[#FF6B35]/30"
                        referrerPolicy="no-referrer"
                    />
                    <div className="hidden lg:block text-left">
                        <div className="text-xs font-semibold leading-tight text-slate-800 dark:text-zinc-100">{myProfile?.fullname || myProfile?.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 leading-tight">@{myProfile?.username}</div>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        try {
                            await ApiService.logout();
                            // Redirect to auth page by reloading
                            window.location.href = '/';
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    }}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}

export default NavBar;
