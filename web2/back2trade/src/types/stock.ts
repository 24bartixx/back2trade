type StockSymbol = {
  symbol: string;
};

type StockCompanyName = {
  name: string;
  finnhubIndustry: string;
};

type StockPrice = { c: number };

type Stock = {
  symbol: string;
  companyName: string;
  industry: string;
  price: Number;
};
