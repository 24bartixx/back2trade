'use client';
import { useState } from 'react';
import TradingChart from '@/components/chart/TradingChart';
import TradeForm from '@/components/inputs/TradeForm';

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

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-2xl font-bold border-b-2 border-gray-200 ">Backtest – {symbol} ({interval})</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" />
        <select value={interval} onChange={(e) => setInterval_(e.target.value)}>
          <option>1m</option><option>5m</option><option>15m</option>
          <option>1h</option><option>4h</option><option>1d</option>
        </select>
        <input type="number" value={fast} onChange={(e) => setFast(Number(e.target.value))} style={{ width: 60 }} /> fast
        <input type="number" value={slow} onChange={(e) => setSlow(Number(e.target.value))} style={{ width: 60 }} /> slow
      </div>

      <TradingChart 
        symbol={symbol}
        interval={interval}
        fast={fast}
        slow={slow}
        onMetricsUpdate={handleMetricsUpdate}
        tradeLines={tradeLines}
      />

      <TradeForm onSubmit={handleTradeSubmit} />

      {metrics && (
        <div style={{ marginTop: 16 }}>
          <h2 className="text-xl font-bold">Metrics</h2>
          <p>PNL: {(metrics.pnl * 100).toFixed(2)}%</p>
          <p>Trades: {metrics.trades}</p>
          <p>Win rate: {(metrics.winRate * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
