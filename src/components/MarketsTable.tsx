// src/components/MarketTable.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ConvertedMarketData } from '../utilities/TimeConverter';

type SortKey = keyof ConvertedMarketData;
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  order: SortOrder;
}

interface MarketTableProps {
  markets: ConvertedMarketData[];
}

// Pagination component defined within the same file
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current page
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
      >
        Previous
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={typeof page !== 'number'}
          className={`
            px-3 py-1 rounded-md text-sm font-medium
            ${typeof page !== 'number' ? 'cursor-default' : 'hover:bg-slate-100'}
            ${currentPage === page ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}
          `}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
      >
        Next
      </button>
    </div>
  );
};

// Main MarketTable component
export const MarketTable: React.FC<MarketTableProps> = ({ markets = [] }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'current_status',
    order: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

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
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredMarkets, sortConfig]);

  const paginatedMarkets = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return sortedMarkets.slice(startIndex, startIndex + 10);
  }, [sortedMarkets, currentPage]);

  const totalPages = Math.ceil(sortedMarkets.length / 10);

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
                <tr key={`${market.region}-${index}`} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{market.region}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">{market.market_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{market.primary_exchanges}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{market.userTime}</span>
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};