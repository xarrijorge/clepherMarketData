import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dailyData from '../utilities/daily.json';
import weeklyData from '../utilities/weekly.json';
import monthlyData from '../utilities/monthly.json';

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

export const Exchange: React.FC = () => {
  const { region, exchange } = useParams();
  const [timeSeriesType, setTimeSeriesType] = useState<TimeSeriesType>('daily');
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      .slice(-30);

    return processedData;
  };
  
 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      let sampleData: any;
          
      switch (timeSeriesType) {
        case 'daily':
          sampleData = dailyData;
          break;
        case 'weekly':
          sampleData = weeklyData;
          break;
        case 'monthly':
          sampleData = monthlyData;
          break;
        default:
          sampleData = dailyData;
      }



      // Then process for chart
      const processed = processDataForChart(sampleData, timeSeriesType);

      setMarketData(sampleData as MarketResponse);
      setChartData(processed);
    } catch (err) {
      console.error('Error processing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [timeSeriesType]); 
 

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
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
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {marketData?.['Meta Data']['2. Symbol']}
            </h1>
            <p className="text-sm text-slate-500">
              Last Updated: {marketData?.['Meta Data']['3. Last Refreshed']}
            </p>
          </div>
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
                <Legend/>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  stroke="#2563eb"
                  dot={false}
                  name="Close Price"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="open"
                  stroke="#16a34a"
                  dot={false}
                  name="Open Price"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="high"
                  stroke="#9333ea"
                  dot={false}
                  name="High"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="low"
                  stroke="#dc2626"
                  dot={false}
                  name="Low"
                />
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