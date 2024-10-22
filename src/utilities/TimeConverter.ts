// src/utilities/TimeConverter.ts
import { DateTime } from 'luxon';

export interface MarketData {
  market_type: string;
  region: string;
  primary_exchanges: string;
  local_open: string;
  local_close: string;
  current_status: string;
  notes: string;
}

export interface ConvertedMarketData extends MarketData {
  userTime: string;
  isOpenNow: boolean;
}

// Market timezone mappings
const MARKET_TIMEZONES: Record<string, string> = {
  'Australia': 'Australia/Sydney',
  'Belgium': 'Europe/Brussels',
  'Brazil': 'America/Sao_Paulo',
  'Canada': 'America/Toronto',
  'Denmark': 'Europe/Copenhagen',
  'Finland': 'Europe/Helsinki',
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Hong Kong': 'Asia/Hong_Kong',
  'India': 'Asia/Kolkata',
  'Japan': 'Asia/Tokyo',
  'United Kingdom': 'Europe/London',
  'United States': 'America/New_York',
  'Global': 'UTC',
};

export const convertToUserTimezone = (market: MarketData): ConvertedMarketData => {
  try {
    const marketTimezone = MARKET_TIMEZONES[market.region] || 'UTC';
    const now = DateTime.now().setZone(marketTimezone);
    
    // Create market open time
    const marketOpen = now.set({
      hour: parseInt(market.local_open.split(':')[0]),
      minute: parseInt(market.local_open.split(':')[1]),
      second: 0,
      millisecond: 0
    });

    // Create market close time
    const marketClose = now.set({
      hour: parseInt(market.local_close.split(':')[0]),
      minute: parseInt(market.local_close.split(':')[1]),
      second: 0,
      millisecond: 0
    });

    // Convert to user's local time
    const localOpen = marketOpen.toLocal();
    const localClose = marketClose.toLocal();

    // Format times
    const userOpenTime = localOpen.toFormat('HH:mm');
    const userCloseTime = localClose.toFormat('HH:mm');

    // Special handling for 24-hour markets
    if (market.local_open === '00:00' && market.local_close === '23:59') {
      return {
        ...market,
        userTime: '24h',
        isOpenNow: true
      };
    }

    // Check if market is currently open
    const currentTime = DateTime.now().setZone(marketTimezone);
    let isOpenNow = false;

    if (marketClose < marketOpen) {
      // Market crosses midnight
      isOpenNow = currentTime >= marketOpen || currentTime <= marketClose;
    } else {
      // Normal trading hours
      isOpenNow = currentTime >= marketOpen && currentTime <= marketClose;
    }

    return {
      ...market,
      userTime: `${userOpenTime}-${userCloseTime}`,
      isOpenNow
    };

  } catch (error) {
    console.error('Error converting market times:', error);
    // Fallback to original times if conversion fails
    return {
      ...market,
      userTime: `${market.local_open}-${market.local_close}`,
      isOpenNow: market.current_status.toLowerCase() === 'open'
    };
  }
};