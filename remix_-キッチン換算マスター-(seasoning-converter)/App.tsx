
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  History, 
  Star, 
  PlusCircle, 
  Settings, 
  Info, 
  Trash2, 
  Download, 
  Upload, 
  ArrowRightLeft,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  Seasoning, 
  HistoryItem, 
  Category, 
  UnitType, 
  UNIT_ML, 
  UNIT_LABELS 
} from './types';
import { DEFAULT_SEASONINGS } from './constants';

const LS_KEY_CUSTOM = 'seasoning_custom';
const LS_KEY_HISTORY = 'seasoning_history';
const LS_KEY_FAVORITES = 'seasoning_favorites';

const App: React.FC = () => {
  // State
  const [seasonings, setSeasonings] = useState<Seasoning[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSeasoning, setSelectedSeasoning] = useState<Seasoning | null>(null);
  const [amount, setAmount] = useState<string>('1');
  const [unit, setUnit] = useState<UnitType>('tbsp');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [view, setView] = useState<'main' | 'history' | 'add' | 'settings'>('main');
  const [showSeasoningSelect, setShowSeasoningSelect] = useState(false);

  // Initialize data
  useEffect(() => {
    const savedCustom = localStorage.getItem(LS_KEY_CUSTOM);
    const customItems: Seasoning[] = savedCustom ? JSON.parse(savedCustom) : [];
    setSeasonings([...DEFAULT_SEASONINGS, ...customItems]);

    const savedHistory = localStorage.getItem(LS_KEY_HISTORY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedFavorites = localStorage.getItem(LS_KEY_FAVORITES);
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Save to LS
  useEffect(() => {
    localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(history.slice(0, 10)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  // Conversion Logic
  const parseFraction = (val: string): number => {
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 2) {
        return parseFloat(parts[0]) / parseFloat(parts[1]);
      }
    }
    return parseFloat(val) || 0;
  };

  const calculateConversion = useCallback(() => {
    if (!selectedSeasoning) return null;

    const numAmount = parseFraction(amount);
    const ml = numAmount * UNIT_ML[unit];
    let grams = 0;

    // Check for specific unit overrides
    const override = selectedSeasoning.overrides?.[unit];
    if (override !== undefined) {
      // If the override exists, it's g per the UNIT_ML[unit]. 
      // e.g., sugar tbsp override is 9g. If user enters 2 tbsp, it's 2 * 9 = 18g.
      grams = numAmount * override;
    } else {
      grams = ml * selectedSeasoning.density;
    }

    return {
      grams: parseFloat(grams.toFixed(1)),
      ml: parseFloat(ml.toFixed(1))
    };
  }, [selectedSeasoning, amount, unit]);

  const conversionResult = useMemo(() => calculateConversion(), [calculateConversion]);

  const addToHistory = () => {
    if (!selectedSeasoning || !conversionResult) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      seasoningId: selectedSeasoning.id,
      seasoningName: selectedSeasoning.name,
      unit: UNIT_LABELS[unit],
      amount: parseFraction(amount),
      amountText: amount,
      resultG: conversionResult.grams,
      resultMl: conversionResult.ml,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev.filter(i => i.seasoningId !== newItem.seasoningId || i.amountText !== newItem.amountText)].slice(0, 10));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Search results
  const filteredSeasonings = seasonings.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || 
           s.searchNames.some(sn => sn.toLowerCase().includes(q)) ||
           s.category.includes(q);
  });

  const favoriteSeasonings = seasonings.filter(s => favorites.includes(s.id));

  const exportData = () => {
    const customOnly = seasonings.filter(s => s.isCustom);
    const blob = new Blob([JSON.stringify(customOnly, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_seasonings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const newCustom = [...seasonings.filter(s => s.isCustom), ...imported];
        // simple dedup by name
        const unique = Array.from(new Map(newCustom.map(item => [item.name, item])).values());
        setSeasonings([...DEFAULT_SEASONINGS, ...unique]);
        localStorage.setItem(LS_KEY_CUSTOM, JSON.stringify(unique));
        alert('データをインポートしました');
      } catch (err) {
        alert('無効なJSONファイルです');
      }
    };
    reader.readAsText(file);
  };

  const handleSeasoningSelect = (s: Seasoning) => {
    setSelectedSeasoning(s);
    setSearch('');
    setShowSeasoningSelect(false);
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl flex flex-col relative">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6" />
            キッチン換算
          </h1>
          <div className="flex gap-4">
            <button onClick={() => setView('main')} className={view === 'main' ? 'text-white' : 'text-orange-200'}>
              <Search className="w-6 h-6" />
            </button>
            <button onClick={() => setView('history')} className={view === 'history' ? 'text-white' : 'text-orange-200'}>
              <History className="w-6 h-6" />
            </button>
            <button onClick={() => setView('settings')} className={view === 'settings' ? 'text-white' : 'text-orange-200'}>
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        
        {view === 'main' && (
          <div className="space-y-6">
            {/* Search and Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500">調味料を選ぶ</label>
              <div className="relative">
                <button 
                  onClick={() => setShowSeasoningSelect(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <span className="font-medium text-lg">
                    {selectedSeasoning ? selectedSeasoning.name : "調味料を検索..."}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Selection Modal */}
            {showSeasoningSelect && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">調味料リスト</h2>
                    <button onClick={() => setShowSeasoningSelect(false)}><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-4 bg-slate-50 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="名前、かな、カテゴリで検索"
                        className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredSeasonings.length > 0 ? (
                      <div className="divide-y">
                        {filteredSeasonings.map(s => (
                          <div key={s.id} className="flex items-center">
                             <button 
                                onClick={() => handleSeasoningSelect(s)}
                                className="flex-1 text-left p-4 hover:bg-slate-50 flex items-center gap-3"
                              >
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.category === '液体' ? 'bg-blue-100 text-blue-700' :
                                  s.category === '粘性' ? 'bg-orange-100 text-orange-700' :
                                  s.category === '粉末' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {s.category}
                                </span>
                                <span className="font-medium">{s.name}</span>
                              </button>
                              <button 
                                onClick={() => toggleFavorite(s.id)}
                                className="p-4 pr-6 text-slate-300 hover:text-yellow-400"
                              >
                                <Star className={`w-5 h-5 ${favorites.includes(s.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center text-slate-400">見つかりません</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Amount and Unit Input */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500">分量</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-center text-2xl font-bold p-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500">単位</label>
                <select 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="w-full text-center text-lg font-medium p-3.5 bg-slate-100 rounded-xl outline-none"
                >
                  {Object.entries(UNIT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shortcut Buttons */}
            <div className="flex flex-wrap gap-2">
              {['1/4', '1/3', '1/2', '1', '2', '3'].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border ${amount === val ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Results Display */}
            {selectedSeasoning && conversionResult ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-orange-900 font-bold text-lg">{selectedSeasoning.name}</h3>
                    <p className="text-orange-600 text-sm">{amount} {UNIT_LABELS[unit]}</p>
                  </div>
                  <button 
                    onClick={addToHistory}
                    className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    履歴に追加
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <span className="text-3xl font-black text-slate-800">{conversionResult.grams}</span>
                    <span className="text-slate-500 font-bold ml-1">g</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <span className="text-xl font-bold text-slate-400">{conversionResult.ml}</span>
                    <span className="text-slate-400 font-bold ml-1">ml</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 items-start text-[11px] text-slate-500 bg-white/50 p-3 rounded-lg">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    ※メーカー、湿度、量り方により数グラムの誤差が生じます。
                    {selectedSeasoning.note && <span className="block mt-1 text-orange-700 font-semibold">{selectedSeasoning.note}</span>}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>調味料を選択して換算</p>
              </div>
            )}

            {/* Favorites Bar */}
            {favoriteSeasonings.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  お気に入り
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {favoriteSeasonings.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleSeasoningSelect(s)}
                      className="shrink-0 px-4 py-2 bg-slate-50 border rounded-full text-sm font-medium hover:border-orange-500 transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">変換履歴</h2>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 font-bold">すべて消去</button>
            </div>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      const s = seasonings.find(x => x.id === item.seasoningId);
                      if (s) {
                        setSelectedSeasoning(s);
                        setAmount(item.amountText);
                        setView('main');
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{item.seasoningName}</p>
                      <p className="text-xs text-slate-400">{item.amountText} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-orange-600">{item.resultG}g</p>
                      <p className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">履歴がありません</div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">設定と管理</h2>
            
            <section className="space-y-4">
              <h3 className="font-bold text-slate-600 border-b pb-2 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-500" />
                調味料を追加
              </h3>
              <AddSeasoningForm onAdd={(s) => {
                const updated = [...seasonings, s];
                setSeasonings(updated);
                localStorage.setItem(LS_KEY_CUSTOM, JSON.stringify(updated.filter(x => x.isCustom)));
                alert('追加しました');
              }} />
            </section>

            <section className="space-y-4">
              <h3 className="font-bold text-slate-600 border-b pb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                データ管理
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={exportData}
                  className="flex flex-col items-center justify-center p-4 border-2 border-slate-100 rounded-xl hover:bg-slate-50"
                >
                  <Download className="w-6 h-6 mb-1 text-slate-400" />
                  <span className="text-xs font-bold">エクスポート</span>
                </button>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-6 h-6 mb-1 text-slate-400" />
                  <span className="text-xs font-bold">インポート</span>
                  <input type="file" className="hidden" accept=".json" onChange={importData} />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-bold text-slate-600 border-b pb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                カスタム調味料の削除
              </h3>
              <div className="space-y-2">
                {seasonings.filter(s => s.isCustom).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium">{s.name}</span>
                    <button 
                      onClick={() => {
                        if(confirm(`${s.name}を削除しますか？`)) {
                          const updated = seasonings.filter(x => x.id !== s.id);
                          setSeasonings(updated);
                          localStorage.setItem(LS_KEY_CUSTOM, JSON.stringify(updated.filter(x => x.isCustom)));
                        }
                      }}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {seasonings.filter(s => s.isCustom).length === 0 && <p className="text-sm text-slate-400 text-center">カスタムデータはありません</p>}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Persistent Note / Disclaimer */}
      <footer className="bg-slate-100 p-3 text-[10px] text-slate-400 text-center border-t">
        すりきり1杯を目安としています。分量や詰め込み方で差が出ます。
      </footer>
    </div>
  );
};

interface AddSeasoningFormProps {
  onAdd: (s: Seasoning) => void;
}

const AddSeasoningForm: React.FC<AddSeasoningFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('その他');
  const [density, setDensity] = useState('1.0');
  const [tbsp, setTbsp] = useState('');
  const [tsp, setTsp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newSeasoning: Seasoning = {
      id: 'custom_' + Date.now(),
      name,
      searchNames: [name],
      category,
      density: parseFloat(density) || 1.0,
      isCustom: true,
      overrides: (tbsp || tsp) ? {
        ...(tbsp ? { tbsp: parseFloat(tbsp) } : {}),
        ...(tsp ? { tsp: parseFloat(tsp) } : {}),
      } : undefined
    };

    onAdd(newSeasoning);
    setName('');
    setDensity('1.0');
    setTbsp('');
    setTsp('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500">調味料名</label>
        <input 
          required
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full p-2 rounded border focus:ring-orange-500 outline-none"
          placeholder="例：こだわりソース"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">カテゴリ</label>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full p-2 rounded border"
          >
            <option>液体</option>
            <option>粘性</option>
            <option>粉末</option>
            <option>砂糖/塩</option>
            <option>その他</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">比重 (g/ml)</label>
          <input 
            type="number" 
            step="0.1" 
            value={density} 
            onChange={e => setDensity(e.target.value)} 
            className="w-full p-2 rounded border"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">大さじ(g) 例外</label>
          <input 
            type="number" 
            step="0.1" 
            value={tbsp} 
            onChange={e => setTbsp(e.target.value)} 
            className="w-full p-2 rounded border"
            placeholder="標準は比重×15"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">小さじ(g) 例外</label>
          <input 
            type="number" 
            step="0.1" 
            value={tsp} 
            onChange={e => setTsp(e.target.value)} 
            className="w-full p-2 rounded border"
            placeholder="標準は比重×5"
          />
        </div>
      </div>
      <button 
        type="submit"
        className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl shadow-md active:bg-orange-600 transition-colors"
      >
        追加する
      </button>
    </form>
  );
};

export default App;
