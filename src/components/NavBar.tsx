import { Link } from "react-router-dom";

import logo from "@/assets/saturn-logo.svg";
import FilAddressForm from "@/components/FilAddressForm";

function NavBar({ className }: { className?: string }) {
  return (
    <div className={`navbar ${className}`}>
      <div className="container mx-auto flex items-center p-4">
        <Link to="/">
          <img src={logo} className="w-40 -translate-x-[12px]" alt="logo"></img>
        </Link>
        <FilAddressForm className="ml-auto" />
      </div>
    </div>
  );
}

export default NavBar;
