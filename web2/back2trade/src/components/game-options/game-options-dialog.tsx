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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { format } from "date-fns";

import { useGameOptions } from "@/providers/game-options-provider";
import { cn } from "@/lib/utils";
import { getAllCryptoSymbols } from "@/lib/cryptos";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function GameOptionsDialog({
  symbolsList,
}: {
  symbolsList: string[];
}) {
  const { state, dispatch } = useGameOptions();
  const { startDate, finishDate, startingAccountBalance, cryptoSymbol } = state;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="px-10 bg-transparent text-white"
        >
          Start a game
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3x">
        <DialogHeader>
          <DialogTitle className="text-2xl">Session options</DialogTitle>
          <DialogDescription className="text-white text-md">
            Pick a session date range and your starting balance.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="crypto-symbol" className="mb-2 block">
            Symbol of a cryptocurrency
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[200px] justify-between"
              >
                {cryptoSymbol
                  ? symbolsList.find((symbol) => symbol === cryptoSymbol)
                  : "Select crypto symbol..."}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent id="crypto-symbol" className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {symbolsList.slice(0, 100).map((symbol) => (
                      <CommandItem
                        key={symbol}
                        value={symbol}
                        onSelect={(currentValue) => {
                          dispatch({
                            type: "SetCryptoSymbol",
                            cryptoSymbol: currentValue,
                          });
                        }}
                      >
                        {/* <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === symbol
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            /> */}
                        {symbol}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-6 mt-2">
          {/* Start date */}
          <div>
            <Label htmlFor="start-date" className="mb-2 block">
              Start date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "w-64 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate ?? undefined}
                  onSelect={(d) =>
                    dispatch({ type: "SetStartDate", startDate: d ?? null })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Finish date */}
          <div>
            <Label htmlFor="finish-date" className="mb-2 block">
              Finish date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="finish-date"
                  variant="outline"
                  className={cn(
                    "w-64 justify-start text-left font-normal",
                    !finishDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {finishDate
                    ? format(finishDate, "PPP")
                    : "Pick a finish date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={finishDate ?? undefined}
                  onSelect={(d) =>
                    dispatch({ type: "SetFinishDate", finishDate: d ?? null })
                  }
                />
              </PopoverContent>
            </Popover>
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
              value={startingAccountBalance}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch({
                  type: "SetAccountBalance",
                  accountBalance: e.currentTarget.valueAsNumber,
                })
              }
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button asChild className="px-6">
            <Link href="/chart">Start</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
