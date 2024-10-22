import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type TimeSeriesType = 'daily' | 'weekly' | 'monthly';

interface TimeSeriesData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

interface MarketResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
  'Time Series (Daily)': Record<string, TimeSeriesData>;
  'Weekly Time Series': Record<string, TimeSeriesData>;
  'Monthly Time Series': Record<string, TimeSeriesData>;
}

export const Exchange: React.FC = () => {
  const { region, exchange } = useParams();
  const [timeSeriesType, setTimeSeriesType] = useState<TimeSeriesType>('daily');
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSymbolForExchange = (region: string, exchange: string) => {
    // Map sample symbols based on exchange
    const symbolMap: Record<string, string> = {
      'lon': 'TSCO.LON',
      'trt': 'SHOP.TRT',
      'trv': 'GPV.TRV',
      'dex': 'MBG.DEX',
      'bse': 'RELIANCE.BSE',
      'shh': '600104.SHH',
      'shz': '000002.SHZ',
    };
    return symbolMap[exchange.toLowerCase()] || 'IBM';
  };

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const symbol = getSymbolForExchange(region!, exchange!);
      const response = await axios.get<MarketResponse>(
        `https://www.alphavantage.co/query`, {
          params: {
            function: `TIME_SERIES_${timeSeriesType.toUpperCase()}`,
            symbol,
            apikey:process.env.REACT_APP_ALPHA_VANTAGE_API_KEY,
            outputsize: 'full'
          }
        }
      );
      setMarketData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [region, exchange, timeSeriesType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {exchange?.toUpperCase()} Market Data
        </h1>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as TimeSeriesType[]).map((type) => (
            <button
              key={type}
              onClick={() => setTimeSeriesType(type)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium 
                ${timeSeriesType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">
          {error}
        </div>
      ) : marketData && (
        <div className="bg-white rounded-lg shadow">
          {/* Add your data visualization here */}
          <pre className="p-4 overflow-auto">
            {JSON.stringify(marketData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};