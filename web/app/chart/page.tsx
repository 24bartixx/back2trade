'use client';
import { useState } from 'react';
import TradingChart from '../../src/components/TradingChart';

export default function Home() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval_] = useState('1h');
  const [fast, setFast] = useState(20);
  const [slow, setSlow] = useState(50);
  const [metrics, setMetrics] = useState<any>(null);

  const handleMetricsUpdate = (newMetrics: any) => {
    setMetrics(newMetrics);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-2xl font-bold">Backtest – {symbol} ({interval})</h1>
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
      />

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
