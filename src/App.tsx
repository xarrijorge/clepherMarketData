import React, { useState, useEffect } from 'react';
import { convertToUserTimezone, type MarketData, type ConvertedMarketData } from './utilities/TimeConverter';
import './App.css';

function App() {
  const [markets, setMarkets] = useState<ConvertedMarketData[]>([]);

  // We'll add the API call here later

  return (
    <div className="App">
      <h1>Market Data</h1>
    </div>
  );
}

export default App;