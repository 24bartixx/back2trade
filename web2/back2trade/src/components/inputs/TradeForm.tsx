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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-sm">
      <div>
        <label className="text-sm font-medium">Open</label>
        <Input
          type="number"
          value={open}
          onChange={(e) => setOpen(e.target.value)}
          placeholder="Cena wejścia"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Stop Loss</label>
        <Input
          type="number"
          value={sl}
          onChange={(e) => setSl(e.target.value)}
          placeholder="Stop Loss"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Take Profit</label>
        <Input
          type="number"
          value={tp}
          onChange={(e) => setTp(e.target.value)}
          placeholder="Take Profit"
        />
      </div>

      <Button type="submit">Dodaj trade</Button>
    </form>
  )
}
