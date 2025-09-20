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
}

export default function TradingChart({ symbol, interval, fast, slow, onMetricsUpdate, tradeLines }: TradingChartProps) {
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
  }, [tradeLines]);

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

  // --- backtest SMA cross ---
  function runBacktest() {
    if (candles.length === 0) return;
  
    const closes = candles.map(c => c.close);
    const smaFast = sma(closes, fast);
    const smaSlow = sma(closes, slow);
  
    let position = 0; // 0 = flat, 1 = long, -1 = short
    let equity = 1;
    const trades: any[] = [];
    const markers: Marker[] = [];
  
    let entryPrice = 0;
  
    for (let i = 1; i < candles.length; i++) {
      if (smaFast[i] && smaSlow[i]) {
        // cross up → sygnał long
        if (smaFast[i]! > smaSlow[i]! && smaFast[i - 1]! <= smaSlow[i - 1]!) {
          // zamknij shorta, jeśli był
          if (position === -1) {
            const exitPrice = candles[i].close;
            const ret = (entryPrice / exitPrice - 1); // short zysk = odwrotnie
            equity *= 1 + ret;
            trades.push({ side: "short", entry: entryPrice, exit: exitPrice, ret });
            markers.push({ time: candles[i].time, position: 'aboveBar', shape: 'arrowDown', text: 'Short exit', color: 'orange' });

            if (entryLineRef.current) {
                seriesRef.current?.removePriceLine(entryLineRef.current);
                entryLineRef.current = null;
              }
          }
          // otwórz longa
          position = 1;
          entryPrice = candles[i].close;
          markers.push({ time: candles[i].time, position: 'belowBar', shape: 'arrowUp', text: 'Long entry', color: 'green' });

          entryLineRef.current = seriesRef.current?.createPriceLine({
            price: entryPrice,
            color: 'green',
            lineWidth: 2,
            lineStyle: 2, // dashed
            axisLabelVisible: true,
            title: 'LONG',
          });
        }
  
        // cross down → sygnał short
        if (smaFast[i]! < smaSlow[i]! && smaFast[i - 1]! >= smaSlow[i - 1]!) {
          // zamknij longa, jeśli był
          if (position === 1) {
            const exitPrice = candles[i].close;
            const ret = exitPrice / entryPrice - 1;
            equity *= 1 + ret;
            trades.push({ side: "long", entry: entryPrice, exit: exitPrice, ret });
            markers.push({ time: candles[i].time, position: 'aboveBar', shape: 'arrowDown', text: 'Long exit', color: 'red' });

            if (entryLineRef.current) {
                seriesRef.current?.removePriceLine(entryLineRef.current);
                entryLineRef.current = null;
              }
          }
          // otwórz shorta
          position = -1;
          entryPrice = candles[i].close;
          markers.push({ time: candles[i].time, position: 'aboveBar', shape: 'arrowDown', text: 'Short entry', color: 'blue' });

          entryLineRef.current = seriesRef.current?.createPriceLine({
            price: entryPrice,
            color: 'red',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'SHORT',
          });
        }
      }
    }
  
    // metryki
    const pnl = equity - 1;
    const winRate = trades.length ? trades.filter(t => t.ret > 0).length / trades.length : 0;
  
    setMarkers(markers);
    markersPluginRef.current?.setMarkers(markers);
    setMetrics({ trades: trades.length, pnl, winRate });
    
    // Notify parent component about metrics update
    if (onMetricsUpdate) {
      onMetricsUpdate({ trades: trades.length, pnl, winRate });
    }
  }

  // Expose runBacktest function to parent
  useEffect(() => {
    // This effect will run when the component mounts and when dependencies change
    // The parent can trigger backtest by changing props
  }, [symbol, interval, fast, slow, candles]);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', border: '1px solid #eee'}} />
      {/* <button 
        onClick={runBacktest}
        style={{ 
          marginTop: 16, 
          padding: '8px 16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Run Backtest
      </button> */}
    </div>
  );
}
