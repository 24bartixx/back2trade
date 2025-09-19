"use client";

import React from "react";

type Props = {
  params: Promise<{ ticker: string }>;
};

export default function StockDetailsPage({ params }: Props) {
  const { ticker } = React.use(params);

  React.useEffect(() => {
    console.log(ticker);
  }, [ticker]);

  return <>{ticker}</>;
}
