import logo from "../../assets/saturn-logo.svg";
import FilAddressForm from "../../components/FilAddressForm";

export default function Home() {
  return (
    <div className="mx-auto mt-32 flex flex-col items-center text-center text-slate-200">
      <img src={logo} className="mb-4 w-96" alt="logo"></img>
      <p className="mb-16 text-lg">View your Saturn Node's FIL earnings, performance metrics, and more.</p>
      <FilAddressForm size="lg" autoFocus />
    </div>
  );
}
