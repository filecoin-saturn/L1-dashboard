import { FormEvent, useState } from 'react'
import { validateAddressString } from '@glif/filecoin-address'
import SearchIcon from './SearchIcon'
import { useNavigate } from 'react-router-dom'

function FilAddressForm ({ className = '' }: { className?: string }) {
    const [address, setAddress] = useState('')
    const [isValid, setIsValid] = useState(true)
    const navigate = useNavigate()

    const id = 'fil-address'

    const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault()

        if (address && !validateAddressString(address)) {
            setIsValid(false)
        } else {
            setIsValid(true)
            cl('sup')
            navigate(`/address/${address}`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`block w-[100%] ${className}`}>
            <label className="block mb-1" htmlFor={id}>
                Enter your Saturn Node's FIL address
            </label>
            <div className="relative">
                <input
                    id={id}
                    className="max-w-[560px] w-[100%] h-12 rounded text-black text-2xl pl-4 py-2 pr-12"
                    value={address}
                    placeholder="FIL address"
                    onChange={e => setAddress(e.target.value)}
                    required/>
                <span onClick={handleSubmit}>
                    <SearchIcon
                        className={`absolute right-2 top-0 bottom-0 w-8 h-8 m-auto cursor-pointer
                            text-black hover:text-sky-700`} />
                </span>
            </div>
            {!isValid && <p className="text-red-500">Invalid FIL address</p>}
        </form>
    )
}

export default FilAddressForm
