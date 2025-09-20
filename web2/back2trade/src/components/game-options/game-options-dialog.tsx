"use client";

import Link from "next/link";
import React from "react";
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
import { TimeUnit } from "@/types/game-options";
import { useGameOptions } from "@/providers/game-options-provider";

export default function GameOptionsDialog() {
  const { state, dispatch } = useGameOptions();
  const { timeValue, timeUnit, accountBalance } = state;

  console.log(state);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Start a game</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Session options</DialogTitle>
          <DialogDescription>
            Choose session parameters to adjust your gameplay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Session time */}
          <div>
            <Label htmlFor="time-value" className="mb-2 block">
              Session time
            </Label>
            <div className="flex items-center gap-6">
              <Input
                id="time-value"
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                className="w-56"
                value={timeValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  dispatch({
                    type: "SetTimeValue",
                    timeValue: e.currentTarget.valueAsNumber,
                  })
                }
              />

              <Select
                value={timeUnit}
                onValueChange={(val: string) =>
                  dispatch({
                    type: "SetTimeUnit",
                    timeUnit: val as (typeof TimeUnit)[keyof typeof TimeUnit],
                  })
                }
              >
                <SelectTrigger id="timeframe" className="w-64">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeUnit.Minutes}>
                    {TimeUnit.Minutes}
                  </SelectItem>
                  <SelectItem value={TimeUnit.Hours}>
                    {TimeUnit.Hours}
                  </SelectItem>
                  <SelectItem value={TimeUnit.Days}>{TimeUnit.Days}</SelectItem>
                  <SelectItem value={TimeUnit.Months}>
                    {TimeUnit.Months}
                  </SelectItem>
                  <SelectItem value={TimeUnit.Years}>
                    {TimeUnit.Years}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Starting balance */}
          <div>
            <Label htmlFor="account-balance" className="mb-2 block">
              Starting account balance
            </Label>
            <Input
              id="account-balance"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              className="w-56"
              value={accountBalance}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch({
                  type: "SetAccountBalance",
                  accountBalance: e.currentTarget.valueAsNumber,
                })
              }
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
