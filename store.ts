export interface TagDefinition {
  name: string;
  color1: string; // gradient from
  color2: string; // gradient to
  textColor: string; // 'white' | 'black'
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  avatarType?: 'image' | 'video';
  status: 'online' | 'offline' | 'away' | 'busy';
  statusText: string;
  bio: string;
  isAdmin: boolean;
  isModerator?: boolean;
  isBanned: boolean;
  banExpires?: number;
  tags: string[];
  stickers: string[];
  lastSeen: number;
  createdAt: number;
}

export interface ChatBan {
  userId: string;
  expiresAt?: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface Poll {
  question: string;
  options: PollOption[];
  multiple: boolean;
  anonymous: boolean;
  createdBy: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  edited: boolean;
  replyTo?: string;
  readBy: string[];
  poll?: Poll;
  forwarded?: {
    fromChatId: string;
    originalSenderId: string;
    originalSenderName: string;
  };
  pinned?: boolean;
  sticker?: string;
  image?: string;
  video?: string;
  roll?: {
    userName: string;
    value: number;
    max: number;
  };
  reactions?: MessageReaction[];
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatar: string;
  avatarType?: 'image' | 'video';
  description: string;
  members: string[];
  admins: string[];
  createdBy: string;
  createdAt: number;
  pinnedMessage?: string;
  pinnedMessages: string[];
  lastMessage?: Message;
  muted: boolean;
  allowMembersEditInfo?: boolean;
  bannedMembers?: ChatBan[];
  messageBubbleColor?: string;
  chatBackgroundColor?: string;
  chatBackgroundImage?: string;
}

export interface SiteSettings {
  siteName: string;
  welcomeMessage: string;
  primaryColor: string;
  maxGroupMembers: number;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  announcement: string;
}
