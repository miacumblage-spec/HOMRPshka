import { Users, Megaphone } from 'lucide-react';

interface AvatarProps {
  src?: string;
  avatarType?: 'image' | 'video';
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'user' | 'group' | 'channel';
  status?: 'online' | 'offline' | 'away' | 'busy' | null;
  showStatus?: boolean;
  className?: string;
}

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const sizes = {
  xs: { container: 'w-8 h-8', text: 'text-xs', icon: 'w-3.5 h-3.5', status: 'w-2.5 h-2.5 border', statusPos: '-bottom-0 -right-0' },
  sm: { container: 'w-9 h-9', text: 'text-xs', icon: 'w-4 h-4', status: 'w-3 h-3 border-2', statusPos: '-bottom-0.5 -right-0.5' },
  md: { container: 'w-10 h-10', text: 'text-sm', icon: 'w-5 h-5', status: 'w-3 h-3 border-2', statusPos: '-bottom-0.5 -right-0.5' },
  lg: { container: 'w-11 h-11', text: 'text-sm', icon: 'w-5 h-5', status: 'w-3.5 h-3.5 border-2', statusPos: '-bottom-0.5 -right-0.5' },
  xl: { container: 'w-24 h-24', text: 'text-3xl', icon: 'w-10 h-10', status: 'w-5 h-5 border-[3px]', statusPos: 'bottom-1 right-1' },
};

const gradients = {
  user: 'bg-gradient-to-br from-indigo-500 to-purple-500',
  group: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  channel: 'bg-gradient-to-br from-purple-500 to-pink-500',
};

export default function Avatar({ src, name, size = 'md', type = 'user', status, showStatus = false, className = '' }: AvatarProps) {
  const s = sizes[size];
  const isVideoAvatar = Boolean(
    src && (
      src.startsWith('data:video/') ||
      /\.(mp4|webm|ogg)(\?.*)?$/i.test(src)
    )
  );

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        isVideoAvatar ? (
          <video
            src={src}
            className={`${s.container} rounded-full object-cover`}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={src}
            alt={name}
            className={`${s.container} rounded-full object-cover`}
          />
        )
      ) : (
        <div className={`${s.container} rounded-full ${gradients[type]} flex items-center justify-center text-white font-bold ${s.text}`}>
          {type === 'channel' ? <Megaphone className={s.icon} /> :
           type === 'group' ? <Users className={s.icon} /> :
           name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      {showStatus && status && (
        <span className={`absolute ${s.statusPos} ${s.status} ${statusColors[status]} rounded-full border-gray-900`} />
      )}
    </div>
  );
}
