import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { getTagStyle } from '../tagUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Send, MoreVertical, ArrowLeft, Hash,
  Edit2, Trash2, Reply, X, Check, CheckCheck, UserPlus,
  LogOut as LogOutIcon, VolumeX, Volume2, Info, Pin, PinOff,
  Forward, BarChart3, Settings, ShieldCheck, ShieldOff, AtSign,
  Smile, Image as ImageIcon, Video, Plus, Search, Images
} from 'lucide-react';
import Avatar from './Avatar';
import EmojiStickerPicker from './EmojiStickerPicker';

export default function ChatView() {
  const {
    currentUser, users, chats, messages, activeChat,
    sendMessage, sendRoll, sendSticker, sendImage, sendVideo, editMessage, deleteMessage, setActiveChat,
    leaveChat, toggleMuteChat, setShowUserProfile,
    addMemberToGroup, removeMemberFromGroup,
    pinMessage, unpinMessage, setShowCreatePoll, setShowForwardPicker,
    setShowEditChat, deleteChat,
    promoteChatAdmin, demoteChatAdmin,
    banUserInChat, unbanUserInChat, setChatMemberEditPermission,
    toggleReaction,
    tagDefinitions,
  } = useStore();

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPinnedPanel, setShowPinnedPanel] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const [showEmojiSticker, setShowEmojiSticker] = useState(false);
  const [showReactionPickerFor, setShowReactionPickerFor] = useState<string | null>(null);
  const [infoTab, setInfoTab] = useState<'members' | 'media' | 'search'>('members');
  const [messageSearch, setMessageSearch] = useState('');
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find(c => c.id === activeChat);
  const chatMessages = messages.filter(m => m.chatId === activeChat).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, activeChat]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChat, replyTo]);

  if (!currentUser || !chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Send className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-white/30 text-lg font-medium">Выберите чат</h2>
          <p className="text-white/20 text-sm mt-1">для начала общения</p>
        </div>
      </div>
    );
  }

  const otherUser = chat.type === 'direct'
    ? users.find(u => u.id !== currentUser.id && chat.members.includes(u.id))
    : null;

  const chatName = chat.type === 'direct' ? (otherUser?.name || 'Пользователь') : chat.name;
  const isChatAdmin = chat.admins.includes(currentUser.id) || currentUser.isAdmin;
  const isModerator = !!currentUser.isModerator;
  const canManageChat = isChatAdmin || isModerator;
  const isChannel = chat.type === 'channel';
  const selfChatBan = (chat.bannedMembers || []).find(b => b.userId === currentUser.id && (!b.expiresAt || b.expiresAt > Date.now()));
  const isGloballyBanned = currentUser.isBanned && (!currentUser.banExpires || currentUser.banExpires > Date.now());
  const canSend = !isGloballyBanned && !selfChatBan && (!isChannel || isChatAdmin || isModerator);

  const pinnedMsgs = (chat.pinnedMessages || []).map(id => messages.find(m => m.id === id)).filter(Boolean);
  const lastPinned = pinnedMsgs[pinnedMsgs.length - 1];
  const chatMediaMessages = chatMessages.filter(m => !!m.image || !!m.video || !!m.sticker);
  const messageSearchResults = messageSearch.trim()
    ? chatMessages.filter(m => {
        if (m.roll) {
          const rollText = `${m.roll.userName} вам выпало ${m.roll.value}`.toLowerCase();
          return rollText.includes(messageSearch.toLowerCase());
        }
        return (m.text || '').toLowerCase().includes(messageSearch.toLowerCase());
      }).slice(-80).reverse()
    : [];
  const REACTION_EMOJIS = [
    '👍', '❤️', '😂', '🔥', '👏', '😮', '😎', '🎉',
    '🤩', '🥳', '🥰', '😍', '☠️', '💘', '💞', '😿', '👺', '😈', '👿', '🤡', '💩',
    '😡', '😓', '😰', '😢', '🌚', '🌝', '🥹', '😭', '🫠', '💔', '🙏', '💅', '🌹', '🥀',
  ];
  const ownBubbleStyle = { backgroundColor: chat.messageBubbleColor || '#6366f1' };
  const chatBackgroundStyle = {
    backgroundColor: chat.chatBackgroundColor || '#030712',
    backgroundImage: chat.chatBackgroundImage
      ? `linear-gradient(rgba(3,7,18,0.58), rgba(3,7,18,0.58)), url(${chat.chatBackgroundImage})`
      : undefined,
    backgroundSize: chat.chatBackgroundImage ? 'cover' : undefined,
    backgroundPosition: chat.chatBackgroundImage ? 'center' : undefined,
  } as const;

  const handleSend = () => {
    if (!text.trim()) return;
    if (editingId) {
      editMessage(editingId, text);
      setEditingId(null);
    } else {
      const trimmed = text.trim();
      if (trimmed === '/roll' || trimmed.startsWith('/roll ')) {
        const parts = trimmed.split(/\s+/);
        let max = 5000;
        if (parts[1]) {
          const parsed = parseInt(parts[1], 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 5000) max = parsed;
        }
        const roll = Math.floor(Math.random() * max) + 1;
        sendRoll(chat.id, currentUser.name, roll, max);
      } else {
        sendMessage(chat.id, trimmed, replyTo || undefined);
      }
    }
    setText('');
    setReplyTo(null);
    setShowEmojiSticker(false);
  };

  const handleSendSticker = (stickerUrl: string) => {
    sendSticker(chat.id, stickerUrl);
    setShowEmojiSticker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 80 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(isVideo ? 'Видео должно быть не более 80МБ' : 'Изображение должно быть не более 5МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      if (isVideo) {
        sendVideo(chat.id, data);
      } else {
        sendImage(chat.id, data);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleContextMenu = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault();
    setContextMenu({ id: msgId, x: e.clientX, y: e.clientY });
  };

  const replyMessage = replyTo ? messages.find(m => m.id === replyTo) : null;
  const replySender = replyMessage ? users.find(u => u.id === replyMessage.senderId) : null;

  const nonMembers = users.filter(u => {
    const banned = (chat.bannedMembers || []).find(b => b.userId === u.id && (!b.expiresAt || b.expiresAt > Date.now()));
    return !chat.members.includes(u.id) && u.id !== 'bot-telechat' && u.id !== 'system' && !banned;
  });

  const groupedMessages: { date: string; msgs: typeof chatMessages }[] = [];
  chatMessages.forEach(msg => {
    const dateStr = format(msg.timestamp, 'd MMMM yyyy', { locale: ru });
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateStr) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, msgs: [msg] });
    }
  });

  const getTotalVotes = (poll: NonNullable<typeof chatMessages[0]['poll']>) => {
    const allVoters = new Set<string>();
    poll.options.forEach(o => o.votes.forEach(v => allVoters.add(v)));
    return allVoters.size;
  };

  const handleDeleteChat = () => {
    deleteChat(chat.id);
    setShowChatMenu(false);
    setConfirmDeleteChat(false);
  };

  const jumpToMessage = (messageId: string) => {
    setShowMembers(false);
    setHighlightMessageId(messageId);
    setTimeout(() => {
      const el = document.getElementById(`msg-${messageId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    setTimeout(() => setHighlightMessageId(null), 2000);
  };

  const getMessagePreview = (msg: typeof chatMessages[number]) => {
    if (msg.roll) return `🎲 ${msg.roll.userName}: ${msg.roll.value}/${msg.roll.max}`;
    if (msg.sticker) return '🖼 Стикер';
    if (msg.image) return '📷 Фото';
    if (msg.video) return '🎬 Видео';
    if (msg.poll) return '📊 Опрос';
    return msg.text || 'Сообщение';
  };

  const renderTags = (userTags: string[] | undefined) => {
    if (!userTags || userTags.length === 0) return null;
    return (
      <span className="inline-flex gap-0.5 ml-1">
        {userTags.map((tag, i) => (
          <span key={i} className="text-[9px] px-1 py-0 rounded-sm font-bold leading-tight" style={getTagStyle(tag, tagDefinitions)}>
            {tag}
          </span>
        ))}
      </span>
    );
  };

  const renderReactions = (msgId: string, isOwnMsg: boolean) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || msg.senderId === 'system') return null;
    const reactions = msg.reactions || [];

    return (
      <div
        className={`relative mt-1 flex items-center gap-1 flex-wrap ${isOwnMsg ? 'justify-end' : 'justify-start'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {reactions.map((reaction) => {
          const reacted = reaction.userIds.includes(currentUser.id);
          return (
            <button
              key={reaction.emoji}
              onClick={(e) => {
                e.stopPropagation();
                toggleReaction(msgId, reaction.emoji);
              }}
              className={`text-xs px-2 py-1 rounded-full border transition ${
                reacted
                  ? 'bg-indigo-500/30 border-indigo-400/40 text-white'
                  : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
              }`}
            >
              {reaction.emoji} {reaction.userIds.length}
            </button>
          );
        })}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReactionPickerFor(prev => prev === msgId ? null : msgId);
          }}
          className="text-xs px-2 py-1 rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
          title="Добавить реакцию"
        >
          <Plus className="w-3 h-3" />
        </button>
        {showReactionPickerFor === msgId && (
          <div
            className={`absolute z-30 ${isOwnMsg ? 'right-0' : 'left-0'} bottom-full mb-2 bg-gray-900/95 border border-white/10 rounded-xl p-1.5 shadow-xl w-64 max-w-[78vw] overflow-x-auto overflow-y-hidden overscroll-contain`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-nowrap gap-1">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReaction(msgId, emoji);
                    setShowReactionPickerFor(null);
                  }}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 text-lg shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950 relative">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <button onClick={() => setActiveChat(null)} className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            setInfoTab(chat.type === 'direct' ? 'media' : 'members');
            setShowMembers(true);
          }}
        >
          <Avatar
            src={chat.type === 'direct' ? otherUser?.avatar : chat.avatar}
            name={chatName}
            size="md"
            type={chat.type === 'channel' ? 'channel' : chat.type === 'group' ? 'group' : 'user'}
            status={otherUser?.status}
            showStatus={chat.type === 'direct'}
          />
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate flex items-center gap-1">
              {chat.type === 'channel' && <Hash className="w-3.5 h-3.5 text-purple-400" />}
              {chatName}
              {chat.type === 'direct' && otherUser && renderTags(otherUser.tags)}
            </h3>
            <p className="text-white/40 text-xs truncate">
              {chat.type === 'direct' ? (
                otherUser?.status === 'online' ? 'в сети' :
                otherUser?.lastSeen ? `был(а) ${format(otherUser.lastSeen, 'dd.MM в HH:mm', { locale: ru })}` : 'не в сети'
              ) : (
                `${chat.members.length} участников`
              )}
            </p>
          </div>
        </div>

        {pinnedMsgs.length > 0 && (
          <button
            onClick={() => setShowPinnedPanel(true)}
            className="p-2.5 text-yellow-400/70 hover:text-yellow-400 hover:bg-white/10 rounded-xl transition"
            title={`${pinnedMsgs.length} закреплённых`}
          >
            <Pin className="w-4 h-4" />
          </button>
        )}

        <div className="relative">
          <button onClick={() => setShowChatMenu(!showChatMenu)} className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition">
            <MoreVertical className="w-5 h-5" />
          </button>
          {showChatMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setShowChatMenu(false); setConfirmDeleteChat(false); }} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                {(chat.type === 'group' || chat.type === 'channel') && (
                  <button onClick={() => { setShowMembers(true); setShowChatMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition">
                    <Info className="w-4 h-4" /> Информация
                  </button>
                )}
                {canManageChat && chat.type !== 'direct' && (
                  <button onClick={() => { setShowEditChat(chat.id); setShowChatMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition">
                    <Settings className="w-4 h-4" /> Редактировать
                  </button>
                )}
                {pinnedMsgs.length > 0 && (
                  <button onClick={() => { setShowPinnedPanel(true); setShowChatMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition">
                    <Pin className="w-4 h-4" /> Закреплённые ({pinnedMsgs.length})
                  </button>
                )}
                <button onClick={() => { toggleMuteChat(chat.id); setShowChatMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition">
                  {chat.muted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {chat.muted ? 'Включить звук' : 'Без звука'}
                </button>
                {chat.type !== 'direct' && (
                  <button onClick={() => { leaveChat(chat.id); setShowChatMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 text-sm transition">
                    <LogOutIcon className="w-4 h-4" /> Покинуть
                  </button>
                )}
                {canManageChat && chat.type !== 'direct' && (
                  <>
                    <div className="border-t border-white/10" />
                    {!confirmDeleteChat ? (
                      <button onClick={() => setConfirmDeleteChat(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm transition">
                        <Trash2 className="w-4 h-4" /> Удалить {isChannel ? 'канал' : 'группу'}
                      </button>
                    ) : (
                      <div className="p-3 space-y-2">
                        <p className="text-red-400 text-xs text-center">Удалить безвозвратно?</p>
                        <div className="flex gap-2">
                          <button onClick={handleDeleteChat}
                            className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">Да</button>
                          <button onClick={() => setConfirmDeleteChat(false)}
                            className="flex-1 py-1.5 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20">Нет</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pinned message bar */}
      {lastPinned && !showPinnedPanel && (
        <div
          className="flex items-center gap-3 px-4 py-2 bg-gray-900/60 border-b border-white/5 cursor-pointer hover:bg-gray-900/80 transition"
          onClick={() => setShowPinnedPanel(true)}
        >
          <Pin className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-yellow-400/80 font-medium">Закреплённое сообщение</div>
            <div className="text-xs text-white/50 truncate">
              {lastPinned.text || (lastPinned.sticker ? '🖼 Стикер' : lastPinned.image ? '📷 Фото' : lastPinned.video ? '🎬 Видео' : '📊 Опрос')}
            </div>
          </div>
          {pinnedMsgs.length > 1 && (
            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{pinnedMsgs.length}</span>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4"
        style={chatBackgroundStyle}
        onClick={() => { setContextMenu(null); setShowEmojiSticker(false); setShowReactionPickerFor(null); }}
      >
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex justify-center my-4">
              <span className="bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">{group.date}</span>
            </div>
            {group.msgs.map(msg => {
              const sender = users.find(u => u.id === msg.senderId);
              const isOwn = msg.senderId === currentUser.id;
              const isSystem = msg.senderId === 'system';
              const replied = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
              const repliedSender = replied ? users.find(u => u.id === replied.senderId) : null;

              if (msg.roll) {
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex justify-center my-3 transition ${highlightMessageId === msg.id ? 'ring-2 ring-amber-400/60 rounded-2xl' : ''}`}
                  >
                    <div className="rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-orange-500/20 px-4 py-3 text-center shadow-lg shadow-amber-500/10">
                      <div className="text-[11px] uppercase tracking-wider text-amber-200/80">Сообщение чата</div>
                      <p className="text-sm text-white font-semibold mt-1">
                        {msg.roll.userName}, вам выпало <span className="text-amber-300 text-base">{msg.roll.value}</span>
                      </p>
                      <p className="text-[11px] text-white/50 mt-0.5">Ролл 1-{msg.roll.max} • {format(msg.timestamp, 'HH:mm')}</p>
                    </div>
                  </div>
                );
              }

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex justify-center my-2 transition ${highlightMessageId === msg.id ? 'ring-2 ring-indigo-400/50 rounded-xl' : ''}`}
                  >
                    <span className="bg-white/5 text-white/40 text-xs px-3 py-1.5 rounded-full">{msg.text}</span>
                  </div>
                );
              }

              // Sticker message
              if (msg.sticker) {
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    onContextMenu={(e) => handleContextMenu(e, msg.id)}
                  >
                    {!isOwn && chat.type !== 'direct' && (
                      <button onClick={() => setShowUserProfile(msg.senderId)} className="flex-shrink-0 mr-2 self-end mb-0.5">
                        <Avatar src={sender?.avatar} name={sender?.name || '?'} size="xs" />
                      </button>
                    )}
                    <div className="max-w-[180px]">
                      {!isOwn && chat.type !== 'direct' && (
                        <button
                          onClick={() => setShowUserProfile(msg.senderId)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-0.5 block"
                        >
                          {sender?.name || 'Неизвестный'}
                          {renderTags(sender?.tags)}
                        </button>
                      )}
                      {msg.forwarded && (
                        <div className="text-xs mb-1 text-cyan-400/60 flex items-center gap-1">
                          <Forward className="w-3 h-3" /> от {msg.forwarded.originalSenderName}
                        </div>
                      )}
                      <img
                        src={msg.sticker}
                        alt="sticker"
                        className="w-36 h-36 object-contain cursor-pointer hover:scale-105 transition-transform"
                      />
                      <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-white/30">{format(msg.timestamp, 'HH:mm')}</span>
                        {isOwn && <CheckCheck className="w-3 h-3 text-white/30" />}
                      </div>
                      {renderReactions(msg.id, isOwn)}
                    </div>
                  </div>
                );
              }

              // Image message
              if (msg.image) {
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    onContextMenu={(e) => handleContextMenu(e, msg.id)}
                  >
                    {!isOwn && chat.type !== 'direct' && (
                      <button onClick={() => setShowUserProfile(msg.senderId)} className="flex-shrink-0 mr-2 self-end mb-0.5">
                        <Avatar src={sender?.avatar} name={sender?.name || '?'} size="xs" />
                      </button>
                    )}
                    <div className="max-w-[300px]">
                      {!isOwn && chat.type !== 'direct' && (
                        <button
                          onClick={() => setShowUserProfile(msg.senderId)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-0.5 block"
                        >
                          {sender?.name || 'Неизвестный'}
                          {renderTags(sender?.tags)}
                        </button>
                      )}
                      {msg.forwarded && (
                        <div className="text-xs mb-1 text-cyan-400/60 flex items-center gap-1">
                          <Forward className="w-3 h-3" /> от {msg.forwarded.originalSenderName}
                        </div>
                      )}
                      <div className={`rounded-2xl overflow-hidden border ${isOwn ? 'border-indigo-500/30' : 'border-white/10'}`}>
                        <img
                          src={msg.image}
                          alt="image"
                          className="w-full max-h-[350px] object-cover cursor-pointer hover:opacity-90 transition"
                          onClick={() => window.open(msg.image, '_blank')}
                        />
                        {msg.text && (
                          <div className="px-3 py-2 text-sm text-white/90" style={isOwn ? { backgroundColor: `${chat.messageBubbleColor || '#6366f1'}40` } : undefined}>
                            {msg.text}
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-white/30">{format(msg.timestamp, 'HH:mm')}</span>
                        {msg.edited && <span className="text-[10px] text-white/20">ред.</span>}
                        {isOwn && <CheckCheck className="w-3 h-3 text-white/30" />}
                      </div>
                      {renderReactions(msg.id, isOwn)}
                    </div>
                  </div>
                );
              }

              // Video message
              if (msg.video) {
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    onContextMenu={(e) => handleContextMenu(e, msg.id)}
                  >
                    {!isOwn && chat.type !== 'direct' && (
                      <button onClick={() => setShowUserProfile(msg.senderId)} className="flex-shrink-0 mr-2 self-end mb-0.5">
                        <Avatar src={sender?.avatar} name={sender?.name || '?'} size="xs" />
                      </button>
                    )}
                    <div className="max-w-[320px]">
                      {!isOwn && chat.type !== 'direct' && (
                        <button
                          onClick={() => setShowUserProfile(msg.senderId)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-0.5 block"
                        >
                          {sender?.name || 'Неизвестный'}
                          {renderTags(sender?.tags)}
                        </button>
                      )}
                      {msg.forwarded && (
                        <div className="text-xs mb-1 text-cyan-400/60 flex items-center gap-1">
                          <Forward className="w-3 h-3" /> от {msg.forwarded.originalSenderName}
                        </div>
                      )}
                      <div className={`rounded-2xl overflow-hidden border ${isOwn ? 'border-indigo-500/30' : 'border-white/10'}`}>
                        <video
                          src={msg.video}
                          controls
                          className="w-full max-h-[360px] bg-black"
                        />
                        {msg.text && (
                          <div className="px-3 py-2 text-sm text-white/90" style={isOwn ? { backgroundColor: `${chat.messageBubbleColor || '#6366f1'}40` } : undefined}>
                            {msg.text}
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-white/30">{format(msg.timestamp, 'HH:mm')}</span>
                        {msg.edited && <span className="text-[10px] text-white/20">ред.</span>}
                        {isOwn && <CheckCheck className="w-3 h-3 text-white/30" />}
                      </div>
                      {renderReactions(msg.id, isOwn)}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'} transition ${highlightMessageId === msg.id ? 'ring-2 ring-indigo-400/60 rounded-2xl' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, msg.id)}
                >
                  {!isOwn && chat.type !== 'direct' && (
                    <button onClick={() => setShowUserProfile(msg.senderId)} className="flex-shrink-0 mr-2 self-end mb-0.5">
                      <Avatar src={sender?.avatar} name={sender?.name || '?'} size="xs" />
                    </button>
                  )}
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2 relative ${
                        isOwn
                          ? 'text-white rounded-br-md'
                          : 'bg-white/10 text-white rounded-bl-md'
                      } ${msg.pinned ? 'ring-1 ring-yellow-400/30' : ''}`}
                      style={isOwn ? ownBubbleStyle : undefined}
                    >
                      {msg.pinned && (
                        <Pin className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                      )}
                      {msg.forwarded && (
                        <div className={`text-xs mb-1.5 pl-2 border-l-2 ${isOwn ? 'border-white/40 text-white/70' : 'border-cyan-400 text-cyan-400/80'} rounded-sm`}>
                          <div className="font-medium flex items-center gap-1">
                            <Forward className="w-3 h-3" /> Переслано от {msg.forwarded.originalSenderName}
                          </div>
                        </div>
                      )}
                      {!isOwn && chat.type !== 'direct' && (
                        <button
                          onClick={() => setShowUserProfile(msg.senderId)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-0.5 block"
                        >
                          {sender?.name || 'Неизвестный'}
                          {renderTags(sender?.tags)}
                          {sender?.username && (
                            <span className="font-normal text-white/30 ml-1">@{sender.username}</span>
                          )}
                        </button>
                      )}
                      {replied && (
                        <div className={`text-xs mb-1.5 pl-2 border-l-2 ${isOwn ? 'border-white/40 text-white/70' : 'border-indigo-400 text-white/60'} rounded-sm`}>
                          <div className="font-medium">{repliedSender?.name}</div>
                          <div className="truncate">{replied.text || (replied.sticker ? '🖼 Стикер' : replied.image ? '📷 Фото' : replied.video ? '🎬 Видео' : '')}</div>
                        </div>
                      )}
                      {msg.poll ? (
                        <div className="min-w-[220px]">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-sm">{msg.poll.question}</span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.poll.options.map(opt => {
                              const total = getTotalVotes(msg.poll!);
                              const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                              const voted = opt.votes.includes(currentUser.id);
                              return (
                                <button
                                  key={opt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    useStore.getState().votePoll(msg.id, opt.id);
                                  }}
                                  className={`w-full text-left p-2 rounded-lg transition relative overflow-hidden ${
                                    voted ? 'bg-indigo-500/30 border border-indigo-500/40' : (isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10 border border-white/10')
                                  }`}
                                >
                                  <div
                                    className={`absolute inset-0 ${voted ? 'bg-indigo-500/20' : 'bg-white/5'} rounded-lg transition-all`}
                                    style={{ width: `${pct}%` }}
                                  />
                                  <div className="relative flex items-center justify-between">
                                    <span className="text-xs">{opt.text}</span>
                                    <span className="text-xs opacity-70 ml-2">{pct}%</span>
                                  </div>
                                  {voted && <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-300" />}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[10px] opacity-50 mt-1.5">
                            {getTotalVotes(msg.poll)} голос(ов) {msg.poll.anonymous ? '· Анонимно' : ''} {msg.poll.multiple ? '· Несколько' : ''}
                          </div>
                        </div>
                      ) : editingId === msg.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { editMessage(msg.id, editText); setEditingId(null); }
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="bg-transparent outline-none text-sm flex-1 min-w-0"
                            autoFocus
                          />
                          <button onClick={() => { editMessage(msg.id, editText); setEditingId(null); }}>
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      )}
                      <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                        {msg.edited && <span className="text-[10px] opacity-50">ред.</span>}
                        <span className="text-[10px] opacity-50">{format(msg.timestamp, 'HH:mm')}</span>
                        {isOwn && <CheckCheck className="w-3 h-3 opacity-50" />}
                      </div>
                    </div>
                    {renderReactions(msg.id, isOwn)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Context menu */}
      {contextMenu && (() => {
        const ctxMsg = messages.find(m => m.id === contextMenu.id);
        const ctxIsOwn = ctxMsg?.senderId === currentUser.id;
        const ctxIsPinned = ctxMsg?.pinned;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <div
              className="fixed bg-gray-800 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-fadeIn"
              style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 250) }}
            >
              <button onClick={() => { setReplyTo(contextMenu.id); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/10 text-sm transition">
                <Reply className="w-4 h-4" /> Ответить
              </button>
              <button onClick={() => { setShowForwardPicker(contextMenu.id); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/10 text-sm transition">
                <Forward className="w-4 h-4" /> Переслать
              </button>
              {(isChatAdmin || ctxIsOwn) && (
                ctxIsPinned ? (
                  <button onClick={() => { unpinMessage(chat.id, contextMenu.id); setContextMenu(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-yellow-400/80 hover:bg-white/10 text-sm transition">
                    <PinOff className="w-4 h-4" /> Открепить
                  </button>
                ) : (
                  <button onClick={() => { pinMessage(chat.id, contextMenu.id); setContextMenu(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-yellow-400/80 hover:bg-white/10 text-sm transition">
                    <Pin className="w-4 h-4" /> Закрепить
                  </button>
                )
              )}
              {ctxIsOwn && !ctxMsg?.poll && !ctxMsg?.sticker && (
                <button onClick={() => {
                  if (ctxMsg) { setEditingId(ctxMsg.id); setEditText(ctxMsg.text); }
                  setContextMenu(null);
                }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/10 text-sm transition">
                  <Edit2 className="w-4 h-4" /> Редактировать
                </button>
              )}
              {(ctxIsOwn || isChatAdmin) && (
                <button onClick={() => { deleteMessage(contextMenu.id); setContextMenu(null); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-white/10 text-sm transition">
                  <Trash2 className="w-4 h-4" /> Удалить
                </button>
              )}
            </div>
          </>
        );
      })()}

      {/* Reply bar */}
      {replyTo && replyMessage && (
        <div className="px-4 py-2 bg-gray-900 border-t border-white/10 flex items-center gap-3">
          <div className="flex-1 pl-3 border-l-2 border-indigo-500">
            <div className="text-xs font-medium text-indigo-400">{replySender?.name}</div>
            <div className="text-xs text-white/50 truncate">
              {replyMessage.text || (replyMessage.sticker ? '🖼 Стикер' : replyMessage.image ? '📷 Фото' : replyMessage.video ? '🎬 Видео' : '')}
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      {canSend ? (
        <div className="px-2 sm:px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)] sm:pb-3 bg-gray-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-center gap-1.5 sm:gap-2 relative">
            {/* Combined Emoji + Sticker picker (LEFT) */}
            {showEmojiSticker && (
              <EmojiStickerPicker
                onEmojiSelect={handleEmojiSelect}
                onStickerSelect={handleSendSticker}
                onClose={() => setShowEmojiSticker(false)}
              />
            )}

            {/* Emoji + Sticker button (LEFT) */}
            <button
              onClick={() => setShowEmojiSticker(!showEmojiSticker)}
              className={`p-2.5 rounded-2xl transition flex-shrink-0 ${showEmojiSticker ? 'text-yellow-400 bg-white/10 ring-1 ring-yellow-400/30' : 'text-white/40 hover:text-yellow-300 hover:bg-white/5'}`}
              title="Эмодзи и стикеры"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Написать сообщение..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 sm:px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition min-w-0"
            />

            {/* Poll button (RIGHT) */}
            <button
              onClick={() => setShowCreatePoll(true)}
              className="hidden sm:inline-flex p-2.5 text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition flex-shrink-0"
              title="Создать опрос"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* Image upload button (RIGHT) */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 text-white/40 hover:text-purple-300 hover:bg-white/5 rounded-2xl transition flex-shrink-0"
              title="Отправить фото или видео"
            >
              <div className="relative flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
                <Video className="w-3.5 h-3.5 absolute -bottom-0.5 -right-1 text-indigo-300" />
              </div>
            </button>

            <button
              onClick={() => setShowCreatePoll(true)}
              className="sm:hidden p-2.5 text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition flex-shrink-0"
              title="Создать опрос"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2.5 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-indigo-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 bg-gray-900 border-t border-white/10 text-center text-white/30 text-sm">
          {isGloballyBanned
            ? `Вам запрещено писать в чатах${currentUser.banExpires ? ` до ${format(currentUser.banExpires, 'dd.MM HH:mm')}` : ''}`
            : selfChatBan
            ? `Вы заблокированы в этом чате${selfChatBan.expiresAt ? ` до ${format(selfChatBan.expiresAt, 'dd.MM HH:mm')}` : ''}`
            : 'Только администраторы могут писать в этот канал'}
        </div>
      )}

      {/* Pinned messages panel */}
      {showPinnedPanel && (
        <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-xl z-30 flex flex-col animate-fadeIn">
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <button onClick={() => setShowPinnedPanel(false)} className="p-1 text-white/50 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Pin className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-bold">Закреплённые сообщения ({pinnedMsgs.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {pinnedMsgs.length === 0 ? (
              <p className="text-white/30 text-center py-8">Нет закреплённых сообщений</p>
            ) : pinnedMsgs.map(msg => {
              if (!msg) return null;
              const pSender = users.find(u => u.id === msg.senderId);
              return (
                <div key={msg.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                  <Avatar src={pSender?.avatar} name={pSender?.name || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-indigo-400 text-xs font-medium">{pSender?.name}</span>
                      <span className="text-white/30 text-[10px]">{format(msg.timestamp, 'dd.MM HH:mm')}</span>
                    </div>
                    {msg.sticker ? (
                      <img src={msg.sticker} alt="sticker" className="w-20 h-20 object-contain" />
                    ) : msg.image ? (
                      <img src={msg.image} alt="image" className="w-24 h-16 object-cover rounded-lg" />
                    ) : msg.video ? (
                      <video src={msg.video} className="w-24 h-16 object-cover rounded-lg" muted />
                    ) : (
                      <p className="text-white/70 text-sm">{msg.text || '📊 Опрос'}</p>
                    )}
                  </div>
                  {isChatAdmin && (
                    <button
                      onClick={() => unpinMessage(chat.id, msg.id)}
                      className="p-1 text-white/20 hover:text-yellow-400 transition"
                      title="Открепить"
                    >
                      <PinOff className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat info panel */}
      {showMembers && (
        <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-xl z-30 flex flex-col animate-fadeIn">
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <button onClick={() => setShowMembers(false)} className="p-1 text-white/50 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar
              src={chat.type === 'direct' ? otherUser?.avatar : chat.avatar}
              name={chatName}
              size="md"
              type={chat.type === 'channel' ? 'channel' : chat.type === 'group' ? 'group' : 'user'}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold truncate">{chatName}</h3>
              <p className="text-white/40 text-xs truncate">
                {chat.type === 'direct' ? (otherUser?.bio || `@${otherUser?.username || 'user'}`) : (chat.description || 'Нет описания')}
              </p>
            </div>
            {canManageChat && chat.type !== 'direct' && (
              <button
                onClick={() => { setShowEditChat(chat.id); setShowMembers(false); }}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Редактировать"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="px-3 py-3 border-b border-white/10">
            <div className="flex gap-2 overflow-x-auto">
              {chat.type !== 'direct' && (
                <button
                  onClick={() => setInfoTab('members')}
                  className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap ${infoTab === 'members' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/60'}`}
                >
                  Участники
                </button>
              )}
              <button
                onClick={() => setInfoTab('media')}
                className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap flex items-center gap-1 ${infoTab === 'media' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/60'}`}
              >
                <Images className="w-4 h-4" /> Медиа
              </button>
              <button
                onClick={() => setInfoTab('search')}
                className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap flex items-center gap-1 ${infoTab === 'search' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/60'}`}
              >
                <Search className="w-4 h-4" /> Поиск
              </button>
            </div>
          </div>

          {infoTab === 'members' && chat.type !== 'direct' && (
            <>
              <div className="flex items-center justify-between px-4 py-3 gap-2">
                <span className="text-white/50 text-sm font-medium">Участники ({chat.members.length})</span>
                {canManageChat && (
                  <button onClick={() => setShowAddMember(true)} className="flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300 whitespace-nowrap">
                    <UserPlus className="w-4 h-4" /> Добавить
                  </button>
                )}
                {canManageChat && (
                  <button
                    onClick={() => setChatMemberEditPermission(chat.id, !chat.allowMembersEditInfo)}
                    className={`text-xs px-2 py-1 rounded-lg whitespace-nowrap ${chat.allowMembersEditInfo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                  >
                    {chat.allowMembersEditInfo ? 'Участники могут редактировать' : 'Редактирование только админам'}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-2">
                {chat.members.map(memberId => {
                  const member = users.find(u => u.id === memberId);
                  if (!member) return null;
                  const memberIsChatAdmin = chat.admins.includes(memberId);
                  return (
                    <div key={memberId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 group">
                      <button onClick={() => setShowUserProfile(memberId)}>
                        <Avatar src={member.avatar} name={member.name} size="md" status={member.status} showStatus />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium flex items-center gap-1 flex-wrap">
                          {member.name}
                          {renderTags(member.tags)}
                          {memberIsChatAdmin && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">Админ</span>}
                        </div>
                        <div className="text-white/40 text-xs flex items-center gap-1">
                          {member.username ? (
                            <><AtSign className="w-3 h-3" />{member.username}</>
                          ) : (
                            member.statusText || 'Пользователь'
                          )}
                        </div>
                      </div>
                      {canManageChat && memberId !== currentUser.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          {memberIsChatAdmin ? (
                            <button
                              onClick={() => demoteChatAdmin(chat.id, memberId)}
                              className="p-1.5 text-yellow-400/50 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition"
                              title="Убрать права админа"
                            >
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => promoteChatAdmin(chat.id, memberId)}
                              className="p-1.5 text-indigo-400/50 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition"
                              title="Сделать админом"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeMemberFromGroup(chat.id, memberId)}
                            className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                            title="Удалить из чата"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => banUserInChat(chat.id, memberId, 24 * 60 * 60 * 1000)}
                            className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                            title="Бан в чате на 1 день"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                          {(chat.bannedMembers || []).some(b => b.userId === memberId && (!b.expiresAt || b.expiresAt > Date.now())) && (
                            <button
                              onClick={() => unbanUserInChat(chat.id, memberId)}
                              className="p-1.5 text-green-400/60 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition"
                              title="Разбанить в чате"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {infoTab === 'media' && (
            <div className="flex-1 overflow-y-auto p-3">
              {chatMediaMessages.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">В этом чате пока нет медиа</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {chatMediaMessages.slice().reverse().map(msg => (
                    <button
                      key={msg.id}
                      onClick={() => jumpToMessage(msg.id)}
                      className="rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-square"
                      title="Перейти к сообщению"
                    >
                      {msg.image ? (
                        <img src={msg.image} alt="media" className="w-full h-full object-cover" />
                      ) : msg.video ? (
                        <video src={msg.video} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={msg.sticker} alt="sticker" className="w-full h-full object-contain p-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {infoTab === 'search' && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="sticky top-0 z-10 bg-gray-950/95 pb-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    placeholder="Искать по сообщениям в этом чате"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
              {!messageSearch.trim() ? (
                <p className="text-white/30 text-sm text-center py-8">Введите текст для поиска</p>
              ) : messageSearchResults.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Ничего не найдено</p>
              ) : (
                <div className="space-y-2">
                  {messageSearchResults.map(msg => {
                    const sender = users.find(u => u.id === msg.senderId);
                    return (
                      <button
                        key={msg.id}
                        onClick={() => jumpToMessage(msg.id)}
                        className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="text-xs text-indigo-300 mb-1">
                          {sender?.name || 'Система'} • {format(msg.timestamp, 'dd.MM HH:mm')}
                        </div>
                        <div className="text-sm text-white/85 line-clamp-2">{getMessagePreview(msg)}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add member modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full max-h-[70vh] flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Добавить участника</h3>
              <button onClick={() => setShowAddMember(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {nonMembers.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">Все пользователи уже в чате</p>
              ) : nonMembers.map(user => (
                <button
                  key={user.id}
                  onClick={() => { addMemberToGroup(chat.id, user.id); setShowAddMember(false); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="text-left">
                    <div className="text-white text-sm flex items-center gap-1">
                      {user.name}
                      {renderTags(user.tags)}
                    </div>
                    <div className="text-white/40 text-xs">
                      {user.username ? `@${user.username}` : 'Пользователь'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
