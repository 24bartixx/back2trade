'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, UTCTimestamp, CandlestickSeries, SeriesMarker, createSeriesMarkers, IChartApi } from 'lightweight-charts';

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number; volume: number };
type Marker = SeriesMarker<UTCTimestamp>;

interface TradeLine {
  open: number;
  stopLoss: number;
  takeProfit: number;
}

interface TradingChartProps {
  symbol: string;
  interval: string;
  fast: number;
  slow: number;
  onMetricsUpdate?: (metrics: any) => void;
  tradeLines?: TradeLine;
  onRemoveTrade?: () => void;
}

export default function TradingChart({ symbol, interval, fast, slow, onMetricsUpdate, tradeLines, onRemoveTrade }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const markersPluginRef = useRef<any>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const entryLineRef = useRef<any>(null);
  const openLineRef = useRef<any>(null);
  const stopLossLineRef = useRef<any>(null);
  const takeProfitLineRef = useRef<any>(null);
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragStartPrice, setDragStartPrice] = useState<number | null>(null);

  // --- init chart ---
  useEffect(() => {
    if (!containerRef.current) return;
  
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 480,
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

  // Handle trade lines
  useEffect(() => {
    if (!seriesRef.current || !tradeLines) return;

    // Remove existing trade lines
    if (openLineRef.current) {
      seriesRef.current.removePriceLine(openLineRef.current);
      openLineRef.current = null;
    }
    if (stopLossLineRef.current) {
      seriesRef.current.removePriceLine(stopLossLineRef.current);
      stopLossLineRef.current = null;
    }
    if (takeProfitLineRef.current) {
      seriesRef.current.removePriceLine(takeProfitLineRef.current);
      takeProfitLineRef.current = null;
    }

    // Create new trade lines
    openLineRef.current = seriesRef.current.createPriceLine({
      price: tradeLines.open,
      color: '#FFD700', // yellow
      lineWidth: 2,
      lineStyle: 0, // solid
      axisLabelVisible: true,
      title: 'Open',
    });

    stopLossLineRef.current = seriesRef.current.createPriceLine({
      price: tradeLines.stopLoss,
      color: '#FF0000', // red
      lineWidth: 2,
      lineStyle: 0, // solid
      axisLabelVisible: true,
      title: 'Stop Loss',
    });

    takeProfitLineRef.current = seriesRef.current.createPriceLine({
      price: tradeLines.takeProfit,
      color: '#00FF00', // green
      lineWidth: 2,
      lineStyle: 0, // solid
      axisLabelVisible: true,
      title: 'Take Profit',
    });

    // Add mouse event listeners for dragging
    const handleMouseDown = (event: MouseEvent) => {
      if (!chartRef.current || !seriesRef.current) return;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const y = event.clientY - rect.top;
      
      // Check if click is near any price line title
      const price = seriesRef.current.coordinateToPrice(y);
      if (!price) return;
      
      // Calculate tolerance based on price range
      const priceRange = Math.max(tradeLines.open, tradeLines.stopLoss, tradeLines.takeProfit) - 
                        Math.min(tradeLines.open, tradeLines.stopLoss, tradeLines.takeProfit);
      const tolerance = priceRange * 0.02; // 2% of price range
      
      if (Math.abs(price - tradeLines.open) < tolerance) {
        setIsDragging('open');
        setDragStartPrice(tradeLines.open);
      } else if (Math.abs(price - tradeLines.stopLoss) < tolerance) {
        setIsDragging('stopLoss');
        setDragStartPrice(tradeLines.stopLoss);
      } else if (Math.abs(price - tradeLines.takeProfit) < tolerance) {
        setIsDragging('takeProfit');
        setDragStartPrice(tradeLines.takeProfit);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !seriesRef.current || !chartRef.current) return;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const y = event.clientY - rect.top;
      const newPrice = seriesRef.current.coordinateToPrice(y);
      
      if (!newPrice) return;
      
      // Update the appropriate line
      if (isDragging === 'open' && openLineRef.current) {
        seriesRef.current.removePriceLine(openLineRef.current);
        openLineRef.current = seriesRef.current.createPriceLine({
          price: newPrice,
          color: '#FFD700',
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: 'Open',
        });
      } else if (isDragging === 'stopLoss' && stopLossLineRef.current) {
        seriesRef.current.removePriceLine(stopLossLineRef.current);
        stopLossLineRef.current = seriesRef.current.createPriceLine({
          price: newPrice,
          color: '#FF0000',
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: 'Stop Loss',
        });
      } else if (isDragging === 'takeProfit' && takeProfitLineRef.current) {
        seriesRef.current.removePriceLine(takeProfitLineRef.current);
        takeProfitLineRef.current = seriesRef.current.createPriceLine({
          price: newPrice,
          color: '#00FF00',
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: 'Take Profit',
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      setDragStartPrice(null);
    };

    // Add event listeners
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup function
    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [tradeLines, isDragging]);

  // --- SMA helper ---
  function sma(values: number[], length: number) {
    const res: (number | null)[] = [];
    for (let i = 0; i < values.length; i++) {
      if (i < length - 1) {
        res.push(null);
      } else {
        const slice = values.slice(i - length + 1, i + 1);
        res.push(slice.reduce((a, b) => a + b, 0) / length);
      }
    }
    return res;
  }

//   // --- backtest SMA cross ---
//   function runBacktest() {
//     if (candles.length === 0) return;
  
//     const closes = candles.map(c => c.close);
//     const smaFast = sma(closes, fast);
//     const smaSlow = sma(closes, slow);
  
//     let position = 0; // 0 = flat, 1 = long, -1 = short
//     let equity = 1;
//     const trades: any[] = [];
//     const markers: Marker[] = [];
  
//     let entryPrice = 0;
  
//     for (let i = 1; i < candles.length; i++) {
//       if (smaFast[i] && smaSlow[i]) {
//         // cross up → sygnał long
//         if (smaFast[i]! > smaSlow[i]! && smaFast[i - 1]! <= smaSlow[i - 1]!) {
//           // zamknij shorta, jeśli był
//           if (position === -1) {
//             const exitPrice = candles[i].close;
//             const ret = (entryPrice / exitPrice - 1); // short zysk = odwrotnie
//             equity *= 1 + ret;
//             trades.push({ side: "short", entry: entryPrice, exit: exitPrice, ret });
//             markers.push({ time: candles[i].time, position: 'aboveBar', shape: 'arrowDown', text: 'Short exit', color: 'orange' });

//             if (entryLineRef.current) {
//                 seriesRef.current?.removePriceLine(entryLineRef.current);
//                 entryLineRef.current = null;
//               }
//           }
//           // otwórz longa
//           position = 1;
//           entryPrice = candles[i].close;
//           markers.push({ time: candles[i].time, position: 'belowBar', shape: 'arrowUp', text: 'Long entry', color: 'green' });

//           entryLineRef.current = seriesRef.current?.createPriceLine({
//             price: entryPrice,
//             color: 'green',
//             lineWidth: 2,
//             lineStyle: 2, // dashed
//             axisLabelVisible: true,
//             title: 'LONG',
//           });
//         }
  
//         // cross down → sygnał short
//         if (smaFast[i]! < smaSlow[i]! && smaFast[i - 1]! >= smaSlow[i - 1]!) {
//           // zamknij longa, jeśli był
//           if (position === 1) {
//             const exitPrice = candles[i].close;
//             const ret = exitPrice / entryPrice - 1;
//             equity *= 1 + ret;
//             trades.push({ side: "long", entry: entryPrice, exit: exitPrice, ret });
//             markers.push({ time: candles[i].time, position: 'aboveBar', shape: 'arrowDown', text: 'Long exit', color: 'red' });

//             if (entryLineRef.current) {
//                 seriesRef.current?.removePriceLine(entryLineRef.current);
//                 entryLineRef.current = null;
//               }
//           }
//           // otwórz shorta
//           position = -1;
//           entryPrice = candles[i].close;
//           markers.push({ time: candles[i].time, position: 'aboveBar', shape: 'arrowDown', text: 'Short entry', color: 'blue' });

//           entryLineRef.current = seriesRef.current?.createPriceLine({
//             price: entryPrice,
//             color: 'red',
//             lineWidth: 2,
//             lineStyle: 2,
//             axisLabelVisible: true,
//             title: 'SHORT',
//           });
//         }
//       }
//     }
  
//     // metryki
//     const pnl = equity - 1;
//     const winRate = trades.length ? trades.filter(t => t.ret > 0).length / trades.length : 0;
  
//     setMarkers(markers);
//     markersPluginRef.current?.setMarkers(markers);
//     setMetrics({ trades: trades.length, pnl, winRate });
    
//     // Notify parent component about metrics update
//     if (onMetricsUpdate) {
//       onMetricsUpdate({ trades: trades.length, pnl, winRate });
//     }
//   }

  // Expose runBacktest function to parent
  useEffect(() => {
    // This effect will run when the component mounts and when dependencies change
    // The parent can trigger backtest by changing props
  }, [symbol, interval, fast, slow, candles]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      />
      
      {/* Trade Lines Legend */}
      {tradeLines && (
        <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Click and drag lines to adjust
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span className="text-slate-700 dark:text-slate-300">Entry: {tradeLines.open}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-slate-700 dark:text-slate-300">SL: {tradeLines.stopLoss}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-slate-700 dark:text-slate-300">TP: {tradeLines.takeProfit}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
