import FilAddressForm from "@/components/FilAddressForm";
import logo from "@/assets/saturn-logo.svg";

export default function Home() {
  return (
    <div className="mx-auto mt-32 flex flex-col items-center text-center">
      <img src={logo} className="mb-4 w-96" alt="logo"></img>
      <p className="mb-16 text-lg">View your Saturn Node's FIL earnings, performance metrics, and more.</p>
      <FilAddressForm size="lg" autoFocus />
    </div>
  );
}
