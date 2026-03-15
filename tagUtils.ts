import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Message, Chat, SiteSettings, Poll, TagDefinition } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const ADMIN_EMAIL = 'alesakolomiec3@gmail.com';
const ADMIN_PASSWORD = 'alosokakkk7389_2';

const hasActiveGlobalBan = (user: User) => user.isBanned && (!user.banExpires || user.banExpires > Date.now());

const defaultSettings: SiteSettings = {
  siteName: 'HOM RP',
  welcomeMessage: 'Добро пожаловать в HOM RP!',
  primaryColor: '#6366f1',
  maxGroupMembers: 200,
  allowRegistration: true,
  maintenanceMode: false,
  announcement: '',
};

const defaultTagDefs: TagDefinition[] = [
  { name: 'OWNER', color1: '#eab308', color2: '#f59e0b', textColor: 'white' },
  { name: 'ADMIN', color1: '#ef4444', color2: '#ec4899', textColor: 'white' },
  { name: 'VIP', color1: '#a855f7', color2: '#ec4899', textColor: 'white' },
  { name: 'BOT', color1: '#3b82f6', color2: '#06b6d4', textColor: 'white' },
  { name: 'MOD', color1: '#22c55e', color2: '#10b981', textColor: 'white' },
  { name: 'DEV', color1: '#6366f1', color2: '#3b82f6', textColor: 'white' },
  { name: 'PREMIUM', color1: '#f59e0b', color2: '#eab308', textColor: 'black' },
  { name: 'SPONSOR', color1: '#ec4899', color2: '#f43f5e', textColor: 'white' },
];

const botUser: User = {
  id: 'bot-telechat',
  name: 'HOM RP Bot',
  username: 'homrp_bot',
  email: 'bot@telechat.app',
  avatar: '',
  avatarType: 'image',
  status: 'online',
  statusText: 'Всегда на связи',
  bio: 'Официальный бот HOM RP',
  isAdmin: false,
  isModerator: false,
  isBanned: false,
  tags: ['BOT'],
  stickers: [],
  lastSeen: Date.now(),
  createdAt: Date.now(),
};

const adminUser: User = {
  id: 'admin-main',
  name: 'Admin',
  username: 'admin',
  email: ADMIN_EMAIL,
  avatar: '',
  avatarType: 'image',
  status: 'online',
  statusText: '',
  bio: 'Администратор HOM RP',
  isAdmin: true,
  isModerator: true,
  isBanned: false,
  tags: ['OWNER', 'ADMIN'],
  stickers: [],
  lastSeen: Date.now(),
  createdAt: Date.now(),
};

interface AppState {
  currentUser: User | null;
  users: User[];
  passwords: Record<string, string>;
  chats: Chat[];
  messages: Message[];
  activeChat: string | null;
  tagDefinitions: TagDefinition[];

  showProfile: boolean;
  showAdmin: boolean;
  showCreateGroup: boolean;
  showCreateChannel: boolean;
  showEditProfile: boolean;
  showUserProfile: string | null;
  showCreatePoll: boolean;
  showForwardPicker: string | null;
  showEditChat: string | null;
  showTagManager: boolean;
  searchQuery: string;
  sidebarTab: 'chats' | 'contacts' | 'settings';
  siteSettings: SiteSettings;

  login: (email: string, password: string) => boolean;
  loginWithGoogle: (name: string, email: string, password: string) => boolean;
  registerWithGoogle: (name: string, email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, username: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setStatus: (status: User['status'], statusText?: string) => void;

  sendMessage: (chatId: string, text: string, replyTo?: string) => void;
  sendRoll: (chatId: string, userName: string, value: number, max: number) => void;
  sendSticker: (chatId: string, stickerUrl: string) => void;
  sendImage: (chatId: string, imageData: string, caption?: string) => void;
  sendVideo: (chatId: string, videoData: string, caption?: string) => void;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string) => void;
  forwardMessage: (messageId: string, targetChatId: string) => void;

  pinMessage: (chatId: string, messageId: string) => void;
  unpinMessage: (chatId: string, messageId: string) => void;

