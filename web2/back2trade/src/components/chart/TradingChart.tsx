'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, UTCTimestamp, CandlestickSeries, SeriesMarker, createSeriesMarkers, IChartApi } from 'lightweight-charts';
import PriceLineManager, { TradePosition } from './PriceLineManager';

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number; volume: number };
type Marker = SeriesMarker<UTCTimestamp>;

interface TradingChartProps {
  symbol: string;
  interval: string;
  fast: number;
  slow: number;
  onMetricsUpdate?: (metrics: any) => void;
  positions: TradePosition[];
  onPositionUpdate?: (position: TradePosition) => void;
  onPositionRemove?: (positionId: string) => void;
}

export default function TradingChart({ symbol, interval, fast, slow, onMetricsUpdate, positions, onPositionUpdate, onPositionRemove }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const markersPluginRef = useRef<any>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // --- init chart ---
  useEffect(() => {
    if (!containerRef.current) return;
  
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 480,
      grid: {
        vertLines: { color: '#ccc', visible: true },
        horzLines: { color: '#ccc', visible: true },
      },
      rightPriceScale: {
        borderVisible: true,   // pokaże obramowanie po prawej
        borderColor: '#999',
      },
      timeScale: {
        borderVisible: true,   // pokaże obramowanie od dołu
        borderColor: '#999',
      },
    });
  
    chartRef.current = chart;
  
    const series = chart.addSeries(CandlestickSeries, {}) as ISeriesApi<'Candlestick'>;
    seriesRef.current = series;
    
    // Create markers plugin
    markersPluginRef.current = createSeriesMarkers(series);
  
    const onResize = () =>
      chart.applyOptions({ width: containerRef.current!.clientWidth });
    window.addEventListener('resize', onResize);
  
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
    };
  }, []);

  // --- fetch candles ---
  async function fetchCandles(sym: string, intv: string) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${intv}&limit=500`;
    const res = await fetch(url);
    const data = await res.json();
    const rows: Candle[] = data.map((d: any) => ({
      time: Math.floor(d[0] / 1000) as UTCTimestamp,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));
    return rows;
  }

  useEffect(() => {
    async function load() {
      const rows = await fetchCandles(symbol, interval);
      setCandles(rows);
      seriesRef.current?.setData(rows);
    }
    load();
  }, [symbol, interval]);

  // PriceLineManager hook
  const priceLineManager = PriceLineManager({
    series: seriesRef.current,
    positions,
    onPositionUpdate,
    onPositionRemove
  });

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="w-full overflow-hidden border border-slate-300 dark:border-slate-700"
        style={{ height: '500px' }}
      />
      
      {/* Positions Legend */}
      {positions.length > 0 && (
        <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700 max-w-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Click and drag lines to adjust
          </div>
          <div className="space-y-2">
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    position.type === 'long' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {position.type.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-yellow-500"></div>
                      <span className="text-slate-700 dark:text-slate-300">{position.entry.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-red-500"></div>
                      <span className="text-slate-700 dark:text-slate-300">{position.stopLoss}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-green-500"></div>
                      <span className="text-slate-700 dark:text-slate-300">{position.takeProfit}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => priceLineManager.removePosition(position.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-1"
                  title="Remove position"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}