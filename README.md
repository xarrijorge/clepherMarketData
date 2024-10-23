# Clepher Market Data Visualization

A React-based financial market data visualization tool that provides real-time market data and interactive charts for various global exchanges.

## Live Demo
[View Live Demo](https://clepherdataviz.netlify.app/)

## Overview
This project provides a user interface for viewing and analyzing financial market data across different global exchanges. It features interactive charts with customizable views and multiple data timeframes.

## Features
- Real-time market data visualization
- Multiple timeframe views (Daily, Weekly, Monthly)
- Interactive line chart with toggleable data points
- Support for multiple exchanges
- Responsive design
- Custom data filters and sorting
- Search functionality for markets
- Pagination for market listings

## Currently Available Exchanges - if using demo API key
**Note:** At present, only the following exchanges have active data and should be clicked for visualization:
- United States (IBM) - Daily, Weekly, Monthly
- United Kingdom (TSCO.LON) - Daily, Weekly, Monthly
- Canada (SHOP.TRT, GPV.TRV) - Daily
- India (RELIANCE.BSE) - Daily
- Germany (MBG.DEX) - Daily
- China (600104.SHH, 000002.SHZ) - Daily

## Technologies Used
- React
- TypeScript
- Recharts
- TailwindCSS
- Alpha Vantage API
- React Router

## Installation

1. Clone the repository:
```bash
git clone https://github.com/xarrijorge/clepherMarketData.git
```

2. Install dependencies:
```bash
cd clepherMarketData
npm install
```

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:
```
REACT_APP_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

## Usage

### Market Table
- Use the search bar to filter markets
- Click column headers to sort data
- Click on any row to view detailed charts for that market
- Use pagination to navigate through market listings

### Chart View
- Toggle between Daily, Weekly, and Monthly views
- Use the line toggles to show/hide specific data points
- For markets with multiple exchanges, use the dropdown to switch between them
- Hover over the chart to see detailed values

## API Integration
The project uses the Alpha Vantage API for market data. API calls are limited based on your API key tier.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Repository
[GitHub Repository](https://github.com/xarrijorge/clepherMarketData)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## AI Assistance
This project was developed with the help of AI tools:

TypeScript interfaces and type definitions were refined with assistance from Claude AI
Market symbols configuration and mapping were generated using ChatGPT
These AI contributions helped streamline the development process while maintaining code quality and type safety

## Acknowledgments

- Data provided by Alpha Vantage
- Charts powered by Recharts
- TypeScript assistance provided by Claude AI
- Exchange symbol generation assisted by ChatGPT

## Acknowledgments
- Data provided by [Alpha Vantage](https://www.alphavantage.co/)
- Charts powered by [Recharts](https://recharts.org/)
