import { useState, useRef } from 'react';
import { useStore } from '../store';
import { X, Camera, Save, Trash2, Users, Megaphone, PaintBucket, Image as ImageIcon } from 'lucide-react';
import Avatar from './Avatar';

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444'];

export default function EditChatModal() {
  const { showEditChat, setShowEditChat, chats, updateChat } = useStore();
  const chat = chats.find(c => c.id === showEditChat);

  const [name, setName] = useState(chat?.name || '');
  const [description, setDescription] = useState(chat?.description || '');
  const [avatarPreview, setAvatarPreview] = useState(chat?.avatar || '');
  const [avatarType, setAvatarType] = useState<'image' | 'video'>(
    chat?.avatarType || (chat?.avatar?.startsWith('data:video/') ? 'video' : 'image')
  );
  const [bubbleColor, setBubbleColor] = useState(chat?.messageBubbleColor || '#6366f1');
  const [backgroundColor, setBackgroundColor] = useState(chat?.chatBackgroundColor || '#030712');
  const [backgroundImage, setBackgroundImage] = useState(chat?.chatBackgroundImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  if (!chat || chat.type === 'direct') return null;

  const isChannel = chat.type === 'channel';

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
      setAvatarPreview(reader.result as string);
      setAvatarType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarType('image');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateChat(chat.id, {
      name: name.trim(),
      description: description.trim(),
      avatar: avatarPreview,
      avatarType,
      messageBubbleColor: bubbleColor,
      chatBackgroundColor: backgroundColor,
      chatBackgroundImage: backgroundImage,
    });
  };

  const handleBackgroundImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Фон должен быть не более 5МБ');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setBackgroundImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${isChannel ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'} flex items-center justify-center`}>
              {isChannel ? <Megaphone className="w-5 h-5 text-white" /> : <Users className="w-5 h-5 text-white" />}
            </div>
            <h3 className="text-white font-bold text-lg">
              Редактировать {isChannel ? 'канал' : 'группу'}
            </h3>
          </div>
          <button onClick={() => setShowEditChat(null)} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <Avatar
              src={avatarPreview}
              name={name || chat.name}
              size="xl"
              type={isChannel ? 'channel' : 'group'}
            />
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
            <label className="text-white/50 text-xs font-medium mb-1 block">
              Название {isChannel ? 'канала' : 'группы'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 block">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Добавьте описание..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium mb-2 block flex items-center gap-1.5">
              <PaintBucket className="w-3.5 h-3.5" /> Цвет ваших сообщений
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setBubbleColor(color)}
                  className={`w-7 h-7 rounded-full border ${bubbleColor === color ? 'border-white' : 'border-white/20'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={bubbleColor}
                onChange={e => setBubbleColor(e.target.value)}
                className="w-9 h-7 bg-transparent border border-white/20 rounded"
                title="Свой цвет"
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium mb-2 block">Фон чата</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={e => setBackgroundColor(e.target.value)}
                className="w-10 h-8 bg-transparent border border-white/20 rounded"
                title="Цвет фона"
              />
              <input
                value={backgroundColor}
                onChange={e => setBackgroundColor(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex gap-2">
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundImage}
                className="hidden"
              />
              <button
                onClick={() => bgInputRef.current?.click()}
                className="flex-1 text-xs py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Загрузить фото
              </button>
              <button
                onClick={() => {
                  setBackgroundImage('');
                  if (bgInputRef.current) bgInputRef.current.value = '';
                }}
                className="px-3 text-xs py-2 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25"
              >
                Убрать
              </button>
            </div>

            {backgroundImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                <img src={backgroundImage} alt="chat background" className="w-full h-24 object-cover" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className={`w-full mt-5 sm:mt-6 bg-gradient-to-r ${isChannel ? 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'} text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-30`}
        >
          <Save className="w-4 h-4" /> Сохранить
        </button>
      </div>
    </div>
  );
}
