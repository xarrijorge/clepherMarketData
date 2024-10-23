// src/pages/Exchange.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import axios from 'axios';
import { MarketResponse, TimeSeriesType, ChartData, LineConfig } from '../utilities/interfaces';
import { MarketChart } from '../components/MarketChart';

const LINE_CONFIGS: LineConfig[] = [
  { key: 'close', color: '#2563eb', label: 'Close Price' },
  { key: 'open', color: '#16a34a', label: 'Open Price' },
  { key: 'high', color: '#9333ea', label: 'High' },
  { key: 'low', color: '#dc2626', label: 'Low' }
];

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

export const Exchange: React.FC = () => {
  const [searchParams] = useSearchParams();
  const symbols = searchParams.get('symbols')?.split(',') || [];
  const [selectedSymbol, ] = useState(symbols[0] || '');
  
  const [timeSeriesType, ] = useState<TimeSeriesType>('daily');
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

    const fetchMarketData = async () => {
      if (!selectedSymbol) return;

      try {
        setLoading(true);
        setError(null);

        const functionName = getFunctionName(timeSeriesType);
        const outputSize = timeSeriesType === 'daily' ? '&outputsize=full' : '';
        const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${selectedSymbol}${outputSize}&apikey=${API_KEY}`;

        const response = await axios.get(url);
        const data = await response.data;

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
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedSymbol, timeSeriesType]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div>
      {renderTitle(marketData)}
      <div className="chart-controls">
        {LINE_CONFIGS.map(config => (
          <label key={config.key}>
            <input
              type="checkbox"
              checked={visibleLines.has(config.key)}
              onChange={() => toggleLine(config.key)}
            />
            {config.label}
          </label>
        ))}
      </div>

      <MarketChart
        chartData={chartData}
        visibleLines={visibleLines}
        LINE_CONFIGS={LINE_CONFIGS}
      />
    </div>
  );
};