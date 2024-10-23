import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    '4. Output Size'?: string;
  };
  'Time Series (Daily)'?: Record<string, TimeSeriesData>;
  'Weekly Time Series'?: Record<string, TimeSeriesData>;
  'Monthly Time Series'?: Record<string, TimeSeriesData>;
}

interface ChartData {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface LineConfig {
  key: keyof Omit<ChartData, 'date'>;
  color: string;
  label: string;
}

const LINE_CONFIGS: LineConfig[] = [
  { key: 'close', color: '#2563eb', label: 'Close Price' },
  { key: 'open', color: '#16a34a', label: 'Open Price' },
  { key: 'high', color: '#9333ea', label: 'High' },
  { key: 'low', color: '#dc2626', label: 'Low' }
];

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';

export const Exchange: React.FC = () => {
  const [searchParams] = useSearchParams();
  const symbols = searchParams.get('symbols')?.split(',') || [];
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0] || '');
  
  const [timeSeriesType, setTimeSeriesType] = useState<TimeSeriesType>('daily');
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set(LINE_CONFIGS.map(config => config.key))
  );

  const toggleLine = (key: string) => {
    setVisibleLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getTimeSeriesKey = (type: TimeSeriesType): string => {
    switch (type) {
      case 'daily':
        return 'Time Series (Daily)';
      case 'weekly':
        return 'Weekly Time Series';
      case 'monthly':
        return 'Monthly Time Series';
      default:
        return 'Time Series (Daily)';
    }
  };

  const getFunctionName = (type: TimeSeriesType): string => {
    switch (type) {
      case 'daily':
        return 'TIME_SERIES_DAILY';
      case 'weekly':
        return 'TIME_SERIES_WEEKLY';
      case 'monthly':
        return 'TIME_SERIES_MONTHLY';
      default:
        return 'TIME_SERIES_DAILY';
    }
  };

  const processDataForChart = (data: any, type: TimeSeriesType): ChartData[] => {
    const timeSeriesKey = getTimeSeriesKey(type);
    const timeSeries = data[timeSeriesKey];

    if (!timeSeries) {
      console.error('No time series data found for key:', timeSeriesKey);
      return [];
    }

    const processedData = Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        close: parseFloat(values['4. close']),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        volume: parseInt(values['5. volume'], 10)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-50);

    return processedData;
  };

  const renderTitle = (marketData: MarketResponse | null) => {
    const symbol = marketData?.['Meta Data']?.['2. Symbol'] || selectedSymbol;
    const lastRefreshed = marketData?.['Meta Data']?.['3. Last Refreshed'] || 'N/A';
  
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {symbol}
        </h1>
        <p className="text-sm text-slate-500">
          Last Updated: {lastRefreshed}
        </p>
      </div>
    );
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!selectedSymbol) return;
      
      try {
        setLoading(true);
        setError(null);

        const functionName = getFunctionName(timeSeriesType);
        const outputSize = timeSeriesType === 'daily' ? '&outputsize=full' : '';
        const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${selectedSymbol}${outputSize}&apikey=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data['Error Message']) {
          throw new Error(data['Error Message']);
        }

        // Check if we received valid data
        if (!data['Meta Data']) {
          throw new Error('Invalid data received from API');
        }

        const processed = processDataForChart(data, timeSeriesType);
        if (processed.length === 0) {
          throw new Error('No data available for this time period');
        }

        setMarketData(data as MarketResponse);
        setChartData(processed);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setMarketData(null);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [timeSeriesType, selectedSymbol]);

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p>Getting Data ...</p>
    </div>;
  } 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Markets
        </Link>
        <p className="text-2xl font-thin text-slate-900">Data truncated to first 50 entries</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            {renderTitle(marketData)}
            <div className="flex gap-4 items-center">
              {symbols.length > 1 && (
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="px-3 py-2 rounded-md text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {symbols.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              )}
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
          </div>

          <div className="flex flex-wrap gap-2">
            {LINE_CONFIGS.map(config => (
              <button
                key={config.key}
                onClick={() => toggleLine(config.key)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                  ${visibleLines.has(config.key)
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-slate-100 text-slate-400'}
                  hover:bg-slate-300 transition-colors
                `}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  type="category"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value.toFixed(2)}`, '']}
                />
                <Legend />
                {LINE_CONFIGS.map(config => (
                  visibleLines.has(config.key) && (
                    <Line
                      key={config.key}
                      yAxisId="left"
                      type="monotone"
                      dataKey={config.key}
                      stroke={config.color}
                      dot={false}
                      name={config.label}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500">No data available for this time period</p>
          </div>
        )}
      </div>
    </div>
  );
};