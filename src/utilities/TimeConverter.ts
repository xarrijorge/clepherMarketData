// Types matching the API response
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
    userTime: string;        // Added field for user's local time
    isOpenNow: boolean;      // Calculated current status
  }
  
  // Main conversion function
  export const convertToUserTimezone = (market: MarketData): ConvertedMarketData => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date().toISOString().split('T')[0];
    
    // Create Date objects for market times
    const openTime = new Date(`${today}T${market.local_open}:00`);
    const closeTime = new Date(`${today}T${market.local_close}:00`);
    
    // Convert to user's timezone
    const userOpenTime = openTime.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const userCloseTime = closeTime.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  
    const now = new Date();
    const isOpenNow = now >= openTime && now <= closeTime;
  
    return {
      ...market,
      userTime: `${userOpenTime}-${userCloseTime}`,
      isOpenNow
    };
  };