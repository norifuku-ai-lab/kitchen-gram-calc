
export type Category = '液体' | '粘性' | '粉末' | '砂糖/塩' | 'その他';

export interface Seasoning {
  id: string;
  name: string;
  searchNames: string[]; // For fuzzy search (hiragana, katakana, etc.)
  category: Category;
  density: number; // g per 1ml (Standard fallback)
  overrides?: {
    tbsp?: number; // g per 15ml
    tsp?: number;  // g per 5ml
    cup?: number;  // g per 200ml
  };
  note?: string;
  isCustom?: boolean;
}

export interface HistoryItem {
  id: string;
  seasoningId: string;
  seasoningName: string;
  unit: string;
  amount: number;
  amountText: string;
  resultG: number;
  resultMl: number;
  timestamp: number;
}

export type UnitType = 'tbsp' | 'tsp' | 'cup';

export const UNIT_ML: Record<UnitType, number> = {
  tbsp: 15,
  tsp: 5,
  cup: 200
};

export const UNIT_LABELS: Record<UnitType, string> = {
  tbsp: '大さじ',
  tsp: '小さじ',
  cup: 'カップ'
};
