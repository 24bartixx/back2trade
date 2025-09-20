import { HeroGeometric } from "@/components/ui/shadcn-io/shape-landing-hero/index";
import { CryptoSymbol } from "@/types/crypto";

const Logo = ({ symbolsList }: { symbolsList: string[] }) => (
  <HeroGeometric
    title1="Test your "
    title2="trading strategies"
    symbolsList={symbolsList}
  />
);

export default Logo;
