import { useState, useEffect, useCallback } from 'react';
import { convertToUserTimezone } from '../utilities/TimeConverter';
import { ApiResponse, type ConvertedMarketData } from '../utilities/interfaces';
import axios from 'axios';


export const useMarketsData = () => {
    const [markets, setMarkets] = useState<ConvertedMarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
    const URL = `https://www.alphavantage.co/query?function=MARKET_STATUS&apikey=${API_KEY}`;

    

    const getMarketData = useCallback(async () => {
        try {
            setLoading(true);
            const fetchMarketStatus = async (): Promise<ApiResponse> => {
                try {
                    const response = await axios.get<ApiResponse>(URL);

                    return response.data;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        throw new Error(error.response?.data?.message || 'Failed to fetch market data');
                    }
                    throw new Error('An unexpected error occurred');
                }
            };
            const response = await fetchMarketStatus();

            const convertedMarkets = response.markets.map(market =>
                convertToUserTimezone(market)
            );

            setMarkets(convertedMarkets);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        } finally {
            setLoading(false);
        }
    },[URL]);


    useEffect(() => {
        getMarketData();
        
        const pollInterval = setInterval(getMarketData, 5 * 60 * 1000);
    
        return () => clearInterval(pollInterval);
      }, [getMarketData]);
    
      return { markets, loading, error, refreshData: getMarketData }; 
}