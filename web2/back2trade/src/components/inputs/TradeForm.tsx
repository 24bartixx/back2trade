'use client'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface TradePosition {
  id: string;
  type: 'long' | 'short';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: number;
}

interface TradeFormProps {
  onSubmit?: (data: TradePosition) => void;
}

export default function TradeForm({ onSubmit }: TradeFormProps) {
  const [type, setType] = useState<'long' | 'short'>('long')
  const [open, setOpen] = useState("")
  const [sl, setSl] = useState("")
  const [tp, setTp] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const openValue = parseFloat(open)
    const slValue = parseFloat(sl)
    const tpValue = parseFloat(tp)
    
    if (isNaN(openValue) || isNaN(slValue) || isNaN(tpValue)) {
      alert("Proszę wprowadzić poprawne wartości liczbowe")
      return
    }
    
    // Validate stop loss and take profit based on position type
    if (type === 'long') {
      if (slValue >= openValue || tpValue <= openValue) {
        alert("Dla pozycji LONG: Stop Loss musi być poniżej Entry, Take Profit powyżej Entry")
        return
      }
    } else {
      if (slValue <= openValue || tpValue >= openValue) {
        alert("Dla pozycji SHORT: Stop Loss musi być powyżej Entry, Take Profit poniżej Entry")
        return
      }
    }
    
    if (onSubmit) {
      const tradePosition: TradePosition = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        entry: openValue,
        stopLoss: slValue,
        takeProfit: tpValue,
        timestamp: Date.now()
      }
      onSubmit(tradePosition)
    }
    
    // Clear form after submission
    setOpen("")
    setSl("")
    setTp("")
  }

  const handleDefault = () => {
    if (type === 'long') {
      setOpen("116000")
      setSl("115000")
      setTp("117000")
    } else {
      setOpen("116000")
      setSl("117000")
      setTp("115000")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Position Type
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setType('long')}
            variant={type === 'long' ? 'default' : 'outline'}
            className={`flex-1 ${type === 'long' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
          >
            LONG
          </Button>
          <Button
            type="button"
            onClick={() => setType('short')}
            variant={type === 'short' ? 'default' : 'outline'}
            className={`flex-1 ${type === 'short' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          >
            SHORT
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Entry Price
        </label>
        <Input
          type="number"
          step="0.00001"
          value={open}
          onChange={(e) => setOpen(e.target.value)}
          placeholder="Enter entry price"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Stop Loss
        </label>
        <Input
          type="number"
          step="0.00001"
          value={sl}
          onChange={(e) => setSl(e.target.value)}
          placeholder="Enter stop loss"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Take Profit
        </label>
        <Input
          type="number"
          step="0.00001"
          value={tp}
          onChange={(e) => setTp(e.target.value)}
          placeholder="Enter take profit"
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <Button 
          type="button"
          onClick={handleDefault}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Default
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Add Trade Lines
        </Button>
      </div>
    </form>
  )
}
