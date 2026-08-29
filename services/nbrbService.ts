// Powered by OnSpace.AI
// National Bank of Republic of Belarus API
// https://www.nbrb.by/api/exrates

export interface Rate {
  Cur_ID: number;
  Date: string;
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_Name: string;
  Cur_OfficialRate: number;
  Cur_Name_Eng?: string;
}

const BASE = 'https://www.nbrb.by/api/exrates';

export async function fetchRates(): Promise<Rate[]> {
  const res = await fetch(`${BASE}/rates?periodicity=0`);
  if (!res.ok) throw new Error('Ошибка загрузки курсов');
  const data: Rate[] = await res.json();
  return data;
}

export async function fetchRateByCode(code: string): Promise<Rate> {
  const res = await fetch(`${BASE}/rates/${code}?parammode=2`);
  if (!res.ok) throw new Error(`Ошибка загрузки курса ${code}`);
  return res.json();
}

// Returns rate history for last N days
export async function fetchRateHistory(curId: number, days: number = 30): Promise<Rate[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const res = await fetch(
    `${BASE}/rates/dynamics/${curId}?startDate=${fmt(start)}&endDate=${fmt(end)}`
  );
  if (!res.ok) throw new Error('Ошибка загрузки истории');
  return res.json();
}

export const CURRENCY_META: Record<string, { flag: string; nameRu: string }> = {
  USD: { flag: '🇺🇸', nameRu: 'Доллар США' },
  EUR: { flag: '🇪🇺', nameRu: 'Евро' },
  RUB: { flag: '🇷🇺', nameRu: 'Российский рубль' },
  CNY: { flag: '🇨🇳', nameRu: 'Китайский юань' },
  GBP: { flag: '🇬🇧', nameRu: 'Фунт стерлингов' },
  CHF: { flag: '🇨🇭', nameRu: 'Швейцарский франк' },
  JPY: { flag: '🇯🇵', nameRu: 'Японская иена' },
  PLN: { flag: '🇵🇱', nameRu: 'Польский злотый' },
  UAH: { flag: '🇺🇦', nameRu: 'Украинская гривна' },
  CZK: { flag: '🇨🇿', nameRu: 'Чешская крона' },
  SEK: { flag: '🇸🇪', nameRu: 'Шведская крона' },
  NOK: { flag: '🇳🇴', nameRu: 'Норвежская крона' },
  DKK: { flag: '🇩🇰', nameRu: 'Датская крона' },
  KZT: { flag: '🇰🇿', nameRu: 'Казахстанский тенге' },
  TRY: { flag: '🇹🇷', nameRu: 'Турецкая лира' },
  AMD: { flag: '🇦🇲', nameRu: 'Армянский драм' },
  AZN: { flag: '🇦🇿', nameRu: 'Азербайджанский манат' },
  GEL: { flag: '🇬🇪', nameRu: 'Грузинский лари' },
  MDL: { flag: '🇲🇩', nameRu: 'Молдавский лей' },
  UZS: { flag: '🇺🇿', nameRu: 'Узбекский сум' },
  CAD: { flag: '🇨🇦', nameRu: 'Канадский доллар' },
  AUD: { flag: '🇦🇺', nameRu: 'Австралийский доллар' },
  SGD: { flag: '🇸🇬', nameRu: 'Сингапурский доллар' },
  AED: { flag: '🇦🇪', nameRu: 'Дирхам ОАЭ' },
};
