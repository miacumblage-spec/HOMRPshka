import { useState } from 'react';
import { useStore } from '../store';
import { X, Search, Forward } from 'lucide-react';
import Avatar from './Avatar';

export default function ForwardPicker() {
  const { currentUser, chats, users, showForwardPicker, setShowForwardPicker, forwardMessage } = useStore();
  const [search, setSearch] = useState('');

  if (!showForwardPicker || !currentUser) return null;

  const myChats = chats.filter(c => c.members.includes(currentUser.id));

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

  const filtered = search
    ? myChats.filter(c => getChatName(c).toLowerCase().includes(search.toLowerCase()))
    : myChats;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full max-h-[70vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Forward className="w-5 h-5 text-indigo-400" /> Переслать в...
          </h3>
          <button onClick={() => setShowForwardPicker(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Поиск чата..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Чаты не найдены</p>
          ) : filtered.map(chat => (
            <button
              key={chat.id}
              onClick={() => forwardMessage(showForwardPicker, chat.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition"
            >
              <Avatar
                src={getChatAvatar(chat)}
                name={getChatName(chat)}
                size="md"
                type={chat.type === 'channel' ? 'channel' : chat.type === 'group' ? 'group' : 'user'}
              />
              <div className="text-left flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{getChatName(chat)}</div>
                <div className="text-white/30 text-xs">
                  {chat.type === 'direct' ? 'Личные' : chat.type === 'group' ? 'Группа' : 'Канал'}
                  {' · '}{chat.members.length} уч.
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
