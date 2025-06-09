/**
 * Normalizes ITA defense index data from various API response shapes
 * Handles legacy formats and ensures type safety
 */

export type ITAPrice =
  | number
  | string
  | { price: number; change: number }
  | { value: number; change: number; changePercent: number }
  | { ITA: { price: number; change: number } }; // legacy wrapper

export interface NormalizedITA {
  price: number;
  change: number;
}

export function normaliseITA(value: ITAPrice): NormalizedITA | null {
  // Handle numeric values
  if (typeof value === 'number') {
    return { price: value, change: 0 };
  }

  // Handle string values
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return { price: Number(value), change: 0 };
  }

  // Handle object values
  if (typeof value === 'object' && value !== null) {
    // Current API format: { value, change, changePercent }
    if ('value' in value && typeof (value as any).value === 'number') {
      const data = value as any;
      return {
        price: data.value,
        change: data.changePercent || data.change || 0,
      };
    }

    // Alternative format: { price, change }
    if ('price' in value && typeof (value as any).price === 'number') {
      const data = value as any;
      return {
        price: data.price,
        change: data.changePercent || data.change || 0,
      };
    }

    // Legacy wrapper format: { ITA: { price, change } }
    if ('ITA' in value && typeof (value as any).ITA === 'object') {
      const itaData = (value as any).ITA;
      if (itaData && typeof itaData.price === 'number') {
        return {
          price: itaData.price,
          change: itaData.changePercent || itaData.change || 0,
        };
      }
    }
  }

  console.error('⚠️ Unrecognised ITA payload structure:', JSON.stringify(value, null, 2));
  return null; // unrecognised shape
}