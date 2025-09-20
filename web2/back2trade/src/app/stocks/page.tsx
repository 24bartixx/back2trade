import StockList from "@/components/stocks/stock-list";
import { getAllStocks } from "@/lib/stocks";

export default async function StocksPage() {
  const stocksData = await getAllStocks();

  return (
    <>
      <div className="w-full">Searching bar</div>
      <StockList stocksData={stocksData} />
    </>
  );
}
