import { useStore } from '../store';
import { getTagStyle } from '../tagUtils';
import { X, MessageCircle, Clock, AtSign, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Avatar from './Avatar';

const statusLabels: Record<string, string> = {
  online: 'В сети',
  offline: 'Не в сети',
  away: 'Отошёл',
  busy: 'Занят',
};

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export default function UserProfileModal() {
  const { showUserProfile, setShowUserProfile, users, createDirectChat, currentUser, tagDefinitions } = useStore();
  const user = users.find(u => u.id === showUserProfile);
  if (!user || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
        <div className="flex justify-end mb-2">
          <button onClick={() => setShowUserProfile(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Avatar src={user.avatar} name={user.name} size="xl" status={user.status} showStatus />
          </div>

          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            {user.name}
            {user.isAdmin && <Shield className="w-4 h-4 text-yellow-400" />}
            {user.isModerator && !user.isAdmin && <Shield className="w-4 h-4 text-cyan-400" />}
          </h3>

          {user.username && (
            <div className="flex items-center gap-1 mt-1 text-indigo-400 text-sm">
              <AtSign className="w-3.5 h-3.5" />
              {user.username}
            </div>
          )}

          {/* Tags */}
          {(user.tags || []).length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap justify-center">
              {user.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={getTagStyle(tag, tagDefinitions)}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
            <span className="text-white/50 text-sm">{user.statusText || statusLabels[user.status]}</span>
          </div>

          {user.isBanned && (
            <span className="mt-2 text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
              Заблокирован{user.banExpires ? ` до ${format(user.banExpires, 'dd.MM HH:mm')}` : ' навсегда'}
            </span>
          )}

          {user.bio && (
            <p className="text-white/40 text-sm mt-3 px-4">{user.bio}</p>
          )}

          <div className="w-full mt-6 space-y-2">
            {user.username && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <AtSign className="w-4 h-4 text-white/30" />
                <span className="text-white/70 text-sm">@{user.username}</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Clock className="w-4 h-4 text-white/30" />
              <span className="text-white/50 text-sm">
                Зарегистрирован {format(user.createdAt, 'd MMM yyyy', { locale: ru })}
              </span>
            </div>
          </div>

          {user.id !== currentUser.id && (
            <button
              onClick={() => {
                createDirectChat(user.id);
                setShowUserProfile(null);
              }}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Написать сообщение
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
