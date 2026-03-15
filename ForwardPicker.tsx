import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { getTagStyle } from '../tagUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowLeft, CheckCircle, Clock, Megaphone, Palette, Save, Settings,
  Shield, ShieldCheck, ShieldOff, Tag, Trash2, Users, MessageCircle,
  LayoutGrid, SlidersHorizontal, Sparkles, X
} from 'lucide-react';
import Avatar from './Avatar';

const BAN_DURATIONS = [
  { label: '1 час', value: 60 * 60 * 1000 },
  { label: '1 день', value: 24 * 60 * 60 * 1000 },
  { label: '1 неделя', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Навсегда', value: 0 },
];

export default function AdminPanel() {
  const {
    setShowAdmin,
    siteSettings,
    updateSiteSettings,
    users,
    chats,
    messages,
    deleteUser,
    banUser,
    unbanUser,
    promoteToSiteAdmin,
    demoteFromSiteAdmin,
    promoteToModerator,
    demoteFromModerator,
    deleteChat,
    banUserInChat,
    unbanUserInChat,
    setChatMemberEditPermission,
    addUserTag,
    setUserTags,
    setShowTagManager,
    tagDefinitions,
  } = useStore();

  const [tab, setTab] = useState<'dashboard' | 'users' | 'chats' | 'settings' | 'appearance'>('dashboard');
  const [localSettings, setLocalSettings] = useState(siteSettings);
  const [saved, setSaved] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagEditUser, setTagEditUser] = useState<string | null>(null);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Статистика', mobileLabel: 'Стат', icon: LayoutGrid },
    { id: 'users', label: 'Пользователи', mobileLabel: 'Люди', icon: Users },
    { id: 'chats', label: 'Группы и каналы', mobileLabel: 'Чаты', icon: MessageCircle },
    { id: 'settings', label: 'Настройки', mobileLabel: 'Сайт', icon: SlidersHorizontal },
    { id: 'appearance', label: 'Внешний вид', mobileLabel: 'Стиль', icon: Sparkles },
  ] as const;

  const stats = useMemo(() => ({
    users: users.filter(u => u.id !== 'bot-telechat').length,
    online: users.filter(u => u.status === 'online').length,
    moderators: users.filter(u => u.isModerator).length,
    groupsChannels: chats.filter(c => c.type !== 'direct').length,
    messages: messages.length,
  }), [users, chats, messages]);

  const saveSettings = () => {
    updateSiteSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:flex">
      <div className="hidden md:flex w-64 bg-gray-900 border-r border-white/10 flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-bold">Админ-панель</h2>
          <p className="text-white/40 text-xs">Управление сайтом</p>
        </div>
        <div className="p-2 space-y-1 flex-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 ${tab === item.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/60 hover:bg-white/5'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setShowTagManager(true)}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-purple-300 hover:bg-purple-500/10"
          >
            Менеджер тегов
          </button>
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setShowAdmin(false)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-950 p-3 md:p-6 overflow-y-auto pb-24 md:pb-6">
        <div className="md:hidden sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-white/10 pb-3 mb-4 -mx-3 px-3 pt-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-sm font-semibold">Админ-панель</h2>
            <button onClick={() => setShowAdmin(false)} className="p-2 rounded-xl bg-white/10 text-white/80">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(item => {
              const Icon = item.icon;
              return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as typeof tab)}
                className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 ${tab === item.id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/60'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.mobileLabel}
              </button>
            )})}
            <button onClick={() => setShowTagManager(true)} className="px-3 py-2 rounded-xl text-xs bg-purple-500/15 text-purple-300 whitespace-nowrap flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Теги
            </button>
          </div>
        </div>

        {tab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Пользователи', value: stats.users, icon: Users },
              { label: 'Онлайн', value: stats.online, icon: CheckCircle },
              { label: 'Модераторы', value: stats.moderators, icon: Shield },
              { label: 'Группы/каналы', value: stats.groupsChannels, icon: MessageCircle },
              { label: 'Сообщения', value: stats.messages, icon: MessageCircle },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <item.icon className="w-5 h-5 text-indigo-300 mb-2" />
                <div className="text-white text-2xl font-bold">{item.value}</div>
                <div className="text-white/40 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            {users.filter(u => u.id !== 'bot-telechat').map(user => (
              <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" status={user.status} showStatus />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium flex items-center gap-2 flex-wrap">
                      {user.name}
                      {user.isAdmin && <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full">Админ</span>}
                      {user.isModerator && !user.isAdmin && <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full">Модератор</span>}
                    </div>
                    <div className="text-white/40 text-xs">@{user.username}</div>
                    {(user.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={getTagStyle(tag, tagDefinitions)}>{tag}</span>
                        ))}
                      </div>
                    )}
                    {tagEditUser === user.id && (
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {tagDefinitions.filter(t => !(user.tags || []).includes(t.name)).map(def => (
                            <button key={def.name} onClick={() => addUserTag(user.id, def.name)} className="text-[10px] px-1.5 py-0.5 rounded" style={getTagStyle(def.name, tagDefinitions)}>
                              + {def.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input value={newTag} onChange={e => setNewTag(e.target.value.toUpperCase())} className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white" placeholder="Новый тег" />
                          <button onClick={() => { if (newTag.trim()) { addUserTag(user.id, newTag.trim()); setNewTag(''); } }} className="px-2 py-1 bg-purple-500 text-white text-xs rounded">+</button>
                          <button onClick={() => setUserTags(user.id, [])} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">Очистить</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  <button onClick={() => setTagEditUser(tagEditUser === user.id ? null : user.id)} className="px-2 py-1 bg-purple-500/15 text-purple-300 text-xs rounded-lg flex items-center gap-1"><Tag className="w-3 h-3" /> Теги</button>
                  {user.isBanned ? (
                    <button onClick={() => unbanUser(user.id)} className="px-2 py-1 bg-green-500/15 text-green-300 text-xs rounded-lg">Разбанить</button>
                  ) : (
                    BAN_DURATIONS.map(d => (
                      <button key={d.label} onClick={() => banUser(user.id, d.value || undefined)} className="px-2 py-1 bg-red-500/15 text-red-300 text-xs rounded-lg flex items-center gap-1"><Clock className="w-3 h-3" /> Бан {d.label}</button>
                    ))
                  )}
                  {user.isAdmin ? (
                    <button onClick={() => demoteFromSiteAdmin(user.id)} className="px-2 py-1 bg-yellow-500/15 text-yellow-300 text-xs rounded-lg flex items-center gap-1"><ShieldOff className="w-3 h-3" /> Снять админа</button>
                  ) : (
                    <button onClick={() => promoteToSiteAdmin(user.id)} className="px-2 py-1 bg-yellow-500/15 text-yellow-300 text-xs rounded-lg flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Сделать админом</button>
                  )}
                  {user.isModerator ? (
                    <button onClick={() => demoteFromModerator(user.id)} className="px-2 py-1 bg-cyan-500/15 text-cyan-300 text-xs rounded-lg">Снять модератора</button>
                  ) : (
                    <button onClick={() => promoteToModerator(user.id)} className="px-2 py-1 bg-cyan-500/15 text-cyan-300 text-xs rounded-lg">Сделать модератором</button>
                  )}
                  {user.id !== 'admin-main' && (
                    <button onClick={() => deleteUser(user.id)} className="px-2 py-1 bg-red-500/15 text-red-300 text-xs rounded-lg flex items-center gap-1"><Trash2 className="w-3 h-3" /> Удалить</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'chats' && (
          <div className="space-y-3">
            {chats.filter(c => c.type !== 'direct').map(chat => {
              const activeBans = (chat.bannedMembers || []).filter(b => !b.expiresAt || b.expiresAt > Date.now());
              return (
                <div key={chat.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={chat.avatar} name={chat.name} size="md" type={chat.type === 'group' ? 'group' : 'channel'} />
                    <div className="flex-1">
                      <div className="text-white font-medium flex items-center gap-2">
                        {chat.type === 'group' ? <Users className="w-4 h-4 text-blue-300" /> : <Megaphone className="w-4 h-4 text-purple-300" />}
                        {chat.name}
                      </div>
                      <div className="text-white/40 text-xs">{chat.members.length} участников</div>
                      <div className="text-white/30 text-xs">Блоков в чате: {activeBans.length}</div>
                    </div>
                    <button onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)} className="px-2 py-1 text-xs rounded bg-white/10 text-white/70">
                      {expandedChat === chat.id ? 'Скрыть' : 'Управлять'}
                    </button>
                    <button onClick={() => deleteChat(chat.id)} className="p-1.5 text-red-300 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {expandedChat === chat.id && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2.5">
                        <div>
                          <div className="text-white text-sm">Разрешить участникам менять фото/название</div>
                          <div className="text-white/40 text-xs">Если выключено - только админы/модераторы</div>
                        </div>
                        <button
                          onClick={() => setChatMemberEditPermission(chat.id, !chat.allowMembersEditInfo)}
                          className={`px-3 py-1.5 text-xs rounded-lg ${chat.allowMembersEditInfo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                        >
                          {chat.allowMembersEditInfo ? 'Разрешено' : 'Запрещено'}
                        </button>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                        <div className="text-white/70 text-xs mb-2">Участники</div>
                        <div className="space-y-2">
                          {chat.members.map(memberId => {
                            const member = users.find(u => u.id === memberId);
                            if (!member) return null;
                            const banned = activeBans.find(b => b.userId === memberId);
                            return (
                              <div key={memberId} className="flex items-center justify-between gap-2">
                                <div className="text-sm text-white">{member.name} <span className="text-white/40">@{member.username}</span></div>
                                {banned ? (
                                  <button onClick={() => unbanUserInChat(chat.id, memberId)} className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-300">Разблокировать в чате</button>
                                ) : (
                                  <div className="flex gap-1">
                                    <button onClick={() => banUserInChat(chat.id, memberId, 24 * 60 * 60 * 1000)} className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300">Бан 1д</button>
                                    <button onClick={() => banUserInChat(chat.id, memberId)} className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300">Навсегда</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {activeBans.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                          <div className="text-white/70 text-xs mb-2">Заблокированные в чате</div>
                          <div className="space-y-1">
                            {activeBans.map((ban, i) => {
                              const member = users.find(u => u.id === ban.userId);
                              return (
                                <div key={i} className="text-xs text-white/50">
                                  {member?.name || ban.userId} {ban.expiresAt ? `до ${format(ban.expiresAt, 'dd.MM HH:mm', { locale: ru })}` : 'навсегда'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-xl space-y-3">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2"><Settings className="w-4 h-4" /> Настройки сайта</h2>
            <input value={localSettings.siteName} onChange={e => setLocalSettings({ ...localSettings, siteName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" placeholder="Название" />
            <input value={localSettings.welcomeMessage} onChange={e => setLocalSettings({ ...localSettings, welcomeMessage: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" placeholder="Приветствие" />
            <textarea value={localSettings.announcement} onChange={e => setLocalSettings({ ...localSettings, announcement: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" rows={3} placeholder="Объявление" />
            <button onClick={saveSettings} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm flex items-center gap-2"><Save className="w-4 h-4" /> {saved ? 'Сохранено' : 'Сохранить'}</button>
          </div>
        )}

        {tab === 'appearance' && (
          <div className="max-w-xl space-y-3">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2"><Palette className="w-4 h-4" /> Внешний вид</h2>
            <div className="flex gap-2 flex-wrap">
              {['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4', '#f59e0b'].map(color => (
                <button key={color} onClick={() => setLocalSettings({ ...localSettings, primaryColor: color })} className={`w-10 h-10 rounded-xl ${localSettings.primaryColor === color ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: color }} />
              ))}
            </div>
            <button onClick={saveSettings} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm">{saved ? 'Сохранено' : 'Сохранить цвет'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
