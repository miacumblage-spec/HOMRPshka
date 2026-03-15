import { useState } from 'react';
import { useStore } from '../store';
import { X, Plus, Trash2, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CreatePollModal() {
  const { activeChat, setShowCreatePoll, createPoll } = useStore();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multiple, setMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  if (!activeChat) return null;

  const addOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, val: string) => {
    setOptions(options.map((o, i) => i === idx ? val : o));
  };

  const handleCreate = () => {
    const validOpts = options.filter(o => o.trim());
    if (!question.trim() || validOpts.length < 2) return;
    createPoll(activeChat, question, validOpts, multiple, anonymous);
  };

  const validCount = options.filter(o => o.trim()).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[85vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">Создать опрос</h3>
          </div>
          <button onClick={() => setShowCreatePoll(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="text-white/50 text-xs font-medium mb-1 block">Вопрос</label>
            <input
              type="text"
              placeholder="Задайте вопрос..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium mb-2 block">Варианты ответа</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-white/20 text-xs w-5 text-center">{i + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Вариант ${i + 1}`}
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                onClick={addOption}
                className="mt-2 flex items-center gap-2 text-indigo-400 text-sm hover:text-indigo-300 transition"
              >
                <Plus className="w-4 h-4" /> Добавить вариант
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <div className="text-white text-sm">Множественный выбор</div>
                <div className="text-white/30 text-xs">Можно выбрать несколько вариантов</div>
              </div>
              <button onClick={() => setMultiple(!multiple)}>
                {multiple ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-white/30" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <div className="text-white text-sm">Анонимное голосование</div>
                <div className="text-white/30 text-xs">Голоса не будут видны</div>
              </div>
              <button onClick={() => setAnonymous(!anonymous)}>
                {anonymous ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-white/30" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!question.trim() || validCount < 2}
          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-4 h-4" /> Создать опрос
        </button>
      </div>
    </div>
  );
}
