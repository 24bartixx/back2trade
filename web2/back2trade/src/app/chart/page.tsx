'use client';
import { useState } from 'react';
import TradingChart from '@/components/chart/TradingChart';
import TradeForm from '@/components/inputs/TradeForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval_] = useState('1h');
  const [fast, setFast] = useState(20);
  const [slow, setSlow] = useState(50);
  const [metrics, setMetrics] = useState<any>(null);
  const [tradeLines, setTradeLines] = useState<{ open: number; stopLoss: number; takeProfit: number } | undefined>(undefined);

  const handleMetricsUpdate = (newMetrics: any) => {
    setMetrics(newMetrics);
  };

  const handleTradeSubmit = (data: { open: number; stopLoss: number; takeProfit: number }) => {
    setTradeLines(data);
  };

  const handleRemoveTrade = () => {
    setTradeLines(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Back2Trade
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Trading Analysis & Backtesting Platform
          </p>
        </div>

        {/* Controls Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Chart Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Symbol
              </label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTCUSDT"
                className="w-full"
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fast SMA
              </label>
              <Input
                type="number"
                value={fast}
                onChange={(e) => setFast(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Slow SMA
              </label>
              <Input
                type="number"
                value={slow}
                onChange={(e) => setSlow(Number(e.target.value))}
                className="w-full"
              />
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
                {tradeLines && (
                  <Button
                    onClick={handleRemoveTrade}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <span>×</span>
                    Remove Trade
                  </Button>
                )}
              </div>
              <TradingChart 
                symbol={symbol}
                interval={interval}
                fast={fast}
                slow={slow}
                onMetricsUpdate={handleMetricsUpdate}
                tradeLines={tradeLines}
                onRemoveTrade={handleRemoveTrade}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trade Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Add Trade
              </h3>
              <TradeForm onSubmit={handleTradeSubmit} />
            </div>

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
      </div>
    </div>
  );
}
