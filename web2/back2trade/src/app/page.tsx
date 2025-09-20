import GameOptionsDialog from "@/components/game-options/game-options-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <GameOptionsDialog />
    </div>
  );
}
