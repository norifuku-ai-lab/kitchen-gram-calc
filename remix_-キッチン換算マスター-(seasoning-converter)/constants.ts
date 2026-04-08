
import { Seasoning } from './types';

export const DEFAULT_SEASONINGS: Seasoning[] = [
  // 液体
  { id: '1', name: 'しょうゆ', searchNames: ['醤油', 'しょうゆ', 'ショウユ'], category: '液体', density: 1.2 },
  { id: '2', name: 'みりん', searchNames: ['みりん', 'ミリン', '味醂'], category: '液体', density: 1.2 },
  { id: '3', name: '料理酒', searchNames: ['酒', 'さけ', 'サケ', 'りょうりしゅ'], category: '液体', density: 1.0 },
  { id: '4', name: '酢', searchNames: ['す', 'ス'], category: '液体', density: 1.0 },
  { id: '5', name: 'オリーブオイル', searchNames: ['おりーぶおいる'], category: '液体', density: 0.9 },
  { id: '6', name: 'サラダ油', searchNames: ['さらだゆ', '油'], category: '液体', density: 0.9 },
  
  // 砂糖/塩系
  { id: '7', name: '上白糖', searchNames: ['砂糖', 'さとう', 'サトウ'], category: '砂糖/塩', density: 0.6, overrides: { tbsp: 9, tsp: 3, cup: 110 } },
  { id: '8', name: '塩', searchNames: ['しお', 'シオ'], category: '砂糖/塩', density: 1.2, overrides: { tbsp: 18, tsp: 6, cup: 240 } },
  
  // 粘性
  { id: '9', name: '味噌', searchNames: ['みそ', 'ミソ'], category: '粘性', density: 1.2, overrides: { tbsp: 18, tsp: 6 } },
  { id: '10', name: 'はちみつ', searchNames: ['ハチミツ', '蜂蜜'], category: '粘性', density: 1.4, overrides: { tbsp: 21, tsp: 7 } },
  { id: '11', name: 'マヨネーズ', searchNames: ['まよねーず'], category: '粘性', density: 0.9, overrides: { tbsp: 12, tsp: 4 } },
  { id: '12', name: 'ケチャップ', searchNames: ['けちゃっぷ'], category: '粘性', density: 1.1, overrides: { tbsp: 15, tsp: 5 } },
  { id: '13', name: 'オイスターソース', searchNames: ['おいすたー'], category: '粘性', density: 1.2, overrides: { tbsp: 18, tsp: 6 } },
  { id: '14', name: '甜麺醤', searchNames: ['てんめんじゃん'], category: '粘性', density: 1.2, overrides: { tbsp: 18, tsp: 6 } },
  { id: '15', name: '豆板醤', searchNames: ['とうばんじゃん'], category: '粘性', density: 1.2, overrides: { tbsp: 18, tsp: 6 } },

  // 粉末
  { id: '16', name: '鶏ガラスープの素(顆粒)', searchNames: ['とりがら', '鶏がら'], category: '粉末', density: 0.5, overrides: { tbsp: 8, tsp: 2.5 } },
  { id: '17', name: '和風だし(顆粒)', searchNames: ['わふうだし', '顆粒だし'], category: '粉末', density: 0.8, overrides: { tbsp: 12, tsp: 4 } },
  { id: '18', name: 'コンソメ(顆粒)', searchNames: ['こんそめ'], category: '粉末', density: 0.8, overrides: { tbsp: 12, tsp: 4 } },
  { id: '19', name: '片栗粉', searchNames: ['かたくりこ'], category: '粉末', density: 0.6, overrides: { tbsp: 9, tsp: 3 } },
  { id: '20', name: '小麦粉', searchNames: ['こむぎこ', '薄力粉'], category: '粉末', density: 0.6, overrides: { tbsp: 9, tsp: 3, cup: 110 } },
  { id: '21', name: 'ココア', searchNames: ['ここあ'], category: '粉末', density: 0.4, overrides: { tbsp: 6, tsp: 2 } },
  { id: '22', name: 'ドライイースト', searchNames: ['どらいいーすと', 'イースト'], category: '粉末', density: 0.6, overrides: { tbsp: 12, tsp: 4 } },
];
