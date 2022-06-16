import FilAddressForm from './FilAddressForm'

const logoURL = new URL('./assets/saturn-logo.svg', import.meta.url).href

function Home () {
    return (
        <div className="flex flex-col items-center mt-32 mx-auto text-center">
            <img src={logoURL} className="w-96 mb-4" alt="logo"></img>
            <p className="text-lg mb-16">
                View your Saturn Node's FIL earnings, performance metrics, and more.
            </p>
            <FilAddressForm></FilAddressForm>
        </div>
    )
}

function App () {
    return (
        <div className="flex h-screen container mx-auto p-2">
            <Home />
        </div>
    )
}

export default App
