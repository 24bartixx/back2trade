import Logo from "@/components/components/logo";
import { getAllCryptoSymbols } from "@/lib/cryptos";

export default async function Home() {
  const symbols = await getAllCryptoSymbols();

  return <Logo symbolsList={symbols} />;
}
