import React from "react";
import { Loader2, MessageSquare, Search, UserPlus } from "lucide-react";
import type { Thread, ThreadCategory, User } from "../types/type";
import { motion } from "framer-motion";

interface SideBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedThreadId: string | null;
    setSelectedThreadId: (id: string | null) => void;
    filteredThreads: Thread[];
    getTabUnderlineStyle: () => React.CSSProperties;
    setActiveCategory: (category: ThreadCategory) => void;
    activeCategory: ThreadCategory;
    isLoading: boolean;
    searchResults?: User[];
    isSearching?: boolean;
    onSelectUser?: (user: User) => void;
    onlineUsers?: Set<string>;
}

const SideBar: React.FC<SideBarProps> = ({
    searchQuery,
    setSearchQuery,
    selectedThreadId,
    setSelectedThreadId,
    filteredThreads,
    getTabUnderlineStyle,
    setActiveCategory,
    activeCategory,
    isLoading,
    searchResults = [],
    isSearching = false,
    onSelectUser,
    onlineUsers,
}) => {
    return (
        <aside className={`
          ${selectedThreadId ? 'hidden md:flex' : 'flex'} 
          w-full md:w-[330px] flex-shrink-0 bg-slate-50/40 dark:bg-[#080B11] flex flex-col h-full z-15 transition-colors duration-300
        `}>

            <div className="p-4 sm:hidden">
                <div className="relative font-sans">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450">
                        <Search size={14} />
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-zinc-800/40 text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B35]/40"
                    />
                </div>
            </div>

            <div className="px-5 pt-5 pb-2 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#FF6B35]" />
                    <h2 className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight">
                        {searchQuery.length >= 2 ? 'Search Results' : 'Conversations'}
                    </h2>
                </div>
                {searchQuery.length < 2 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111622] text-slate-550 dark:text-zinc-500 border border-slate-200/10 dark:border-zinc-800/25 tracking-wider">
                        {filteredThreads.length} CHS
                    </span>
                )}
            </div>

            {searchQuery.length < 2 && (
                <div className="px-4 py-2.5">
                    <div className="relative flex bg-slate-105 dark:bg-[#111622] p-0.5 rounded-xl border border-slate-200/20 dark:border-zinc-800/40">
                        <div
                            className="absolute top-0.5 bottom-0.5 left-0 bg-white dark:bg-[#192131] rounded-lg shadow-sm transition-all duration-300 ease-out"
                            style={getTabUnderlineStyle()}
                        />
                        {(['All', 'Unread'] as ThreadCategory[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveCategory(tab)}
                                className={`relative z-10 flex-1 py-1.5 text-[9px] font-bold tracking-wide uppercase transition-colors text-center cursor-pointer font-display ${
                                    activeCategory === tab
                                        ? 'text-[#FF6B35] dark:text-[#FF6B35]'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-355'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-3.5 space-y-1.5 pb-4">
                {isSearching ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#FF6B35]" />
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-zinc-500">Searching directory...</span>
                    </div>
                ) : searchQuery.length >= 2 ? (
                    <div className="space-y-1.5">
                        {searchResults.length > 0 && (
                            <div className="px-2 py-2">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Users</span>
                            </div>
                        )}
                        {searchResults.map((user) => (
                            <motion.div
                                key={user.id}
                                onClick={() => onSelectUser?.(user)}
                                whileHover={{ x: 2 }}
                                className="p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer select-none border border-transparent hover:bg-white dark:hover:bg-[#111622] hover:border-slate-100 dark:hover:border-[#FF6B35]/20 transition-all duration-300"
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={user.profilePicture || user.avatarUrl}
                                        alt={user.fullname || user.fullName}
                                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-zinc-800/30"
                                    />
                                    <span className={`
                                        absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#080B11]
                                        ${onlineUsers?.has(user.id) ? 'bg-emerald-500' : 'bg-slate-400'}
                                    `} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-150 block truncate">
                                        {user.fullname || user.fullName}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block truncate">
                                        @{user.username}
                                    </span>
                                </div>
                                <UserPlus size={14} className="text-[#FF6B35] opacity-60" />
                            </motion.div>
                        ))}

                        {filteredThreads.length > 0 && (
                            <div className="px-2 py-2 pt-4">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Messages</span>
                            </div>
                        )}
                        {filteredThreads.map((thread) => {
                            const isActive = thread.id === selectedThreadId;
                            const lastMsg = thread.messages[thread.messages.length - 1];
                            const lastMsgText = lastMsg ? (lastMsg.content || lastMsg.text || "No content") : "No messages";

                            return (
                                <motion.div
                                    key={thread.id}
                                    onClick={() => setSelectedThreadId(thread.id)}
                                    whileHover={{ x: isActive ? 0 : 2 }}
                                    className={`
                                        relative p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer select-none border transition-all duration-300
                                        ${isActive
                                            ? 'bg-white dark:bg-[#111622] border-slate-100 dark:border-[#FF6B35]/20 shadow-sm'
                                            : 'bg-transparent border-transparent hover:bg-slate-100/55 dark:hover:bg-[#111622]/40'
                                        }
                                    `}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={thread.peer.avatarUrl || thread.peer.profilePicture}
                                            alt={thread.peer.fullname || thread.peer.fullName}
                                            className="w-10 h-10 rounded-xl object-cover"
                                        />
                                        <span className={`
                                            absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#080B11]
                                            ${onlineUsers?.has(thread.peer.id) ? 'bg-emerald-500' : 'bg-slate-400'}
                                        `} />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <span className={`text-xs font-semibold truncate block ${isActive ? 'text-[#FF6B35]' : 'text-slate-800 dark:text-zinc-150'}`}>
                                            {thread.peer.username || thread.peer.fullName}
                                        </span>
                                        <p className="text-[11px] text-slate-450 dark:text-zinc-400 truncate font-medium">
                                            {lastMsgText}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {searchResults.length === 0 && filteredThreads.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-slate-400 dark:text-zinc-650 text-xs font-medium">No results found</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {isLoading ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-[#FF6B35]" />
                                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-zinc-500">Syncing nodes...</span>
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-slate-400 dark:text-zinc-650 text-xs font-medium">No channels match filters</p>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => {
                                const isActive = thread.id === selectedThreadId;
                                const lastMsg = thread.messages[thread.messages.length - 1];
                                const lastMsgText = lastMsg ? (lastMsg.content || lastMsg.text || "No content") : "No messages";
                                const isOnline = onlineUsers?.has(thread.peer.id) ?? false;

                                return (
                                    <motion.div
                                        key={thread.id}
                                        onClick={() => setSelectedThreadId(thread.id)}
                                        whileHover={{ x: isActive ? 0 : 2 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className={`
                                            relative p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer select-none border transition-all duration-300
                                            ${isActive
                                                ? 'bg-white dark:bg-[#111622] border-slate-100 dark:border-[#FF6B35]/20 shadow-[0_4px_16px_-4px_rgba(255,107,53,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]'
                                                : 'bg-transparent border-transparent hover:bg-slate-100/55 dark:hover:bg-[#111622]/40 hover:border-slate-50 dark:hover:border-zinc-800/20'
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-[#FF6B35]" />
                                        )}

                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={thread.peer.profilePicture}
                                                alt={thread.peer.fullname}
                                                className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-zinc-800/30"
                                                referrerPolicy="no-referrer"
                                            />
                                            <span className={`
                                                absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#080B11]
                                                ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}
                                            `} />
                                        </div>

                                        <div className="flex-1 min-w-0 text-left font-sans">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className={`text-xs font-semibold truncate ${isActive ? 'text-[#FF6B35]' : 'text-slate-800 dark:text-white'}`}>
                                                    {thread.peer.fullname || thread.peer.fullName}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-450 dark:text-zinc-400 truncate pr-2 font-medium">
                                                {thread.peer.id === 'usr_ai' ? (
                                                    <span className="text-[#FF6B35] font-semibold font-display">AI // </span>
                                                ) : null}
                                                {lastMsgText}
                                            </p>
                                        </div>

                                        {thread.unreadCount > 0 && !isActive && (
                                            <span className="flex-shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-gradient-to-tr from-[#FF5E20] to-[#FF7F4D] text-[9.5px] font-bold text-white flex items-center justify-center shadow-sm shadow-[#FF6B35]/25">
                                                {thread.unreadCount}
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}

export default SideBar;