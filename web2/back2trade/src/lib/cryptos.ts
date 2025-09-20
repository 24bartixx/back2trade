const BINANCE_BASE = process.env.BINANCE_API;

export async function getBinancePrices(
  quote: string = "USDT"
): Promise<Crypto[]> {
  // 1) Get metadata (which symbols exist) to know base/quote assets
  const exchangeInfoRes = await fetch(`${BINANCE_BASE}/exchangeInfo`, {
    cache: "no-store",
  });
  if (!exchangeInfoRes.ok)
    throw new Error(`exchangeInfo failed: ${exchangeInfoRes.status}`);
  const exchangeInfo = (await exchangeInfoRes.json()) as {
    symbols: Array<{
      symbol: string;
      status: string;
      baseAsset: string;
      quoteAsset: string;
      isSpotTradingAllowed?: boolean;
    }>;
  };

  // only spot, trading allowed, quote == USDT (or your chosen quote)
  const spotUsdtPairs = new Set(
    exchangeInfo.symbols
      .filter(
        (s) =>
          s.status === "TRADING" &&
          s.quoteAsset === quote &&
          (s.isSpotTradingAllowed ?? true)
      )
      .map((s) => s.symbol)
  );

  // 2) Get latest prices for ALL symbols, then filter to our set
  const pricesRes = await fetch(`${BINANCE_API}/ticker/price`, {
    cache: "no-store",
  });
  if (!pricesRes.ok)
    throw new Error(`ticker/price failed: ${pricesRes.status}`);
  const prices = (await pricesRes.json()) as Array<{
    symbol: string;
    price: string;
  }>;

  // 3) Map to a simple shape
  return prices
    .filter((p) => spotUsdtPairs.has(p.symbol))
    .map((p) => ({
      asset: p.symbol.replace(quote, ""), // "BTCUSDT" -> "BTC"
      pair: p.symbol,
      price: Number(p.price),
    }))
    .sort((a, b) => a.asset.localeCompare(b.asset));
}
