import Link from "next/link";
import { Button } from "../ui/button";

const Navbar = () => (
  <div className="w-full bg-black h-[10vh]">
    <div className="flex flex-row l justify-between mx-52 text-center h-full items-center">
      <Link href="/">
        <h1 className="text-white text-2xl">Back2Trade</h1>
      </Link>

      <div>
        <Button variant="link" className="text-white text-lg">
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="link" className="text-red-400 text-lg">
          <Link href="/login">Logout</Link>
        </Button>
      </div>
    </div>
  </div>
);
export default Navbar;
