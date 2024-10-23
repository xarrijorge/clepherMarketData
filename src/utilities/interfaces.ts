// src/interfaces.ts
export type TimeSeriesType = 'daily' | 'weekly' | 'monthly';

export interface TimeSeriesData {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
}

export interface MarketResponse {
    'Meta Data': {
        '1. Information': string;
        '2. Symbol': string;
        '3. Last Refreshed': string;
        '4. Time Zone': string;
        '4. Output Size'?: string;
    };
    'Time Series (Daily)'?: Record<string, TimeSeriesData>;
    'Weekly Time Series'?: Record<string, TimeSeriesData>;
    'Monthly Time Series'?: Record<string, TimeSeriesData>;
}

export interface ChartData {
    date: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

export interface LineConfig {
    key: keyof Omit<ChartData, 'date'>;
    color: string;
    label: string;
}

export interface MarketChartProps {
    chartData: ChartData[];
    visibleLines: Set<string>;
    LINE_CONFIGS: LineConfig[];
}

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

export interface ApiResponse {
    endpoint: string;
    markets: MarketData[];
}