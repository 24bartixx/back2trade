import { CryptoSymbol } from "@/types/crypto";
import "server-only";

const BINANCE_API = process.env.BINANCE_API;

export async function getAllCryptoSymbols(
  limit: number = 100,
  shouldLimit: boolean = false
) {
  const cryptosRes = await fetch(`${BINANCE_API}/exchangeInfo`);

  if (!cryptosRes.ok) {
    throw new Error(
      `Error fetching list of symbols: ${cryptosRes.status} ${cryptosRes.statusText}`
    );
  }

  const cryptosData = await cryptosRes.json();

  let cryptos = cryptosData.symbols as CryptoSymbol[];

  if (shouldLimit) {
    cryptos = cryptos.slice(0, limit);
  }

  const symbols = cryptos.map((crypto) => {
    return crypto.symbol;
  });

  return symbols;
}
