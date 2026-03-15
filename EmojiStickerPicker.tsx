import { useState } from 'react';
import { X, Search } from 'lucide-react';

const emojiCategories = [
  {
    name: '😀 Лица',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖']
  },
  {
    name: '👋 Жесты',
    emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄']
  },
  {
    name: '❤️ Сердца',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','🫶','😍','🥰','😘','💋','💑','💏']
  },
  {
    name: '🎉 Объекты',
    emojis: ['🎉','🎊','🎈','🎁','🎀','🎄','🎃','🎆','🎇','✨','🎐','🎑','🏮','🎎','🎏','🎋','🎍','💐','🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔']
  },
  {
    name: '🐱 Животные',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🫎','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊']
  },
  {
    name: '⚽ Спорт',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🥅','⛳','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🎗️']
  },
  {
    name: '🚗 Транспорт',
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛺','🚈','🚝','🚄','🚅','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢']
  },
  {
    name: '💡 Символы',
    emojis: ['💡','🔥','⭐','🌟','✨','⚡','💥','💫','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','❄️','☃️','⛄','🌊','💧','💦','☔','🔔','🎵','🎶','🎼','🎤','🎧','📱','💻','⌨️','🖥️','📷','📹','📺','🔑','🗝️','🔒','🔓','💰','💎','⏰','⏳','🧲','🔋','💊','🧬']
  },
  {
    name: '🏁 Флаги',
    emojis: ['🏳️','🏴','🏁','🚩','🏳️‍🌈','🏳️‍⚧️','🇺🇦','🇷🇺','🇺🇸','🇬🇧','🇩🇪','🇫🇷','🇮🇹','🇪🇸','🇯🇵','🇰🇷','🇨🇳','🇧🇷','🇮🇳','🇨🇦','🇦🇺','🇲🇽','🇹🇷','🇵🇱','🇳🇱','🇧🇪','🇸🇪','🇳🇴','🇫🇮','🇩🇰','🇨🇿','🇦🇹','🇨🇭','🇵🇹','🇬🇷','🇮🇪']
  }
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);

  const filteredCategories = search
    ? emojiCategories.map(cat => ({ ...cat, emojis: cat.emojis.filter(() => true) })).filter(cat => cat.emojis.length > 0)
    : emojiCategories;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-50">
      <div className="flex items-center gap-2 p-3 border-b border-white/10">
        <Search className="w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск эмодзи..."
          className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none"
          autoFocus
        />
        <button onClick={onClose} className="p-1 text-white/30 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-white/5 overflow-x-auto scrollbar-hide">
        {emojiCategories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-sm transition ${
              activeCategory === i ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {cat.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Emojis grid */}
      <div className="h-52 overflow-y-auto p-2">
        {(search ? filteredCategories : [emojiCategories[activeCategory]]).map((cat, ci) => (
          <div key={ci}>
            {search && <div className="text-white/30 text-xs px-1 mb-1">{cat.name}</div>}
            <div className="grid grid-cols-8 gap-0.5">
              {cat.emojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
