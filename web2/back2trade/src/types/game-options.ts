export const TimeUnit = {
  Minutes: "minutes",
  Hours: "hours",
  Days: "days",
  Months: "months",
  Years: "years",
} as const;

export type TimeUnit = (typeof TimeUnit)[keyof typeof TimeUnit];

export type GameOptions = {
  timeValue: number;
  timeUnit: TimeUnit;
  startingAccountBalance: number;
};
