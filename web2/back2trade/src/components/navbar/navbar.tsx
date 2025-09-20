import { Button } from "../ui/button";

const Navbar = () => (
  <div className="w-full bg-black h-[15vh]">
    <div className="flex flex-row l justify-between mx-52 text-center h-full items-center">
      <div className="flex flex-row gap-16">
        <h1 className="text-white text-2xl">Back2Trade</h1>
        <Button variant="link" className="text-white text-lg">
          Home
        </Button>
      </div>
      <div>
        <Button variant="link" className="text-white text-lg">
          Login
        </Button>
        <Button variant="link" className="text-red-400 text-lg">
          Logout
        </Button>
      </div>
    </div>
  </div>
);
export default Navbar;
