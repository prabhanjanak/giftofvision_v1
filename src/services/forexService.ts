// Daily Live USD / INR / GBP / EUR Forex Exchange Service (Powered by CurrencyLayer & Resilient Open Forex APIs)

export interface ForexRates {
 USD: number;
 INR: number;
 GBP: number;
 EUR: number;
 lastUpdated: string;
 isLive: boolean;
 provider:'CurrencyLayer API'|'Open Exchange API'|'Standard Benchmark';
}

const STORAGE_KEY ='gov_forex_rates';
const API_KEY_STORAGE ='gov_currencylayer_key';

export const getCurrencyLayerApiKey = (): string => {
 return localStorage.getItem(API_KEY_STORAGE) ||'';
};

export const setCurrencyLayerApiKey = (key: string): void => {
 localStorage.setItem(API_KEY_STORAGE, key.trim());
};

const DEFAULT_RATES: ForexRates = {
 USD: 1.0,
 INR: 83.50,
 GBP: 0.79,
 EUR: 0.92,
 lastUpdated: new Date().toISOString().slice(0, 10),
 isLive: false,
 provider:'Standard Benchmark'
};

export const fetchDailyForexRates = async (customApiKey?: string): Promise<ForexRates> => {
 const apiKey = (customApiKey !== undefined ? customApiKey : getCurrencyLayerApiKey()).trim();

 // 1. If CurrencyLayer API key is provided, query currencylayer.com
 if (apiKey) {
 try {
 // Use https when available, supports http fallback for free tier
 const url = `https://api.currencylayer.com/live?access_key=${apiKey}&currencies=INR,GBP,EUR&source=USD&format=1`;
 const res = await fetch(url);
 if (res.ok) {
 const data = await res.json();
 if (data && data.success && data.quotes) {
 const rates: ForexRates = {
 USD: 1.0,
 INR: parseFloat((data.quotes.USDINR || 83.50).toFixed(2)),
 GBP: parseFloat((data.quotes.USDGBP || 0.79).toFixed(4)),
 EUR: parseFloat((data.quotes.USDEUR || 0.92).toFixed(4)),
 lastUpdated: new Date().toISOString().slice(0, 10),
 isLive: true,
 provider:'CurrencyLayer API'
 };
 localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
 return rates;
 } else if (data.error) {
 console.warn('CurrencyLayer API notice:', data.error.info || data.error);
 }
 }
 } catch (e) {
 console.warn('CurrencyLayer fetch failed, trying fallback source', e);
 }
 }

 // 2. Query open.er-api.com fallback
 try {
 const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache:'default'});
 if (res.ok) {
 const data = await res.json();
 if (data && data.rates) {
 const rates: ForexRates = {
 USD: 1.0,
 INR: parseFloat((data.rates.INR || 83.50).toFixed(2)),
 GBP: parseFloat((data.rates.GBP || 0.79).toFixed(4)),
 EUR: parseFloat((data.rates.EUR || 0.92).toFixed(4)),
 lastUpdated: new Date().toISOString().slice(0, 10),
 isLive: true,
 provider:'Open Exchange API'
 };
 localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
 return rates;
 }
 }
 } catch (err) {
 console.info('Using benchmark baseline rate (1 USD = ₹83.50)', err);
 }

 return DEFAULT_RATES;
};

export const convertCurrency = (
 amount: number,
 from:'USD'|'INR'|'GBP'|'EUR',
 to:'USD'|'INR'|'GBP'|'EUR',
 rates: ForexRates = DEFAULT_RATES
): number => {
 if (from === to) return amount;
 const amountInUsd = from ==='USD'? amount : amount / (rates[from] || 1);
 const targetAmount = to ==='USD'? amountInUsd : amountInUsd * (rates[to] || 1);
 return parseFloat(targetAmount.toFixed(2));
};

export const calculateSurgeryEquivalent = (
 amount: number,
 currency:'USD'|'INR'|'GBP'|'EUR',
 rates: ForexRates = DEFAULT_RATES
): { fullSurgeries: number; remainderInr: number; remainderUsd: number; surgeryCostInr: number; surgeryCostUsd: number } => {
 const SURGERY_COST_INR = 3500;
 const SURGERY_COST_USD = 50;

 const totalInr = currency ==='INR'? amount : convertCurrency(amount, currency,'INR', rates);
 const fullSurgeries = Math.floor(totalInr / SURGERY_COST_INR);
 const remainderInr = Math.round(totalInr % SURGERY_COST_INR);
 const remainderUsd = convertCurrency(remainderInr,'INR','USD', rates);

 return {
 fullSurgeries,
 remainderInr,
 remainderUsd,
 surgeryCostInr: SURGERY_COST_INR,
 surgeryCostUsd: SURGERY_COST_USD
 };
};
