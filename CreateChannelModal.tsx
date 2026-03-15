import { useStore } from '../store';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Search, Users, Megaphone, MessageCircle, LogOut, Shield,
  User, Hash, VolumeX, ChevronDown, BarChart3, AtSign, Plus,
} from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  online: 'В сети',
  offline: 'Не в сети',
  away: 'Отошёл',
  busy: 'Занят',
};

export default function Sidebar() {
  const {
    currentUser, users, chats, messages, activeChat, searchQuery,
    setActiveChat, setSearchQuery, setShowCreateGroup, setShowCreateChannel,
    setShowAdmin, setShowEditProfile, logout,
    joinChannel,
  } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [filter, setFilter] = useState<'all' | 'direct' | 'groups' | 'channels'>('all');

  if (!currentUser) return null;
  const canLogout = currentUser.id === 'admin-main' || !!currentUser.isModerator;

  const myChats = chats.filter(c => c.members.includes(currentUser.id));
  const publicChannels = chats.filter(c => c.type === 'channel' && !c.members.includes(currentUser.id));

  const filteredChats = myChats.filter(c => {
    if (filter === 'direct') return c.type === 'direct';
    if (filter === 'groups') return c.type === 'group';
    if (filter === 'channels') return c.type === 'channel';
    return true;
  });

  const getChatName = (chat: typeof chats[0]) => {
    if (chat.type === 'direct') {
      const other = users.find(u => u.id !== currentUser.id && chat.members.includes(u.id));
      return other?.name || 'Удалённый пользователь';
    }
    return chat.name;
  };

  const getChatAvatar = (chat: typeof chats[0]) => {
    if (chat.type === 'direct') {
      const other = users.find(u => u.id !== currentUser.id && chat.members.includes(u.id));
      return other?.avatar || '';
    }
    return chat.avatar;
  };

  const getChatStatus = (chat: typeof chats[0]) => {
    if (chat.type === 'direct') {
      const other = users.find(u => u.id !== currentUser.id && chat.members.includes(u.id));
      return other?.status || 'offline';
    }
    return null;
  };

  const getLastMessage = (chat: typeof chats[0]) => {
    const chatMsgs = messages.filter(m => m.chatId === chat.id);
    return chatMsgs[chatMsgs.length - 1];
  };

  const getUnreadCount = (chat: typeof chats[0]) => {
    return messages.filter(m => m.chatId === chat.id && !m.readBy.includes(currentUser.id) && m.senderId !== currentUser.id).length;
  };

  const sortedChats = [...filteredChats].sort((a, b) => {
    const la = getLastMessage(a);
    const lb = getLastMessage(b);
    return (lb?.timestamp || b.createdAt) - (la?.timestamp || a.createdAt);
  });

  const searchResults = searchQuery
    ? [
        ...sortedChats.filter(c => getChatName(c).toLowerCase().includes(searchQuery.toLowerCase())),
        ...publicChannels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
      ]
    : sortedChats;

  const { setStatus } = useStore();

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 border-r border-white/10">
      {/* Header */}
      <div className="p-3 flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="relative flex-shrink-0 rounded-2xl p-0.5 hover:bg-white/5 transition"
        >
          <Avatar src={currentUser.avatar} name={currentUser.name} size="md" status={currentUser.status} showStatus />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{currentUser.name}</div>
          <div className="text-white/40 text-xs truncate flex items-center gap-0.5">
            {currentUser.username ? (
              <><AtSign className="w-3 h-3" />{currentUser.username}</>
            ) : (
              currentUser.statusText || statusLabels[currentUser.status]
            )}
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition">
            <ChevronDown className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                <button onClick={() => { setShowEditProfile(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition">
                  <User className="w-4 h-4" /> Мой профиль
                </button>
                <button onClick={() => { setShowStatusMenu(!showStatusMenu); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition">
                  <span className={`w-3 h-3 rounded-full ${statusColors[currentUser.status]}`} /> Статус
                </button>
                {showStatusMenu && (
                  <div className="px-2 pb-2 space-y-1">
                    {(['online', 'away', 'busy', 'offline'] as const).map(s => (
                      <button key={s} onClick={() => { setStatus(s); setShowStatusMenu(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${currentUser.status === s ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/60 hover:bg-white/10'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${statusColors[s]}`} /> {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                )}
                {(currentUser.isAdmin || currentUser.isModerator) && (
                  <button onClick={() => { setShowAdmin(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-yellow-400 hover:bg-white/10 text-sm transition">
                    <Shield className="w-4 h-4" /> Админ-панель
                  </button>
                )}
                {canLogout && (
                  <>
                    <div className="border-t border-white/10" />
                    <button onClick={() => { logout(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 text-sm transition">
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 flex gap-1 mb-2 overflow-x-auto">
        {([
          ['all', 'Все', MessageCircle],
          ['direct', 'Личные', User],
          ['groups', 'Группы', Users],
          ['channels', 'Каналы', Megaphone],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${filter === key ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* New chat buttons */}
      <div className="px-3 hidden sm:flex gap-2 mb-2">
        <button onClick={() => setShowCreateGroup(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-medium hover:bg-indigo-500/20 transition">
          <Users className="w-3.5 h-3.5" /> Группа
        </button>
        <button onClick={() => setShowCreateChannel(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-medium hover:bg-purple-500/20 transition">
          <Megaphone className="w-3.5 h-3.5" /> Канал
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-20 sm:pb-2">
        {searchResults.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет чатов</p>
          </div>
        )}
        {searchResults.map(chat => {
          const isPublicChannel = !chat.members.includes(currentUser.id);
          const lastMsg = getLastMessage(chat);
          const unread = getUnreadCount(chat);
          const chatStatus = getChatStatus(chat);
          const sender = lastMsg ? users.find(u => u.id === lastMsg.senderId) : null;

          return (
            <button
              key={chat.id}
              onClick={() => {
                if (isPublicChannel) {
                  joinChannel(chat.id);
                }
                setActiveChat(chat.id);
                setSearchQuery('');
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group ${
                activeChat === chat.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <Avatar
                src={getChatAvatar(chat)}
                name={getChatName(chat)}
                size="lg"
                type={chat.type === 'channel' ? 'channel' : chat.type === 'group' ? 'group' : 'user'}
                status={chatStatus}
                showStatus={chat.type === 'direct'}
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm truncate flex items-center gap-1">
                    {chat.type === 'channel' && <Hash className="w-3 h-3 text-purple-400" />}
                    {getChatName(chat)}
                    {chat.muted && <VolumeX className="w-3 h-3 text-white/30" />}
                  </span>
                  {lastMsg && (
                    <span className="text-white/30 text-xs flex-shrink-0 ml-2">
                      {format(lastMsg.timestamp, 'HH:mm', { locale: ru })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs truncate">
                    {isPublicChannel ? (
                      <span className="text-indigo-400">Нажмите чтобы присоединиться</span>
                    ) : lastMsg ? (
                      <>
                        {lastMsg.senderId === 'system' ? '' :
                         lastMsg.senderId === currentUser.id ? 'Вы: ' :
                         chat.type !== 'direct' ? `${sender?.name?.split(' ')[0] || ''}: ` : ''}
                         {lastMsg.poll ? (
                           <span className="inline-flex items-center gap-1"><BarChart3 className="w-3 h-3 inline" /> Опрос</span>
                          ) : lastMsg.sticker ? '🖼 Стикер' : lastMsg.image ? '📷 Фото' : lastMsg.video ? '🎬 Видео' : lastMsg.text}
                      </>
                    ) : (
                      <span className="text-white/20">Нет сообщений</span>
                    )}
                  </p>
                  {unread > 0 && !chat.muted && (
                    <span className="ml-2 bg-indigo-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

      </div>

      {/* Mobile quick actions */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-gray-900/95 backdrop-blur-xl px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="py-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            Группа
          </button>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="py-2.5 rounded-xl bg-purple-500/15 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Megaphone className="w-4 h-4" />
            Канал
          </button>
          {(currentUser.isAdmin || currentUser.isModerator) ? (
            <button
              onClick={() => setShowAdmin(true)}
              className="py-2.5 rounded-xl bg-yellow-500/15 text-yellow-300 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Админ
            </button>
          ) : (
            <button
              onClick={() => setShowEditProfile(true)}
              className="py-2.5 rounded-xl bg-white/10 text-white/80 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Профиль
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden sm:block p-3 border-t border-white/10">
        <div className="text-center text-white/20 text-xs">
          {useStore.getState().siteSettings.siteName} • {users.filter(u => u.status === 'online').length} онлайн
        </div>
      </div>
    </div>
  );
}
