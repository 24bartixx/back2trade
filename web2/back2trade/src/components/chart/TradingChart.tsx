'use client';

import { use, useEffect, useRef, useState } from 'react';
import {
  createChart,
  ISeriesApi,
  UTCTimestamp,
  CandlestickSeries,
  IChartApi,
} from 'lightweight-charts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PriceLineManager, { TradePosition } from './PriceLineManager';

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

interface TradingChartProps {
  symbol: string;
  startDate: Date;
  endDate: Date;
  positions?: TradePosition[];
  onPositionUpdate?: (position: TradePosition) => void;
  onPositionRemove?: (positionId: string) => void;
  onCurrentPriceChange?: (price: number) => void;
}

export default function TradingChart({ symbol, startDate, endDate, positions = [], onPositionUpdate, onPositionRemove, onCurrentPriceChange }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [intervalValue, setIntervalValue] = useState('1h');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // PriceLineManager will be initialized when series is ready

  const isLoadingLeftRef = useRef(false);
  const isLoadingRightRef = useRef(false);
  const noMoreHistoryRef = useRef(false);
  const noMoreFutureRef = useRef(false);

  // --- fetch candles ---
  async function fetchCandles(sym: string, intv: string, start?: Date, end?: Date) {
    let url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${intv}&limit=500`;
    if (start) url += `&startTime=${start.getTime()}`;
    if (end) url += `&endTime=${end.getTime()}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.map((d: any) => ({
      time: Math.floor(d[0] / 1000) as UTCTimestamp,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    })) as Candle[];
  }

  function intervalToMs(i: string) {
    const m = 60_000;
    switch (i) {
      case '1m': return 1 * m;
      case '5m': return 5 * m;
      case '15m': return 15 * m;
      case '1h': return 60 * m;
      case '4h': return 240 * m;
      case '1d': return 24 * 60 * m;
      default: return 60 * m;
    }
  }

  // NEXT → pokaż kolejną świecę
  const handleNext = async () => {
    if (currentIndex >= candles.length - 1) {
      if (noMoreFutureRef.current) return;
      await loadMoreFuture();
    }
    if (candles[currentIndex + 1]?.time * 1000 > endDate.getTime()) return; // blokada przy końcu
    setCurrentIndex((prev) => prev + 1);
  };

  // DOGRYWANIE w lewo
  async function loadMoreHistory() {
    if (isLoadingLeftRef.current || noMoreHistoryRef.current) return;
    if (!candles.length) return;

    isLoadingLeftRef.current = true;
    try {
      const first = candles[0];
      const endMs = (first.time as number) * 1000;
      const startMs = endMs - 500 * intervalToMs(intervalValue);

      const older = await fetchCandles(symbol, intervalValue, new Date(startMs), new Date(endMs));
      if (!older.length) {
        noMoreHistoryRef.current = true;
        return;
      }
      setCurrentIndex((prev) => prev + older.length);
      const filtered = older.filter((o) => o.time < first.time);

      const newCandles = [...filtered, ...candles];
      setCandles(newCandles);
      
      // Update chart with new data without reset
      if (seriesRef.current) {
        // Instead of setData, we'll let the currentIndex effect handle the update
        // This prevents chart reset
      }
      
    } finally {
      isLoadingLeftRef.current = false;
    }
  }

  // DOGRYWANIE w prawo
  async function loadMoreFuture() {
    if (isLoadingRightRef.current || noMoreFutureRef.current) return;
    if (!candles.length) return;

    isLoadingRightRef.current = true;
    try {
      const last = candles[candles.length - 1];
      const startMs = (last.time as number) * 1000;
      const endMs = startMs + 500 * intervalToMs(intervalValue);

      const newer = await fetchCandles(symbol, intervalValue, new Date(startMs), new Date(endMs));
      if (!newer.length) {
        noMoreFutureRef.current = true;
        return;
      }
      const filtered = newer.filter((o) => o.time > last.time);
      const newCandles = [...candles, ...filtered];
      setCandles(newCandles);
      
      // Update chart with new data without reset
      if (seriesRef.current) {
        // Instead of setData, we'll let the currentIndex effect handle the update
        // This prevents chart reset
      }
    } finally {
      isLoadingRightRef.current = false;
    }
  }


  // INIT chart
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 480,
      rightPriceScale: { borderVisible: true },
      timeScale: { borderVisible: true },
    });
      chart.timeScale().applyOptions({ rightOffset: 75 });


    chartRef.current = chart;
    const series = chart.addSeries(CandlestickSeries, {}) as ISeriesApi<'Candlestick'>;
    seriesRef.current = series;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || !seriesRef.current) return;
      const info = seriesRef.current.barsInLogicalRange(range);
      if (!info) return;

      // scroll w lewo
      if (info.barsBefore < 10) loadMoreHistory();
    });


    const onResize = () => chart.applyOptions({ width: containerRef.current!.clientWidth });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
    };
  }, []);


  
  // Pierwsze ładowanie (środek = startDate)
  useEffect(() => {
    async function load() {
      const half = 250 * intervalToMs(intervalValue);
      const rows = await fetchCandles(
        symbol,
        intervalValue,
        new Date(startDate.getTime() - half),
        new Date(startDate.getTime() + half)
      );
      setCandles(rows);
      setCurrentIndex(Math.min(250, rows.length - 1));
      
      seriesRef.current?.setData(rows.slice(0, 250));


    }
    load();
  }, [symbol, intervalValue, startDate]);

  // Aktualizuj wykres przy zmianie currentIndex - tylko nowe świece
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;
    
    // Get the current visible candles
    const visibleCandles = candles.slice(0, currentIndex + 1);
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    
    if (lastCandle) {
      // Update only the last candle instead of resetting all data
      seriesRef.current.update(lastCandle);
      
      // Notify parent component about current price change
      if (onCurrentPriceChange) {
        onCurrentPriceChange(lastCandle.close);
      }
    }
  }, [currentIndex, candles]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={handleNext}
          disabled={candles.length === 0 || candles[currentIndex]?.time * 1000 >= endDate.getTime()}
          className="px-4 py-[5.5px] bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>

        <Select value={intervalValue} onValueChange={setIntervalValue}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1m</SelectItem>
            <SelectItem value="5m">5m</SelectItem>
            <SelectItem value="15m">15m</SelectItem>
            <SelectItem value="1h">1h</SelectItem>
            <SelectItem value="4h">4h</SelectItem>
            <SelectItem value="1d">1d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        ref={containerRef}
        data-chart-container
        className="w-full overflow-hidden border border-slate-300 dark:border-slate-700"
        style={{ height: '500px' }}
      />
      
      {/* PriceLineManager - only render when series is ready */}
      {seriesRef.current && (
        <PriceLineManager
          series={seriesRef.current}
          positions={positions}
          onPositionUpdate={onPositionUpdate}
          onPositionRemove={onPositionRemove}
        />
      )}
    </div>
  );
}
