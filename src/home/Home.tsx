import FilAddressForm from '@/components/FilAddressForm'
import logo from '@/assets/saturn-logo.svg'

export default function Home () {
    return (
        <div className="flex flex-col items-center mt-32 mx-auto text-center">
            <img src={logo} className="w-96 mb-4" alt="logo"></img>
            <p className="text-lg mb-16">
                View your Saturn Node's FIL earnings, performance metrics, and more.
            </p>
            <FilAddressForm size="lg" autoFocus/>
        </div>
    )
}
