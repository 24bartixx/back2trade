import { getAllStocks } from "@/src/lib/stocks";

export default async function StocksPage() {
  const stocksData = await getAllStocks();
  console.log(stocksData);

  return (
    <>
      {stocksData.map((stock) => {
        return (
          <div>
            {stock.symbol} - {stock.companyName} - {stock.industry} -{" "}
            {stock.price}
          </div>
        );
      })}
    </>
  );
}