  createPoll: (chatId: string, question: string, options: string[], multiple: boolean, anonymous: boolean) => void;
  votePoll: (messageId: string, optionId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;

  createDirectChat: (userId: string) => string;
  createGroup: (name: string, description: string, memberIds: string[]) => void;
  createChannel: (name: string, description: string) => void;
  joinChannel: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  addMemberToGroup: (chatId: string, userId: string) => void;
  removeMemberFromGroup: (chatId: string, userId: string) => void;

  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  promoteChatAdmin: (chatId: string, userId: string) => void;
  demoteChatAdmin: (chatId: string, userId: string) => void;

  banUser: (userId: string, duration?: number) => void;
  unbanUser: (userId: string) => void;
  promoteToSiteAdmin: (userId: string) => void;
  demoteFromSiteAdmin: (userId: string) => void;
  promoteToModerator: (userId: string) => void;
  demoteFromModerator: (userId: string) => void;

  banUserInChat: (chatId: string, userId: string, duration?: number) => void;
  unbanUserInChat: (chatId: string, userId: string) => void;
  setChatMemberEditPermission: (chatId: string, allowed: boolean) => void;

  // Tags
  setUserTags: (userId: string, tags: string[]) => void;
  addUserTag: (userId: string, tag: string) => void;
  removeUserTag: (userId: string, tag: string) => void;
  addTagDefinition: (def: TagDefinition) => void;
  updateTagDefinition: (name: string, updates: Partial<TagDefinition>) => void;
  removeTagDefinition: (name: string) => void;

  // Stickers
  addSticker: (stickerBase64: string) => void;
  removeSticker: (stickerIndex: number) => void;

  setActiveChat: (chatId: string | null) => void;
  setShowProfile: (show: boolean) => void;
  setShowAdmin: (show: boolean) => void;
  setShowCreateGroup: (show: boolean) => void;
  setShowCreateChannel: (show: boolean) => void;
  setShowEditProfile: (show: boolean) => void;
  setShowUserProfile: (userId: string | null) => void;
  setShowCreatePoll: (show: boolean) => void;
  setShowForwardPicker: (msgId: string | null) => void;
  setShowEditChat: (chatId: string | null) => void;
  setShowTagManager: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSidebarTab: (tab: 'chats' | 'contacts' | 'settings') => void;

  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  deleteUser: (userId: string) => void;
  toggleMuteChat: (chatId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [adminUser, botUser],
      passwords: { [ADMIN_EMAIL]: ADMIN_PASSWORD },
      chats: [],
      messages: [],
      activeChat: null,
      tagDefinitions: defaultTagDefs,

      showProfile: false,
      showAdmin: false,
      showCreateGroup: false,
      showCreateChannel: false,
      showEditProfile: false,
      showUserProfile: null,
      showCreatePoll: false,
      showForwardPicker: null,
      showEditChat: null,
      showTagManager: false,
      searchQuery: '',
      sidebarTab: 'chats',
      siteSettings: defaultSettings,

      login: (email, password) => {
        const { users, passwords } = get();
        const normalizedEmail = email.trim().toLowerCase();
        const expectedPassword = normalizedEmail === ADMIN_EMAIL ? ADMIN_PASSWORD : passwords[normalizedEmail];
        if (expectedPassword === password) {
          const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
          if (user) {
            const updated = { ...user, status: 'online' as const, lastSeen: Date.now() };
            set({
              currentUser: updated,
              users: users.map(u => u.id === user.id ? updated : u),
            });
            return true;
          }
        }
        return false;
      },

      loginWithGoogle: (_name, email, password) => {
        const { users, passwords } = get();
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        if (!trimmedPassword) return false;
        if (normalizedEmail === ADMIN_EMAIL && trimmedPassword !== ADMIN_PASSWORD) return false;

        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        const savedPassword = normalizedEmail === ADMIN_EMAIL ? ADMIN_PASSWORD : passwords[normalizedEmail];

        // Security mode: no silent auto-registration from login form.
        // This prevents entering a different password on another device and getting a new account.
        if (!user || !savedPassword) return false;
        if (savedPassword !== trimmedPassword) return false;

        const updated = {
          ...user,
          // Keep existing name for registered users. Name input is ignored on login.
          status: 'online' as const,
          lastSeen: Date.now(),
        };
        set({
          currentUser: updated,
          users: users.map(u => u.id === user.id ? updated : u),
          passwords: {
            ...passwords,
            [normalizedEmail]: savedPassword,
          },
        });
        return true;
      },

      registerWithGoogle: (name, email, password) => {
        const { users, passwords, chats, messages, siteSettings } = get();
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        const trimmedName = name.trim();

        if (!siteSettings.allowRegistration) return false;
        if (!trimmedName || !normalizedEmail || !trimmedPassword) return false;
        if (users.some(u => u.email.toLowerCase() === normalizedEmail)) return false;

        // Generate unique @username from email local-part.
        const baseUsername =
          normalizedEmail
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .slice(0, 16) || 'user';
        let username = baseUsername;
        let suffix = 1;
        while (users.some(u => u.username === username)) {
          username = `${baseUsername}${suffix}`.slice(0, 20);
          suffix += 1;
        }

        const user: User = {
          id: generateId(),
          name: trimmedName,
          username,
          email: normalizedEmail,
          avatar: '',
          avatarType: 'image',
          status: 'online',
          statusText: '',
          bio: '',
          isAdmin: false,
          isModerator: false,
          isBanned: false,
          tags: [],
          stickers: [],
          lastSeen: Date.now(),
          createdAt: Date.now(),
        };

        const welcomeChatId = generateId();
        const welcomeChat: Chat = {
          id: welcomeChatId,
          type: 'direct',
          name: '',
          avatar: '',
          avatarType: 'image',
          description: '',
          members: [user.id, 'bot-telechat'],
          admins: [],
          createdBy: 'bot-telechat',
          createdAt: Date.now(),
          pinnedMessages: [],
          muted: false,
          allowMembersEditInfo: false,
          bannedMembers: [],
        };

        const welcomeMsg: Message = {
          id: generateId(),
          chatId: welcomeChatId,
          senderId: 'bot-telechat',
          text: `Привет, ${trimmedName}! 👋 Добро пожаловать в HOM RP!`,
          timestamp: Date.now(),
          edited: false,
          readBy: ['bot-telechat'],
        };

        set({
          currentUser: user,
          users: [...users, user],
          passwords: { ...passwords, [normalizedEmail]: trimmedPassword },
          chats: [...chats, welcomeChat],
          messages: [...messages, welcomeMsg],
        });

        return true;
      },

      register: (name, email, password, username) => {
        const { users, passwords, chats, messages } = get();
        const normalizedEmail = email.trim().toLowerCase();
        if (passwords[normalizedEmail]) return false;
        if (users.some(u => u.username === username)) return false;
        const user: User = {
          id: generateId(),
          name,
          username,
          email: normalizedEmail,
          avatar: '',
          avatarType: 'image',
          status: 'online',
          statusText: '',
          bio: '',
          isAdmin: false,
          isModerator: false,
          isBanned: false,
          tags: [],
          stickers: [],
          lastSeen: Date.now(),
          createdAt: Date.now(),
        };
        const welcomeChatId = generateId();
        const welcomeChat: Chat = {
          id: welcomeChatId,
          type: 'direct',
          name: '',
          avatar: '',
          avatarType: 'image',
          description: '',
          members: [user.id, 'bot-telechat'],
          admins: [],
          createdBy: 'bot-telechat',
          createdAt: Date.now(),
          pinnedMessages: [],
          muted: false,
          allowMembersEditInfo: false,
          bannedMembers: [],
        };
        const welcomeMsg: Message = {
          id: generateId(),
          chatId: welcomeChatId,
          senderId: 'bot-telechat',
          text: `Привет, ${name}! 👋 Добро пожаловать в HOM RP!`,
          timestamp: Date.now(),
          edited: false,
          readBy: ['bot-telechat'],
        };
        set({
          currentUser: user,
          users: [...users, user],
          passwords: { ...passwords, [normalizedEmail]: password },
          chats: [...chats, welcomeChat],
          messages: [...messages, welcomeMsg],
        });
        return true;
      },

      logout: () => {
        const { currentUser, users } = get();
        if (currentUser) {
          const canLogout = currentUser.id === 'admin-main' || !!currentUser.isModerator;
          if (!canLogout) return;
          set({
            currentUser: null,
            activeChat: null,
            showAdmin: false,
            showProfile: false,
            users: users.map(u => u.id === currentUser.id ? { ...u, status: 'offline' as const, lastSeen: Date.now() } : u),
          });
        }
      },

      updateProfile: (updates) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        if (updates.username) {
          const taken = users.some(u => u.id !== currentUser.id && u.username === updates.username);
          if (taken) return;
        }
        const updated = { ...currentUser, ...updates };
        set({
          currentUser: updated,
          users: users.map(u => u.id === currentUser.id ? updated : u),
        });
      },

      setStatus: (status, statusText) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        const updated = { ...currentUser, status, statusText: statusText ?? currentUser.statusText };
        set({
          currentUser: updated,
          users: users.map(u => u.id === currentUser.id ? updated : u),
        });
      },

