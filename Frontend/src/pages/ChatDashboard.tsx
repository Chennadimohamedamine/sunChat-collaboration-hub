import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { AppConfig, Thread, ThreadCategory, User, Attachment } from '../types/type';
import { useAuth } from '../context/AuthContext';
import ApiService from '../service/ApiService';
import NavBar from '../componnent/NavBar';
import SideBar from '../componnent/SideBar';
import ChatPanel from '../componnent/ChatPanel';
import SlideOut from '../componnent/SlideOut';
import { socketService } from '../service/socket.service';

interface ChatDashboardProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export default function ChatDashboard({ config, setConfig }: ChatDashboardProps) {
  const { currentUser, isAuthenticated, setCurrentUser} = useAuth();
  const [draftProfile, setDraftProfile] = useState<Partial<User> | null>(null);

  useEffect(() => {
    if (currentUser) {
      setDraftProfile({
        fullname: currentUser.fullname,
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio,
        profilePicture: currentUser.profilePicture,
        status: currentUser.status,
      });
    }
  }, [currentUser]);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ThreadCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [profileDrawerTab, setProfileDrawerTab] = useState<'peer' | 'self'>('peer');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [stagedAttachment, setStagedAttachment] = useState<Attachment | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // ── Socket: connect/disconnect tied to auth ────────────────────────────────
  useEffect(() => {
    const fetchThreadMessages = async () => {
      if (!selectedThreadId || !currentUser) return;

      try {
        // Fetch the historical messages from the backend database
        const historicalMessages = await ApiService.getMessages(selectedThreadId);
        
        if (Array.isArray(historicalMessages)) {
          setThreads(prev =>
            prev.map(t => {
              if (t.id !== selectedThreadId) return t;
              return {
                ...t,
                // Hydrate the matching thread with its true historical messages
                messages: historicalMessages,
              };
            })
          );
        }
      } catch (error) {
        console.error('Error fetching historical messages:', error);
      }
    };

    fetchThreadMessages();
  }, [selectedThreadId, currentUser]);
  
  useEffect(() => {
    if (!currentUser || !isAuthenticated ) return;
    if (!socketService.isConnected()) socketService.connect();
    return () => {
      if (socketService.isConnected()) socketService.disconnect();
    };
  }, [currentUser , isAuthenticated]);

  // ── Socket: event listeners ────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser) return;

