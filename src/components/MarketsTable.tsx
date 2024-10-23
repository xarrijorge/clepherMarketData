// src/components/MarketTable.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ConvertedMarketData } from '../utilities/TimeConverter';
import { MARKET_SYMBOLS } from '../utilities/marketSymbols';

type SortKey = keyof ConvertedMarketData;
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  order: SortOrder;
}

interface MarketTableProps {
  markets: ConvertedMarketData[];
}

const ROWS_PER_PAGE = 10;

export const MarketTable: React.FC<MarketTableProps> = ({ markets = [] }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'current_status',  // Default sort by status
    order: 'desc'  // Open markets first
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const headers: { key: SortKey; label: string }[] = [
    { key: 'region', label: 'Region' },
    { key: 'market_type', label: 'Market Type' },
    { key: 'primary_exchanges', label: 'Exchanges' },
    { key: 'userTime', label: 'Trading Hours (Your Time)' },
    { key: 'current_status', label: 'Status' },
  ];

  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => ({
      key,
      order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (market: ConvertedMarketData) => {
    // Extract the base region (remove any exchange information)
    const baseRegion = market.region.split('-')[0].trim();
    
    // Get the symbol(s) for this region
    const symbols = MARKET_SYMBOLS[baseRegion];
    
    if (!symbols) {
      console.warn(`No symbols found for region: ${baseRegion}`);
      return;
    }
  
    const exchange = market.primary_exchanges
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  
    const symbolParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
    
    navigate(`/exchange/${market.region.toLowerCase()}/${exchange}?symbols=${symbolParam}`);
  };

 

  // Filter based on search query
  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    
    return markets.filter(market =>
      market.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.market_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.primary_exchanges.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markets, searchQuery]);

  // Sort markets based on sort config
  const sortedMarkets = useMemo(() => {
    return [...filteredMarkets].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'current_status') {
        // Custom sorting for status (OPEN first)
        const aIsOpen = a.current_status.toLowerCase() === 'open';
        const bIsOpen = b.current_status.toLowerCase() === 'open';
        
        if (aIsOpen === bIsOpen) return 0;
        if (sortConfig.order === 'asc') {
          return aIsOpen ? 1 : -1;
        } else {
          return aIsOpen ? -1 : 1;
        }
      }

      if (aValue < bValue) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredMarkets, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedMarkets.length / ROWS_PER_PAGE);
  const paginatedMarkets = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedMarkets.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [sortedMarkets, currentPage]);

  // Reset to first page when searching or sorting
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center p-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700">Market Table</h2>
        <input
          type="text"
          placeholder="Search Markets..."
          className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {headers.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{label}</span>
                    <span className="text-slate-400">
                      {sortConfig.key === key && (
                        sortConfig.order === 'asc' 
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {paginatedMarkets.length > 0 ? (
              paginatedMarkets.map((market, index) => (
                <tr
                  key={`${market.region}-${index}`}
                  onClick={() => handleRowClick(market)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">
                      {market.region}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">
                      {market.market_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">
                      {market.primary_exchanges}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">
                      {market.userTime}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${market.current_status.toLowerCase() === 'open'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}
                    `}>
                      {market.current_status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                  No markets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
          <div className="flex items-center">
            <p className="text-sm text-slate-700">
              Showing{' '}
              <span className="font-medium">{((currentPage - 1) * ROWS_PER_PAGE) + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(currentPage * ROWS_PER_PAGE, sortedMarkets.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{sortedMarkets.length}</span>
              {' '}results
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium
                  ${currentPage === i + 1 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-100'}
                `}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};