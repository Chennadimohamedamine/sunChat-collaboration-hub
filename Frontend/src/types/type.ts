export type UserStatus = 'online' | 'away' | 'offline';
export type ClassificationTier = 'Pro Tier' | 'Core Member' | 'System Admin' | 'Basic License' | 'user' | 'admin' | 'operator';
export type AttachmentType = 'image' | 'document' | 'voice' | 'link';
export type ThreadCategory = 'All' | 'Unread' ; 
export type NotificationType = 'mention' | 'warning' | 'tip' | 'action';

export interface AppConfig {
  darkMode: boolean;
  primaryAccent: string;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  profilePicture?: string;
  status: UserStatus;
  bio?: string;
  nodeId: string;
  classification: ClassificationTier;
  email: string;
  phone?: string;
  timezone?: string;
  avatarUrl?: string; // Added for compatibility
  fullName?: string; // Added for compatibility
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  size: string;
  url?: string;
}

export interface Message {
  id: string;


  conversationId: string;


  sender?: User;

  senderId?: string;


  content: string;

  text?: string;


  attachments?: Attachment[];


  createdAt?: string | Date;

  timestamp?: string;
}

export interface Thread {
  id: string;
  peer: User;
  messages: Message[];
  unreadCount: number;
  categories: ThreadCategory[];
  lastUpdated: string; // ISO string
}

export interface WorkspaceNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  sender?: string;
}

export interface AppSettings {
  darkMode: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  primaryAccent: string;
}
