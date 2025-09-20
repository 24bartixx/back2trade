"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GameOptionsDialog() {
  const [timeValue, setTimeValue] = useState<number>(10);
  const [timeUnit, setTimeUnit] = useState<string>("months");
  const [accountBalance, setAccountBalance] = useState<number>(10000);

  return (
    <Dialog>
      {/* Avoid nested buttons */}
      <DialogTrigger asChild>
        <Button>Start a game</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Session options</DialogTitle>
          <DialogDescription>
            Choose session parameters to adjust your gameplay
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="back-time" className="mb-2">
            Session time
          </Label>
          <div id="back-time" className="flex items-center gap-6">
            <Input
              id="position-size"
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              placeholder="e.g. 0.50"
              className="w-56"
              value={timeValue}
              onChange={(e) => setTimeValue(Number(e.target.value))}
            />
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger id="timeframe" className="w-64">
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">minutes</SelectItem>
                <SelectItem value="hours">hours</SelectItem>
                <SelectItem value="days">days</SelectItem>
                <SelectItem value="months">months</SelectItem>
                <SelectItem value="years">years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            <Label htmlFor="account-balance" className="mb-2">
              Starting account balance
            </Label>
            <Input
              id="account-balance"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              placeholder="e.g. 0.50"
              className="w-54"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button asChild className="px-6">
            <Link href="/chart">Start</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
