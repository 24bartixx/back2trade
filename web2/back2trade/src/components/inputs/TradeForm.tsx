'use client'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TradeFormProps {
  onSubmit?: (data: { open: number; stopLoss: number; takeProfit: number }) => void;
}

export default function TradeForm({ onSubmit }: TradeFormProps) {
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
    
    console.log("Open:", openValue, "SL:", slValue, "TP:", tpValue)
    
    if (onSubmit) {
      onSubmit({
        open: openValue,
        stopLoss: slValue,
        takeProfit: tpValue
      })
    }
    
    // Clear form after submission
    setOpen("")
    setSl("")
    setTp("")
  }

  const handleDefault = () => {
    setOpen("116000")
    setSl("115000")
    setTp("117000")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