    const handleAuthenticated = (data: {
      userId: string;
      username: string;
      onlineUsers: string[];
    }) => {
      setOnlineUsers(new Set(data.onlineUsers));
    };

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };

    const handleReceiveMessage = (message: any) => {
      setThreads(prev =>
        prev
          .map(t => {
            if (t.id !== message.conversationId) return t;
            // Deduplicate: skip if we already added it optimistically
            const alreadyExists = t.messages.some(m => m.id === message.id);
            if (alreadyExists) return t;
            return {
              ...t,
              messages: [...t.messages, message],
              lastUpdated: message.timestamp || new Date().toISOString(),
              unreadCount:
                message.senderId !== currentUser.id
                  ? t.unreadCount + 1
                  : t.unreadCount,
            };
          })
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      );
    };

    const handleUserTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (data.userId === currentUser.id) return;
      setTypingUsers(prev => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.conversationId, data.userId);
        } else {
          next.delete(data.conversationId);
        }
        return next;
      });
    };

    const handleNewChat = (conversation: any) => {
  
      setThreads(prev => {
        const exists = prev.some(t => t.id === conversation.id);
        if (exists) return prev;

        const newThread: Thread = {
          id: conversation.id,
          peer: conversation.participantOne.id === currentUser?.id
            ? conversation.participantTwo
            : conversation.participantOne,
          messages: conversation.messages || [],
          unreadCount: 1,
          categories: ['All'],
          lastUpdated: conversation.updatedAt || new Date().toISOString(),
        };

      
        socketService.joinConversation(conversation.id, conversation.id);

        return [newThread, ...prev];
      });
    };

    socketService.on('authenticated', handleAuthenticated);
    socketService.on('user_online', handleUserOnline);
    socketService.on('user_offline', handleUserOffline);
    socketService.on('receive_message', handleReceiveMessage);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('new_chat', handleNewChat);

    return () => {
      // FIX 2: only remove listeners here, NOT disconnect
      socketService.off('authenticated', handleAuthenticated);
      socketService.off('user_online', handleUserOnline);
      socketService.off('user_offline', handleUserOffline);
      socketService.off('receive_message', handleReceiveMessage);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('new_chat', handleNewChat);
    };
  }, [currentUser]);

  // ── FIX 3: join BOTH the conversationId room AND the username room ─────────
  // The gateway broadcasts receive_message to conversationId room,
  // so the client must join that room — not just the username room.

  useEffect(() => {
    if (!selectedThreadId || !currentUser) return;
  
    socketService.joinConversation(selectedThreadId, selectedThreadId); // roomName = conversationId
  }, [selectedThreadId, currentUser]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [conversationsRes] = await Promise.all([
          ApiService.listConversations(),
    
        ]);

        if (Array.isArray(conversationsRes)) {
          const transformedThreads: Thread[] = conversationsRes.map((conv: any) => ({
            id: conv.id,
            peer:
              conv.participantOne.id === currentUser?.id
                ? conv.participantTwo
                : conv.participantOne,
            messages: conv.messages || [],
            unreadCount: 0,
            categories: ['All'],
            lastUpdated: conv.updatedAt,
          }));
          setThreads(transformedThreads);
          if (transformedThreads.length > 0 && !selectedThreadId) {
            setSelectedThreadId(transformedThreads[0].id);
          }
        }

    
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) fetchData();
  }, [currentUser]);

  // ── Search ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await ApiService.searchUsers(searchQuery);
      
          setSearchResults(results.filter((u: User) => u.id !== currentUser?.id));
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.id]);

  // ── Typing indicator ───────────────────────────────────────────────────────

  const handleTypingChange = useCallback(
    (value: string) => {
      setTypedMessage(value);
      if (!selectedThreadId || !currentUser) return;
      socketService.emit('typing', {
        conversationId: selectedThreadId,
        userId: currentUser.id,
        isTyping: value.length > 0,
      });
    },
    [selectedThreadId, currentUser]
  );

  // ── Derived state ──────────────────────────────────────────────────────────

  const activeThread = threads.find(t => t.id === selectedThreadId) || null;
  const isPeerTyping = selectedThreadId ? typingUsers.has(selectedThreadId) : false;

  const filteredThreads = threads.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.categories.includes(activeCategory);
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch =
      t.peer.fullname.toLowerCase().includes(searchLow) ||
      t.peer.username.toLowerCase().includes(searchLow) ||
      t.messages.some(m => (m.content || m.text || '').toLowerCase().includes(searchLow));
    return matchesCategory && matchesSearch;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleToggleTheme = () => {
    setConfig(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };



  const handleSelectUser = async (user: User) => {
    const existingThread = threads.find(t => t.peer.id === user.id);
    if (existingThread) {
      setSelectedThreadId(existingThread.id);
      setSearchQuery('');
      return;
    }
    try {
      setIsLoading(true);
      const newConv = await ApiService.createConversation(user.id);
    
      
      if (newConv) {
        // Pass the structural backend response down the websocket line
        socketService.newChat(user.id, user.username, newConv);
      }

      const newThread: Thread = {
        id: newConv.id,
        peer: user,
        messages: newConv.messages || [],
        unreadCount: 0,
        categories: ['All'],
        lastUpdated: newConv.updatedAt || new Date().toISOString(),
      };
      setThreads(prev => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() && !stagedAttachment) return;
    if (!selectedThreadId || !currentUser) return;

    // Stop typing indicator immediately
    socketService.emit('typing', {
      conversationId: selectedThreadId,
      userId: currentUser.id,
      isTyping: false,
    });

    try {
      const response = await ApiService.sendMessage(selectedThreadId, typedMessage);

      // Optimistically add our own message locally
      setThreads(prev =>
        prev
          .map(t => {
            if (t.id !== selectedThreadId) return t;
            return {
              ...t,
              messages: [...t.messages, response],
              lastUpdated: new Date().toISOString(),
              unreadCount: 0,
            };
          })
          .sort((x, y) => new Date(y.lastUpdated).getTime() - new Date(x.lastUpdated).getTime())
      );

      // Broadcast to room so peer receives it in real-time
      // Gateway will emit receive_message to conversationId room
      socketService.emit('send_message', {
        conversationId: selectedThreadId,
        message: { ...response, conversationId: selectedThreadId },
      });

      setTypedMessage('');
      setStagedAttachment(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftProfile || !currentUser) return;
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);
    try {
      const updateuser = await ApiService.updateUserProfile(currentUser.id, draftProfile);
      setCurrentUser(updateuser);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3500);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getTabUnderlineStyle = () => {
    const tabs: ThreadCategory[] = ['All', 'Unread'];
    const idx = tabs.indexOf(activeCategory);
    const count = tabs.length;
    return {
      width: `${100 / count}%`,
      transform: `translateX(${idx * 100}%)`,
    };
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F4F6F8] dark:bg-[#0F131A] text-[#0F172A] dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
      <NavBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleToggleTheme={handleToggleTheme}
        config={config}
        setIsProfileDrawerOpen={setIsProfileDrawerOpen}
        isProfileDrawerOpen={isProfileDrawerOpen}
        profileDrawerTab={profileDrawerTab}
        setProfileDrawerTab={setProfileDrawerTab}
        myProfile={currentUser as any}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <SideBar
          selectedThreadId={selectedThreadId}
          setSelectedThreadId={setSelectedThreadId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          filteredThreads={filteredThreads}
          getTabUnderlineStyle={getTabUnderlineStyle}
          isLoading={isLoading}
          searchResults={searchResults}
          isSearching={isSearching}
          onSelectUser={handleSelectUser}
          onlineUsers={onlineUsers}
        />
        <ChatPanel
          selectedThreadId={selectedThreadId}
          setSelectedThreadId={setSelectedThreadId}
          activeThread={activeThread}
          isProfileDrawerOpen={isProfileDrawerOpen}
          setIsProfileDrawerOpen={setIsProfileDrawerOpen}
          profileDrawerTab={profileDrawerTab}
          setProfileDrawerTab={setProfileDrawerTab}
          isAiTyping={isPeerTyping}
          typedMessage={typedMessage}
          setTypedMessage={handleTypingChange}
          handleSendMessage={handleSendMessage}
          chatBottomRef={chatBottomRef}
          currentUserId={currentUser?.id}
          onlineUsers={onlineUsers}
          />
        <SlideOut
          isProfileDrawerOpen={isProfileDrawerOpen}
          setIsProfileDrawerOpen={setIsProfileDrawerOpen}
          profileDrawerTab={profileDrawerTab}
          setProfileDrawerTab={setProfileDrawerTab}
          activeThread={activeThread}
          myProfile={currentUser as any}
          draftProfile={draftProfile}
          setDraftProfile={setDraftProfile as any}
          handleSaveProfile={handleSaveProfile}
          isSavingProfile={isSavingProfile}
          profileSaveSuccess={profileSaveSuccess}
        />

      </div>
    </div>
  );
}