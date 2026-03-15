import { useState, useRef } from 'react';
import { useStore } from '../store';
import { X, Camera, Save, Trash2, AtSign } from 'lucide-react';
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

export default function EditProfileModal() {
  const { currentUser, setShowEditProfile, updateProfile, setStatus } = useStore();
  if (!currentUser) return null;

  const detectAvatarType = (src?: string): 'image' | 'video' => {
    if (!src) return 'image';
    return src.startsWith('data:video/') || /\.(mp4|webm|ogg)(\?.*)?$/i.test(src) ? 'video' : 'image';
  };

  const [name, setName] = useState(currentUser.name);
  const [username, setLocalUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio);
  const [statusText, setStatusText] = useState(currentUser.statusText);
  const [status, setLocalStatus] = useState(currentUser.status);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [avatarType, setAvatarType] = useState<'image' | 'video'>(currentUser.avatarType || detectAvatarType(currentUser.avatar));
  const [usernameError, setUsernameError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(isVideo ? 'Видео-аватар должен быть не более 10МБ' : 'Максимальный размер фото — 2МБ');
      return;
    }

    if (isVideo) {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        if (video.duration > 5) {
          alert('Анимированный аватар должен быть не длиннее 5 секунд');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
          setAvatarType('video');
        };
        reader.readAsDataURL(file);
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        alert('Не удалось прочитать видео. Попробуйте другой файл.');
      };
      video.src = objectUrl;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarType('image');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setLocalUsername(clean);
    setUsernameError('');
    if (clean.length > 0 && clean.length < 3) {
      setUsernameError('Минимум 3 символа');
    }
  };

  const handleSave = () => {
    if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameError('3-20 символов, латиница, цифры, _');
      return;
    }
    updateProfile({ name, bio, statusText, avatar: avatarPreview, avatarType, username });
    setStatus(status, statusText);
    setShowEditProfile(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">Редактировать профиль</h3>
          <button onClick={() => setShowEditProfile(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative group">
            <Avatar src={avatarPreview} name={name} size="xl" status={status} showStatus />
            <input
              ref={fileInputRef}
              type="file"
                accept="image/*,video/mp4,video/webm"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
            {avatarPreview && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mb-4">Фото до 2МБ или видео-аватар до 10МБ и не дольше 5 секунд</p>

        <div className="space-y-3">
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 block">Имя</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
              <AtSign className="w-3 h-3" /> Юзернейм
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                maxLength={20}
                placeholder="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            {usernameError && <p className="text-red-400 text-xs mt-1">{usernameError}</p>}
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 block">О себе</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Расскажите о себе..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 block">Текст статуса</label>
            <input
              type="text"
              value={statusText}
              onChange={e => setStatusText(e.target.value)}
              placeholder="Что у вас нового?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 block">Статус</label>
            <div className="grid grid-cols-4 gap-2">
              {(['online', 'away', 'busy', 'offline'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setLocalStatus(s)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition ${status === s ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                  <span className={`w-3 h-3 rounded-full ${statusColors[s]}`} />
                  <span className="text-white/60">{statusLabels[s]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSave}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Сохранить
        </button>
      </div>
    </div>
  );
}