      sendMessage: (chatId, text, replyTo) => {
        const { currentUser, messages, chats } = get();
        if (!currentUser || !text.trim()) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan || !chat.members.includes(currentUser.id)) return;
        const canWrite = chat.type !== 'channel' || chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canWrite) return;
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId: currentUser.id,
          text: text.trim(),
          timestamp: Date.now(),
          edited: false,
          replyTo,
          readBy: [currentUser.id],
        };
        set({
          messages: [...messages, msg],
          chats: chats.map(c => c.id === chatId ? { ...c, lastMessage: msg } : c),
        });
      },

      sendRoll: (chatId, userName, value, max) => {
        const { currentUser, messages, chats } = get();
        if (!currentUser) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan || !chat.members.includes(currentUser.id)) return;
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${userName}, вам выпало ${value}`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
          roll: {
            userName,
            value,
            max,
          },
        };
        set({
          messages: [...messages, msg],
          chats: chats.map(c => c.id === chatId ? { ...c, lastMessage: msg } : c),
        });
      },

      sendSticker: (chatId, stickerUrl) => {
        const { currentUser, messages, chats } = get();
        if (!currentUser) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan || !chat.members.includes(currentUser.id)) return;
        const canWrite = chat.type !== 'channel' || chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canWrite) return;
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId: currentUser.id,
          text: '',
          timestamp: Date.now(),
          edited: false,
          readBy: [currentUser.id],
          sticker: stickerUrl,
        };
        set({
          messages: [...messages, msg],
          chats: chats.map(c => c.id === chatId ? { ...c, lastMessage: msg } : c),
        });
      },

      sendImage: (chatId, imageData, caption) => {
        const { currentUser, messages, chats } = get();
        if (!currentUser) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan || !chat.members.includes(currentUser.id)) return;
        const canWrite = chat.type !== 'channel' || chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canWrite) return;
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId: currentUser.id,
          text: caption || '',
          timestamp: Date.now(),
          edited: false,
          readBy: [currentUser.id],
          image: imageData,
        };
        set({
          messages: [...messages, msg],
          chats: chats.map(c => c.id === chatId ? { ...c, lastMessage: msg } : c),
        });
      },

      sendVideo: (chatId, videoData, caption) => {
        const { currentUser, messages, chats } = get();
        if (!currentUser) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan || !chat.members.includes(currentUser.id)) return;
        const canWrite = chat.type !== 'channel' || chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canWrite) return;
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId: currentUser.id,
          text: caption || '',
          timestamp: Date.now(),
          edited: false,
          readBy: [currentUser.id],
          video: videoData,
        };
        set({
          messages: [...messages, msg],
          chats: chats.map(c => c.id === chatId ? { ...c, lastMessage: msg } : c),
        });
      },

      editMessage: (messageId, newText) => {
        const { messages } = get();
        set({
          messages: messages.map(m => m.id === messageId ? { ...m, text: newText, edited: true } : m),
        });
      },

      deleteMessage: (messageId) => {
        const { messages, chats } = get();
        set({
          messages: messages.filter(m => m.id !== messageId),
          chats: chats.map(c => ({
            ...c,
            pinnedMessages: (c.pinnedMessages || []).filter(id => id !== messageId),
          })),
        });
      },

      forwardMessage: (messageId, targetChatId) => {
        const { currentUser, messages, chats, users } = get();
        if (!currentUser) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const targetChat = chats.find(c => c.id === targetChatId);
        if (!targetChat) return;
        const targetBan = (targetChat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (targetBan || !targetChat.members.includes(currentUser.id)) return;
        const canWrite = targetChat.type !== 'channel' || targetChat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canWrite) return;
        const original = messages.find(m => m.id === messageId);
        if (!original) return;
        const originalSender = users.find(u => u.id === original.senderId);
        const fwd: Message = {
          id: generateId(),
          chatId: targetChatId,
          senderId: currentUser.id,
          text: original.text,
          timestamp: Date.now(),
          edited: false,
          readBy: [currentUser.id],
          forwarded: {
            fromChatId: original.chatId,
            originalSenderId: original.senderId,
            originalSenderName: originalSender?.name || 'Неизвестный',
          },
          poll: original.poll ? { ...original.poll } : undefined,
          sticker: original.sticker,
          image: original.image,
          video: original.video,
        };
        set({
          messages: [...messages, fwd],
          chats: chats.map(c => c.id === targetChatId ? { ...c, lastMessage: fwd } : c),
          showForwardPicker: null,
          activeChat: targetChatId,
        });
      },

      pinMessage: (chatId, messageId) => {
        const { chats, messages, currentUser } = get();
        if (!currentUser) return;
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} закрепил(а) сообщение`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId ? {
            ...c,
            pinnedMessages: [...(c.pinnedMessages || []), messageId],
            pinnedMessage: messageId,
          } : c),
          messages: [...messages.map(m => m.id === messageId ? { ...m, pinned: true } : m), sysMsg],
        });
      },

      unpinMessage: (chatId, messageId) => {
        const { chats, messages } = get();
        set({
          chats: chats.map(c => c.id === chatId ? {
            ...c,
            pinnedMessages: (c.pinnedMessages || []).filter(id => id !== messageId),
            pinnedMessage: (c.pinnedMessages || []).filter(id => id !== messageId).slice(-1)[0] || undefined,
          } : c),
          messages: messages.map(m => m.id === messageId ? { ...m, pinned: false } : m),
        });
      },

      createPoll: (chatId, question, options, multiple, anonymous) => {
        const { currentUser, messages, chats } = get();
        if (!currentUser) return;
        if (hasActiveGlobalBan(currentUser)) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan || !chat.members.includes(currentUser.id)) return;
        const canWrite = chat.type !== 'channel' || chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canWrite) return;
        const poll: Poll = {
          question,
          options: options.map(text => ({
            id: generateId(),
            text,
            votes: [],
          })),
          multiple,
          anonymous,
          createdBy: currentUser.id,
        };
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId: currentUser.id,
          text: '',
          timestamp: Date.now(),
          edited: false,
          readBy: [currentUser.id],
          poll,
        };
        set({
          messages: [...messages, msg],
          chats: chats.map(c => c.id === chatId ? { ...c, lastMessage: msg } : c),
          showCreatePoll: false,
        });
      },

      votePoll: (messageId, optionId) => {
        const { currentUser, messages } = get();
        if (!currentUser) return;
        set({
          messages: messages.map(m => {
            if (m.id !== messageId || !m.poll) return m;
            const newPoll = { ...m.poll };
            newPoll.options = newPoll.options.map(opt => {
              if (opt.id === optionId) {
                if (opt.votes.includes(currentUser.id)) {
                  return { ...opt, votes: opt.votes.filter(v => v !== currentUser.id) };
                } else {
                  if (!newPoll.multiple) {
                    newPoll.options = newPoll.options.map(o => ({
                      ...o,
                      votes: o.votes.filter(v => v !== currentUser.id),
                    }));
                  }
                  return { ...opt, votes: [...opt.votes.filter(v => v !== currentUser.id), currentUser.id] };
                }
              }
              return opt;
            });
            return { ...m, poll: newPoll };
          }),
        });
      },

      toggleReaction: (messageId, emoji) => {
        const { currentUser, messages } = get();
        if (!currentUser) return;
        set({
          messages: messages.map(m => {
            if (m.id !== messageId || m.senderId === 'system') return m;

            const reactions = [...(m.reactions || [])];
            const reactionIdx = reactions.findIndex(r => r.emoji === emoji);
            const userReactionCount = reactions.reduce((count, r) => (
              r.userIds.includes(currentUser.id) ? count + 1 : count
            ), 0);

            if (reactionIdx >= 0 && reactions[reactionIdx].userIds.includes(currentUser.id)) {
              const nextUserIds = reactions[reactionIdx].userIds.filter(id => id !== currentUser.id);
              if (nextUserIds.length === 0) {
                reactions.splice(reactionIdx, 1);
              } else {
                reactions[reactionIdx] = { ...reactions[reactionIdx], userIds: nextUserIds };
              }
              return { ...m, reactions };
            }

            if (userReactionCount >= 3) {
              return m;
            }

            if (reactionIdx >= 0) {
              reactions[reactionIdx] = {
                ...reactions[reactionIdx],
                userIds: [...reactions[reactionIdx].userIds, currentUser.id],
              };
            } else {
              reactions.push({ emoji, userIds: [currentUser.id] });
            }

            return { ...m, reactions };
          }),
        });
      },

      createDirectChat: (userId) => {
        const { currentUser, chats } = get();
        if (!currentUser) return '';
        const existing = chats.find(c =>
          c.type === 'direct' &&
          c.members.includes(currentUser.id) &&
          c.members.includes(userId)
        );
        if (existing) {
          set({ activeChat: existing.id });
          return existing.id;
        }
        const chat: Chat = {
          id: generateId(),
          type: 'direct',
          name: '',
          avatar: '',
          avatarType: 'image',
          description: '',
          members: [currentUser.id, userId],
          admins: [],
          createdBy: currentUser.id,
          createdAt: Date.now(),
          pinnedMessages: [],
          muted: false,
          allowMembersEditInfo: false,
          bannedMembers: [],
        };
        set({ chats: [...chats, chat], activeChat: chat.id });
        return chat.id;
      },

      createGroup: (name, description, memberIds) => {
        const { currentUser, chats, messages } = get();
        if (!currentUser) return;
        const chatId = generateId();
        const chat: Chat = {
          id: chatId,
          type: 'group',
          name,
          avatar: '',
          avatarType: 'image',
          description,
          members: [currentUser.id, ...memberIds],
          admins: [currentUser.id],
          createdBy: currentUser.id,
          createdAt: Date.now(),
          pinnedMessages: [],
          muted: false,
          allowMembersEditInfo: false,
          bannedMembers: [],
        };
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} создал(а) группу "${name}"`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: [...chats, chat],
          messages: [...messages, sysMsg],
          showCreateGroup: false,
          activeChat: chatId,
        });
      },

      createChannel: (name, description) => {
        const { currentUser, chats, messages } = get();
        if (!currentUser) return;
        const chatId = generateId();
        const chat: Chat = {
          id: chatId,
          type: 'channel',
          name,
          avatar: '',
          avatarType: 'image',
          description,
          members: [currentUser.id],
          admins: [currentUser.id],
          createdBy: currentUser.id,
          createdAt: Date.now(),
          pinnedMessages: [],
          muted: false,
          allowMembersEditInfo: false,
          bannedMembers: [],
        };
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `Канал "${name}" создан`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: [...chats, chat],
          messages: [...messages, sysMsg],
          showCreateChannel: false,
          activeChat: chatId,
        });
      },

      joinChannel: (chatId) => {
        const { currentUser, chats, messages } = get();
        if (!currentUser) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan) return;
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} присоединился к каналу`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId ? { ...c, members: c.members.includes(currentUser.id) ? c.members : [...c.members, currentUser.id] } : c),
          messages: [...messages, sysMsg],
        });
      },

      leaveChat: (chatId) => {
        const { currentUser, chats, messages, activeChat } = get();
        if (!currentUser) return;
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} покинул(а) чат`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId ? {
            ...c,
            members: c.members.filter(m => m !== currentUser.id),
            admins: c.admins.filter(a => a !== currentUser.id),
          } : c),
          messages: [...messages, sysMsg],
          activeChat: activeChat === chatId ? null : activeChat,
        });
      },

      addMemberToGroup: (chatId, userId) => {
        const { chats, users, messages, currentUser } = get();
        if (!currentUser) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const canManage = chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canManage) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === userId && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan) return;
        const user = users.find(u => u.id === userId);
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} добавил(а) ${user?.name || 'пользователя'}`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId
            ? { ...c, members: c.members.includes(userId) ? c.members : [...c.members, userId] }
            : c),
          messages: [...messages, sysMsg],
        });
      },

      removeMemberFromGroup: (chatId, userId) => {
        const { chats, users, messages, currentUser } = get();
        if (!currentUser) return;
        const user = users.find(u => u.id === userId);
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} удалил(а) ${user?.name || 'пользователя'}`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId ? {
            ...c,
            members: c.members.filter(m => m !== userId),
            admins: c.admins.filter(a => a !== userId),
          } : c),
          messages: [...messages, sysMsg],
        });
      },

      updateChat: (chatId, updates) => {
        const { chats, messages, currentUser } = get();
        if (!currentUser) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const activeBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
        if (activeBan) return;
        const canEdit = chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator || (chat.allowMembersEditInfo && chat.members.includes(currentUser.id));
        if (!canEdit) return;
        const updatesTheme = updates.messageBubbleColor !== undefined || updates.chatBackgroundColor !== undefined || updates.chatBackgroundImage !== undefined;
        const canEditTheme = chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (updatesTheme && !canEditTheme) return;
        const changes: string[] = [];
        if (updates.name && updates.name !== chat.name) changes.push(`название на "${updates.name}"`);
        if (updates.description !== undefined && updates.description !== chat.description) changes.push('описание');
        if (updates.avatar !== undefined && updates.avatar !== chat.avatar) changes.push('фото');
        if (updates.messageBubbleColor !== undefined && updates.messageBubbleColor !== chat.messageBubbleColor) changes.push('цвет сообщений');
        if (updates.chatBackgroundColor !== undefined && updates.chatBackgroundColor !== chat.chatBackgroundColor) changes.push('цвет фона');
        if (updates.chatBackgroundImage !== undefined && updates.chatBackgroundImage !== chat.chatBackgroundImage) {
          changes.push(updates.chatBackgroundImage ? 'фон чата' : 'фон чата удален');
        }
        const sysMsg: Message | null = changes.length > 0 ? {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${currentUser.name} изменил(а) ${changes.join(' и ')}`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        } : null;
        set({
          chats: chats.map(c => c.id === chatId ? { ...c, ...updates } : c),
          messages: sysMsg ? [...messages, sysMsg] : messages,
          showEditChat: null,
        });
      },

      deleteChat: (chatId) => {
        const { chats, messages, activeChat } = get();
        set({
          chats: chats.filter(c => c.id !== chatId),
          messages: messages.filter(m => m.chatId !== chatId),
          activeChat: activeChat === chatId ? null : activeChat,
        });
      },

      promoteChatAdmin: (chatId, userId) => {
        const { chats, users, messages, currentUser } = get();
        if (!currentUser) return;
        const user = users.find(u => u.id === userId);
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${user?.name || 'Пользователь'} теперь администратор`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId
            ? { ...c, admins: c.admins.includes(userId) ? c.admins : [...c.admins, userId] }
            : c),
          messages: [...messages, sysMsg],
        });
      },

      demoteChatAdmin: (chatId, userId) => {
        const { chats, users, messages } = get();
        const user = users.find(u => u.id === userId);
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${user?.name || 'Пользователь'} больше не администратор`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId
            ? { ...c, admins: c.admins.filter(a => a !== userId) }
            : c),
          messages: [...messages, sysMsg],
        });
      },

      banUser: (userId, duration) => {
        const { users, currentUser } = get();
        const banExpires = duration ? Date.now() + duration : undefined;
        set({
          users: users.map(u => u.id === userId ? {
            ...u,
            isBanned: true,
            banExpires,
          } : u),
          ...(currentUser?.id === userId ? {
            currentUser: {
              ...currentUser,
              isBanned: true,
              banExpires,
            },
          } : {}),
        });
      },

      unbanUser: (userId) => {
        const { users, currentUser } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, isBanned: false, banExpires: undefined } : u),
          ...(currentUser?.id === userId ? {
            currentUser: { ...currentUser, isBanned: false, banExpires: undefined },
          } : {}),
        });
      },

      promoteToSiteAdmin: (userId) => {
        const { users } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, isAdmin: true } : u),
        });
      },

      demoteFromSiteAdmin: (userId) => {
        const { users } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, isAdmin: false } : u),
        });
      },

      promoteToModerator: (userId) => {
        const { users } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, isModerator: true } : u),
        });
      },

      demoteFromModerator: (userId) => {
        const { users } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, isModerator: false } : u),
        });
      },

      banUserInChat: (chatId, userId, duration) => {
        const { chats, users, messages, currentUser } = get();
        if (!currentUser) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const canManage = chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canManage) return;

        const expiresAt = duration ? Date.now() + duration : undefined;
        const target = users.find(u => u.id === userId);
        const activeBans = (chat.bannedMembers || []).filter(b => b.userId !== userId && (!b.expiresAt || b.expiresAt > Date.now()));
        const nextBans = [...activeBans, { userId, expiresAt }];

        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${target?.name || 'Пользователь'} заблокирован${expiresAt ? ` до ${new Date(expiresAt).toLocaleString('ru-RU')}` : ' навсегда'}`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };

        set({
          chats: chats.map(c => c.id === chatId ? {
            ...c,
            admins: c.admins.filter(a => a !== userId),
            bannedMembers: nextBans,
          } : c),
          messages: [...messages, sysMsg],
        });
      },

      unbanUserInChat: (chatId, userId) => {
        const { chats, users, messages, currentUser } = get();
        if (!currentUser) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const canManage = chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canManage) return;
        const target = users.find(u => u.id === userId);
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: `${target?.name || 'Пользователь'} разблокирован в чате`,
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId ? {
            ...c,
            bannedMembers: (c.bannedMembers || []).filter(b => b.userId !== userId),
          } : c),
          messages: [...messages, sysMsg],
        });
      },

      setChatMemberEditPermission: (chatId, allowed) => {
        const { chats, currentUser, messages } = get();
        if (!currentUser) return;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const canManage = chat.admins.includes(currentUser.id) || currentUser.isAdmin || currentUser.isModerator;
        if (!canManage) return;
        const sysMsg: Message = {
          id: generateId(),
          chatId,
          senderId: 'system',
          text: allowed ? 'Участникам разрешили менять фото и название' : 'Участникам запретили менять фото и название',
          timestamp: Date.now(),
          edited: false,
          readBy: [],
        };
        set({
          chats: chats.map(c => c.id === chatId ? { ...c, allowMembersEditInfo: allowed } : c),
          messages: [...messages, sysMsg],
        });
      },

      // Tags
      setUserTags: (userId, tags) => {
        const { users, currentUser } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, tags } : u),
          ...(currentUser?.id === userId ? { currentUser: { ...currentUser, tags } } : {}),
        });
      },

      addUserTag: (userId, tag) => {
        const { users, currentUser } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, tags: [...(u.tags || []).filter(t => t !== tag), tag] } : u),
          ...(currentUser?.id === userId ? { currentUser: { ...currentUser, tags: [...(currentUser.tags || []).filter(t => t !== tag), tag] } } : {}),
        });
      },

      removeUserTag: (userId, tag) => {
        const { users, currentUser } = get();
        set({
          users: users.map(u => u.id === userId ? { ...u, tags: (u.tags || []).filter(t => t !== tag) } : u),
          ...(currentUser?.id === userId ? { currentUser: { ...currentUser, tags: (currentUser.tags || []).filter(t => t !== tag) } } : {}),
        });
      },

      addTagDefinition: (def) => {
        const { tagDefinitions } = get();
        if (tagDefinitions.some(t => t.name === def.name)) return;
        set({ tagDefinitions: [...tagDefinitions, def] });
      },

      updateTagDefinition: (name, updates) => {
        const { tagDefinitions } = get();
        set({
          tagDefinitions: tagDefinitions.map(t => t.name === name ? { ...t, ...updates } : t),
        });
      },

      removeTagDefinition: (name) => {
        const { tagDefinitions, users, currentUser } = get();
        set({
          tagDefinitions: tagDefinitions.filter(t => t.name !== name),
          users: users.map(u => ({ ...u, tags: (u.tags || []).filter(t => t !== name) })),
          ...(currentUser ? { currentUser: { ...currentUser, tags: (currentUser.tags || []).filter(t => t !== name) } } : {}),
        });
      },

      // Stickers
      addSticker: (stickerBase64) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        const updated = { ...currentUser, stickers: [...(currentUser.stickers || []), stickerBase64] };
        set({
          currentUser: updated,
          users: users.map(u => u.id === currentUser.id ? updated : u),
        });
      },

      removeSticker: (stickerIndex) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        const newStickers = [...(currentUser.stickers || [])];
        newStickers.splice(stickerIndex, 1);
        const updated = { ...currentUser, stickers: newStickers };
        set({
          currentUser: updated,
          users: users.map(u => u.id === currentUser.id ? updated : u),
        });
      },

      setActiveChat: (chatId) => set({ activeChat: chatId }),
      setShowProfile: (show) => set({ showProfile: show }),
      setShowAdmin: (show) => set({ showAdmin: show }),
      setShowCreateGroup: (show) => set({ showCreateGroup: show }),
      setShowCreateChannel: (show) => set({ showCreateChannel: show }),
      setShowEditProfile: (show) => set({ showEditProfile: show }),
      setShowUserProfile: (userId) => set({ showUserProfile: userId }),
      setShowCreatePoll: (show) => set({ showCreatePoll: show }),
      setShowForwardPicker: (msgId) => set({ showForwardPicker: msgId }),
      setShowEditChat: (chatId) => set({ showEditChat: chatId }),
      setShowTagManager: (show) => set({ showTagManager: show }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      updateSiteSettings: (settings) => {
        const { siteSettings } = get();
        set({ siteSettings: { ...siteSettings, ...settings } });
      },

      deleteUser: (userId) => {
        const { users, chats } = get();
        set({
          users: users.filter(u => u.id !== userId),
          chats: chats.map(c => ({ ...c, members: c.members.filter(m => m !== userId) })),
        });
      },

      toggleMuteChat: (chatId) => {
        const { chats } = get();
        set({ chats: chats.map(c => c.id === chatId ? { ...c, muted: !c.muted } : c) });
      },
    }),
    {
      name: 'telechat-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        passwords: state.passwords,
        chats: state.chats,
        messages: state.messages,
        siteSettings: state.siteSettings,
        tagDefinitions: state.tagDefinitions,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.passwords[ADMIN_EMAIL] = ADMIN_PASSWORD;
        const hasAdmin = state.users.some(u => u.id === 'admin-main');
        if (!hasAdmin) {
          state.users.unshift(adminUser);
        } else {
          state.users = state.users.map(u => u.id === 'admin-main' ? {
            ...u,
            email: ADMIN_EMAIL,
            isAdmin: true,
            isModerator: true,
          } : u);
        }
        if (state.siteSettings.siteName === 'TeleChat') {
          state.siteSettings.siteName = 'HOM RP';
        }
        if (state.siteSettings.welcomeMessage.includes('TeleChat')) {
          state.siteSettings.welcomeMessage = 'Добро пожаловать в HOM RP!';
        }
        state.users = state.users.map((u) => {
          if (u.id !== 'bot-telechat') return u;
          return {
            ...u,
            name: 'HOM RP Bot',
            username: 'homrp_bot',
            bio: 'Официальный бот HOM RP',
          };
        });
        const cleanedUsers = state.users.filter(u => !u.email.endsWith('@telechat.fake'));
        const cleanedPasswords = Object.fromEntries(
          Object.entries(state.passwords).filter(([email]) => !email.endsWith('@telechat.fake'))
        );
        if (cleanedUsers.length !== state.users.length) {
          state.users = cleanedUsers;
          state.passwords = cleanedPasswords;
          if (state.currentUser && state.currentUser.email.endsWith('@telechat.fake')) {
            state.currentUser = null;
            state.activeChat = null;
          }
          state.chats = state.chats.map(chat => ({
            ...chat,
            members: chat.members.filter(memberId => cleanedUsers.some(u => u.id === memberId)),
            admins: chat.admins.filter(adminId => cleanedUsers.some(u => u.id === adminId)),
            bannedMembers: (chat.bannedMembers || []).filter(ban => cleanedUsers.some(u => u.id === ban.userId)),
          }));
          state.messages = state.messages.filter(msg =>
            msg.senderId === 'system' || msg.senderId === 'bot-telechat' || cleanedUsers.some(u => u.id === msg.senderId)
          );
        }
      },
    }
  )
);
