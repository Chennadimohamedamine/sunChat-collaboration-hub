import React from "react";
import { ArrowLeft,Info, Lock, MessageSquare, Send} from "lucide-react";
import type { Thread } from "../types/type";

interface ChatPanelProps {
    selectedThreadId: string | null;
    setSelectedThreadId: (id: string | null) => void;
    activeThread: Thread | null;
    isProfileDrawerOpen: boolean;
    setIsProfileDrawerOpen: (open: boolean) => void;
    profileDrawerTab: 'peer' | 'self';
    setProfileDrawerTab: (tab: 'peer' | 'self') => void;
    isAiTyping: boolean;
    typedMessage: string;
    setTypedMessage: (msg: string) => void;
    handleSendMessage: (e?: React.FormEvent) => void;

    chatBottomRef: React.RefObject<HTMLDivElement | null>;
    currentUserId: string;           // ← new
    onlineUsers?: Set<string>;       // ← new
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    selectedThreadId,
    setSelectedThreadId,
    activeThread,
    isProfileDrawerOpen,
    setIsProfileDrawerOpen,
    profileDrawerTab,
    setProfileDrawerTab,
    isAiTyping,
    typedMessage,
    setTypedMessage,
    handleSendMessage,
    chatBottomRef,
    currentUserId,
    onlineUsers,
}) => {
    return (
        <section className={`
          flex-1 bg-slate-50 dark:bg-[#0F131A] flex flex-col h-full overflow-hidden relative z-0
          ${!selectedThreadId ? 'hidden md:flex' : 'flex'}
        `}>

            {activeThread ? (
                <>
                    <div className="h-16 px-6 bg-white dark:bg-[#161B24] flex items-center justify-between z-10 select-none">
                        <button
                            onClick={() => setSelectedThreadId(null)}
                            className="p-2 -ml-2 rounded-xl text-slate-500 md:hidden hover:bg-slate-100 dark:hover:bg-zinc-800"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div
                            onClick={() => {
                                if (isProfileDrawerOpen && profileDrawerTab === 'peer') {
                                    setIsProfileDrawerOpen(false);
                                } else {
                                    setIsProfileDrawerOpen(true);
                                    setProfileDrawerTab('peer');
                                }
                            }}
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 p-1.5 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-800/50"
                        >
                            <div className="relative">
                                <img
                                    src={activeThread.peer.avatarUrl || activeThread.peer.profilePicture}
                                    alt={activeThread.peer.fullname || activeThread.peer.fullName}
                                    className="w-9 h-9 rounded-xl object-cover"
                                    referrerPolicy="no-referrer"
                                />
                                {/* FIX 2: live presence dot from socket */}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-[#161B24] ${onlineUsers?.has(activeThread.peer.id) ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`} />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                                    {activeThread.peer.fullname || activeThread.peer.fullName}
                                    <span className="text-[9px] font-mono leading-none bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md">
                                        {activeThread.peer.classification}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                    {onlineUsers?.has(activeThread.peer.id) ? 'online' : 'offline'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (isProfileDrawerOpen && profileDrawerTab === 'peer') {
                                    setIsProfileDrawerOpen(false);
                                } else {
                                    setIsProfileDrawerOpen(true);
                                    setProfileDrawerTab('peer');
                                }
                            }}
                            className={`p-2.5 rounded-xl text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all ${isProfileDrawerOpen ? 'bg-slate-100 dark:bg-zinc-800 text-[#FF6B35]' : ''
                                }`}
                        >
                            <Info size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="flex justify-center select-none pb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 font-mono border border-slate-200/20 dark:border-zinc-800/40">
                                <Lock size={10} /> Fully Encrypted Tunnel Signed: {activeThread.peer.nodeId}
                            </span>
                        </div>

                        {activeThread.messages.map((message) => {
                            // FIX: Safely parse both websocket payloads (senderId) and DB objects (sender.id)
                            const senderId = message.senderId || message.sender?.id;
                            const isMe = senderId === currentUserId;

                            return (
                                <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group transition-all`}>
                                    <div className={`px-4 py-2.5 rounded-2xl text-xs break-words relative text-left whitespace-pre-line leading-relaxed shadow-sm
                ${isMe ? 'bg-[#FF6B35] text-white rounded-br-sm' : 'bg-white dark:bg-[#161B24] text-slate-700 dark:text-zinc-200 border rounded-bl-sm'}`}>
                                        {message.content || message.text}
                                    </div>
                                    <span className={`text-[9px] font-mono text-slate-400 dark:text-zinc-500 mt-1 ml-1 select-none ${isMe ? 'text-right pr-1' : 'text-left pl-1'}`}>
                                        {message.timestamp || message.createdAt
                                            ? new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </span>
                                </div>
                            );
                        })}

                        {isAiTyping && (
                            <div className="flex justify-start items-end gap-2.5">
                                <img
                                    src={activeThread.peer.avatarUrl || activeThread.peer.profilePicture}
                                    alt="typing"
                                    className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 pl-1 mb-1 text-left select-none">
                                        {activeThread.peer.fullname || activeThread.peer.fullName}
                                    </span>
                                    <div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#161B24] border border-slate-200/30 dark:border-zinc-800/40 rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-bounce" />
                                        <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatBottomRef} />
                    </div>

                    <div className="p-4 bg-white dark:bg-[#161B24] z-10 select-none">
                        
                    
                        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                            
                            <div className="flex-1 relative">
                                <textarea
                                    rows={1}
                                    value={typedMessage}
                                    onChange={(e) => setTypedMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={
                                        activeThread.peer.id === 'usr_ai'
                                            ? 'Message Sunday AI...'
                                            : `Reply to ${activeThread.peer.fullname || activeThread.peer.fullName}...`
                                    }
                                    className="w-full text-xs pl-4 pr-4 py-3 rounded-xl bg-[#F4F6F8] dark:bg-[#0F131A] text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-zinc-650 border border-transparent focus:border-[#FF6B35]/30 focus:outline-none transition-all resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!typedMessage.trim()}
                                className="p-3 rounded-xl bg-[#FF6B35] text-white hover:bg-[#FF5E20] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#FF6B35]/20"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
                    <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#161B24] flex items-center justify-center shadow-xl mb-6">
                        <MessageSquare className="w-10 h-10 text-[#FF6B35]" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white mb-2">No conversation selected</h3>
                    <p className="text-slate-450 dark:text-zinc-500 text-xs max-w-xs leading-relaxed">
                        Choose a thread from the sidebar to start interacting with nodes and Sunday AI.
                    </p>
                </div>
            )}
        </section>
    );
};

export default ChatPanel;