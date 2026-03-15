import { useState } from 'react';
import { useStore } from '../store';
import { X, Megaphone } from 'lucide-react';

export default function CreateChannelModal() {
  const { setShowCreateChannel, createChannel } = useStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    createChannel(name, desc);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">Новый канал</h3>
          </div>
          <button onClick={() => setShowCreateChannel(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-white/40 text-sm mb-4">Каналы — это инструмент для трансляции сообщений большой аудитории. Только админы могут писать.</p>
        <input
          type="text"
          placeholder="Название канала"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 mb-3 focus:outline-none focus:border-indigo-500/50"
        />
        <textarea
          placeholder="Описание канала (необязательно)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 mb-4 focus:outline-none focus:border-indigo-500/50 resize-none"
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-30"
        >
          Создать канал
        </button>
      </div>
    </div>
  );
}
