import "server-only";

const token = process.env.FINNHUB_TOKEN;
const FINNHUB_API_BASE = process.env.FINNHUB_API;

export async function getAllStocks(limit: number = 10) {
  const symbolsRes = await fetch(
    `${FINNHUB_API_BASE}/stock/symbol?exchange=US&token=${token}`
  );

  if (!symbolsRes.ok) {
    throw new Error(
      `Error fetching list of symbols: ${symbolsRes.status} ${symbolsRes.statusText}`
    );
  }

  const symbols = (await symbolsRes.json()) as StockSymbol[];

  const stocks = await Promise.all(
    symbols.slice(1, limit).map(async (element) => {
      const symbol = element.symbol;

      const [profileRes, priceRes] = await Promise.all([
        fetch(
          `${FINNHUB_API_BASE}/stock/profile2?symbol=${symbol}&token=${token}`
        ),
        fetch(
          `${FINNHUB_API_BASE}/quote?symbol=${element.symbol}&token=${token}`
        ),
      ]);

      const profile = (await profileRes.json()) as StockCompanyName;
      const price = (await priceRes.json()) as StockPrice;

      return {
        symbol: symbol,
        companyName: profile.name,
        industry: profile.finnhubIndustry,
        price: price.c,
      };
    })
  );

  return stocks;
}
