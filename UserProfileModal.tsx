import { useState } from 'react';
import { useStore } from '../store';
import { X, Users, Check } from 'lucide-react';
import Avatar from './Avatar';

export default function CreateGroupModal() {
  const { users, currentUser, setShowCreateGroup, createGroup } = useStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  if (!currentUser) return null;
  const availableUsers = users.filter(u => u.id !== currentUser.id && u.id !== 'bot-telechat');

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup(name, desc, selected);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">Новая группа</h3>
          </div>
          <button onClick={() => setShowCreateGroup(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <input
          type="text"
          placeholder="Название группы"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 mb-3 focus:outline-none focus:border-indigo-500/50"
        />
        <input
          type="text"
          placeholder="Описание (необязательно)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 mb-4 focus:outline-none focus:border-indigo-500/50"
        />
        <p className="text-white/50 text-sm mb-2">Добавить участников:</p>
        <div className="flex-1 overflow-y-auto space-y-1 mb-4">
          {availableUsers.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">Нет доступных пользователей</p>
          ) : availableUsers.map(user => (
            <button
              key={user.id}
              onClick={() => toggle(user.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition ${selected.includes(user.id) ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="flex-1 text-left">
                <div className="text-white text-sm">{user.name}</div>
                    <div className="text-white/40 text-xs">{user.username ? `@${user.username}` : 'Пользователь'}</div>
              </div>
              {selected.includes(user.id) && <Check className="w-4 h-4 text-indigo-400" />}
            </button>
          ))}
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition disabled:opacity-30"
        >
          Создать группу {selected.length > 0 && `(${selected.length})`}
        </button>
      </div>
    </div>
  );
}
