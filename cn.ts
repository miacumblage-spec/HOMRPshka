import { useStore } from './store';
import type { TagDefinition } from './types';

export function getTagStyle(tag: string, defs: TagDefinition[]): React.CSSProperties {
  const def = defs.find(d => d.name === tag);
  if (def) {
    return {
      background: `linear-gradient(to right, ${def.color1}, ${def.color2})`,
      color: def.textColor === 'black' ? '#000' : '#fff',
    };
  }
  return {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  };
}

export function useTagDefs() {
  return useStore(s => s.tagDefinitions);
}
