"use client";

// import Link from "next/link";
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

type Props = {
  stocksData: Stock[];
};

export default function StockList({ stocksData }: Props) {
  // return (
  // <div className="flex flex-col mx-10 gap-5">
  //   {stocksData.map((stock) => {
  //     return (
  //     //   <Card>
  //     //     <CardHeader>
  //     //       <h1 className="text-3xl">{stock.symbol}</h1>
  //     //     </CardHeader>
  //     //     <></>
  //     //   </Card>
  //     // );
  //     return (
  //       <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
  //         <div
  //           key={stock.symbol}
  //           className="flex items-center justify-between rounded-2xl shadow-md bg-gray dark:bg-neutral-900 border border-black/5 p-6"
  //         >
  //           <div className="items-center flex gap-12">
  //             <h1 className="text-3xl">{stock.symbol}</h1>
  //             <div>
  //               <h2 className="text-2xl">{stock.companyName}</h2>
  //               <p>{stock.industry}</p>
  //             </div>
  //           </div>
  //           <h1>${stock.price.toString()}</h1>
  //         </div>
  //       </Link>
  //     );
  //   })}
  // </div>
  // );
}
