'use client';
import { useState, useEffect, useCallback } from 'react';
import TradingChart from '@/components/chart/TradingChart';
import TradeForm, { TradePosition } from '@/components/inputs/TradeForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGameOptions } from '@/providers/game-options-provider';

export default function Home() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval_] = useState('1h');
  const [fast, setFast] = useState(20);
  const [slow, setSlow] = useState(50);
  const [metrics, setMetrics] = useState<any>(null);
  const [positions, setPositions] = useState<TradePosition[]>([]);
  

  const settings = useGameOptions();
  
  // Get dates with fallbacks
  let startDate = settings.state.startDate || new Date("2023-09-11T00:00:00Z");
  startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  const endDate = settings.state.finishDate || new Date("2023-09-14T23:59:59Z");

  // Current price tracking
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  
  // Memoize the price change handler to avoid re-renders
  const handleCurrentPriceChange = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const handleMetricsUpdate = (newMetrics: any) => {
    setMetrics(newMetrics);
  };

  const handlePositionSubmit = (position: TradePosition) => {
    setPositions(prev => [...prev, position]);
  };

  const handlePositionUpdate = (updatedPosition: TradePosition) => {
    setPositions(prev => prev.map(pos => 
      pos.id === updatedPosition.id ? updatedPosition : pos
    ));
  };

  const handlePositionRemove = (positionId: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== positionId));
  };

  const handleRemoveAllPositions = () => {
    setPositions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        

        {/* Controls Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Chart Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Timeframe
              </label>
              <select 
                value={interval} 
                onChange={(e) => setInterval_(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
              </select>
            </div>
            
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {symbol} Chart ({interval})
                </h2>

              </div>
            <TradingChart
              symbol="BTCUSDT"
              startDate={startDate}
              endDate={endDate}
              positions={positions}
              onPositionUpdate={handlePositionUpdate}
              onPositionRemove={handlePositionRemove}
              onCurrentPriceChange={handleCurrentPriceChange}
            />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trade Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Add Position
              </h3>
              <TradeForm onSubmit={handlePositionSubmit} />
            </div>

            {/* Positions List */}


            {/* Metrics */}
            {metrics && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Total Trades</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {metrics.trades}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Win Rate</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {(metrics.winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Total P&L</span>
                    <span className={`font-semibold ${metrics.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(metrics.pnl * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {positions.length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className='flex justify-between'>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Active Positions ({positions.length})
                </h3>
                {positions.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRemoveAllPositions}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <span>×</span>
                      Clear All
                    </Button>
                  </div>
                )}
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {positions.map((position) => (
                    <div key={position.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          position.type === 'long' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {position.type.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handlePositionRemove(position.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Entry</div>
                          <div className="font-medium">{position.entry.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">SL</div>
                          <div className="font-medium text-red-600">{position.stopLoss.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">TP</div>
                          <div className="font-medium text-green-600">{position.takeProfit.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
      </div>
    </div>
  );
}