'use client';
import { useRef, useEffect, useCallback } from 'react';
import { ISeriesApi, IPriceLine } from 'lightweight-charts';

export interface TradePosition {
  id: string;
  type: 'long' | 'short';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  portfolioPercentage: number;
  timestamp: number;
}

export interface PriceLineManagerProps {
  series: ISeriesApi<'Candlestick'> | null;
  positions: TradePosition[];
  onPositionUpdate?: (position: TradePosition) => void;
  onPositionRemove?: (positionId: string) => void;
}

export default function PriceLineManager({ 
  series, 
  positions, 
  onPositionUpdate, 
  onPositionRemove 
}: PriceLineManagerProps) {
  const priceLinesRef = useRef<Map<string, { entry: IPriceLine; stopLoss: IPriceLine; takeProfit: IPriceLine }>>(new Map());
  const isDraggingRef = useRef<{ positionId: string; lineType: 'entry' | 'stopLoss' | 'takeProfit' } | null>(null);

  // Create or update price lines for a position
  const createPriceLines = useCallback((position: TradePosition) => {
    if (!series) {
      console.log('Series not available for creating price lines');
      return;
    }

    console.log('Creating price lines for position:', position);

    // Remove existing lines for this position if they exist
    removePriceLines(position.id);

    const entryColor = '#ffd700'; // Yellow for both long and short
    const stopLossColor = '#ef5350';
    const takeProfitColor = '#26a69a';

    const entryLine = series.createPriceLine({
      price: position.entry,
      color: entryColor,
      lineWidth: 2,
      lineStyle: 1, // Dotted
      axisLabelVisible: true,
      title: `${position.type.toUpperCase()} Entry`,
      axisLabelColor: entryColor,
    });

    const stopLossLine = series.createPriceLine({
      price: position.stopLoss,
      color: stopLossColor,
      lineWidth: 2,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: 'Stop Loss',
      axisLabelColor: stopLossColor,
    });

    const takeProfitLine = series.createPriceLine({
      price: position.takeProfit,
      color: takeProfitColor,
      lineWidth: 2,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: 'Take Profit',
      axisLabelColor: takeProfitColor,
    });

    // Store references
    priceLinesRef.current.set(position.id, {
      entry: entryLine,
      stopLoss: stopLossLine,
      takeProfit: takeProfitLine,
    });
  }, [series]);

  // Remove price lines for a position
  const removePriceLines = useCallback((positionId: string) => {
    if (!series) return;

    const lines = priceLinesRef.current.get(positionId);
    if (lines) {
      series.removePriceLine(lines.entry);
      series.removePriceLine(lines.stopLoss);
      series.removePriceLine(lines.takeProfit);
      priceLinesRef.current.delete(positionId);
    }
  }, [series]);

  // Update position data
  const updatePosition = useCallback((positionId: string, updates: Partial<Omit<TradePosition, 'id'>>) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const updatedPosition = { ...position, ...updates };
    createPriceLines(updatedPosition);
    
    if (onPositionUpdate) {
      onPositionUpdate(updatedPosition);
    }
  }, [positions, createPriceLines, onPositionUpdate]);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!series) return;

    // Check if the click is on the chart container
    const target = event.target as HTMLElement;
    const chartContainer = target.closest('[data-chart-container]');
    if (!chartContainer) return;

    console.log('Mouse down event:', event.target);

    const rect = chartContainer.getBoundingClientRect();
    const y = event.clientY - rect.top;
    
    // Use the chart's coordinateToPrice method
    const price = series.coordinateToPrice(y);
    
    console.log('Price at click:', price, 'Y coordinate:', y);
    
    if (price === null || price === undefined) {
      console.log('Could not get price from coordinate');
      return;
    }

    // Find the closest position line
    let closestPosition: { id: string; lineType: 'entry' | 'stopLoss' | 'takeProfit'; distance: number } | null = null;

    positions.forEach(position => {
      const entryDistance = Math.abs(price - position.entry);
      const stopLossDistance = Math.abs(price - position.stopLoss);
      const takeProfitDistance = Math.abs(price - position.takeProfit);

      // Moderate tolerance - not too strict, not too loose
      const tolerance = Math.max(position.entry, position.stopLoss, position.takeProfit) * 0.005; // 0.5% tolerance

      if (entryDistance < tolerance && (!closestPosition || entryDistance < closestPosition.distance)) {
        closestPosition = { id: position.id, lineType: 'entry', distance: entryDistance };
      }
      if (stopLossDistance < tolerance && (!closestPosition || stopLossDistance < closestPosition.distance)) {
        closestPosition = { id: position.id, lineType: 'stopLoss', distance: stopLossDistance };
      }
      if (takeProfitDistance < tolerance && (!closestPosition || takeProfitDistance < closestPosition.distance)) {
        closestPosition = { id: position.id, lineType: 'takeProfit', distance: takeProfitDistance };
      }
    });

    console.log('Closest position:', closestPosition);

    if (closestPosition) {
      const { id, lineType } = closestPosition;
      console.log('Starting drag for:', id, lineType);
      isDraggingRef.current = {
        positionId: id,
        lineType: lineType
      };
      // Prevent default to avoid chart interactions
      event.preventDefault();
      event.stopPropagation();
    }
  }, [series, positions]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current || !series) return;

    const target = event.target as HTMLElement;
    const chartContainer = target.closest('[data-chart-container]');
    if (!chartContainer) return;

    const rect = chartContainer.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const newPrice = series.coordinateToPrice(y);
    
    if (newPrice === null || newPrice === undefined) return;

    const { positionId, lineType } = isDraggingRef.current;
    const position = positions.find(p => p.id === positionId);
    
    if (!position) return;

    // Update the appropriate line
    const updates: Partial<Omit<TradePosition, 'id'>> = {};
    updates[lineType] = newPrice;

    updatePosition(positionId, updates);
  }, [series, positions, updatePosition]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = null;
  }, []);

  // Effect to manage positions - only when positions change
  useEffect(() => {
    console.log('PriceLineManager effect triggered:', { series: !!series, positionsCount: positions.length });
    
    if (!series) {
      console.log('Series not available, skipping price line creation');
      return;
    }

    // Remove all existing lines
    priceLinesRef.current.forEach((_, positionId) => {
      removePriceLines(positionId);
    });

    // Create lines for all positions
    positions.forEach(position => {
      console.log('Creating price lines for position:', position);
      createPriceLines(position);
    });
  }, [positions, createPriceLines, removePriceLines]); // Removed series from deps to avoid recreating on every series change

  // Add event listeners
  useEffect(() => {
    console.log('Adding mouse event listeners for price line dragging');
    
    // We'll add event listeners to the document for mouse events
    // The chart container will be handled by the parent component
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('Removing mouse event listeners');
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (series) {
        priceLinesRef.current.forEach((_, positionId) => {
          removePriceLines(positionId);
        });
      }
    };
  }, [series, removePriceLines]);


  // This component doesn't render anything, it just manages price lines
  return null;
}
