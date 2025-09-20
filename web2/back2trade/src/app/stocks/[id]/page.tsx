"use client";

import React from "react";

type Props = {
  params: Promise<{ symbol: string }>;
};

export default function StockDetailsPage({ params }: Props) {
  const { symbol } = React.use(params);

  React.useEffect(() => {
    console.log(symbol);
  }, [symbol]);

  return <>{symbol}</>;
}
