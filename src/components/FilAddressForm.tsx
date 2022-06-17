import { FormEvent, useState } from 'react'
import { validateAddressString } from '@glif/filecoin-address'
import SearchIcon from './SearchIcon'
import { useNavigate } from 'react-router-dom'

function FilAddressForm () {
    const [address, setAddress] = useState('')
    const [isValid, setIsValid] = useState(true)
    const navigate = useNavigate()

    const id = 'fil-address'

    const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        setIsValid(true)

        if (address) {
            if (validateAddressString(address)) {
                navigate(`/address/${address}`)
            } else {
                setIsValid(false)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className={'block w-[100%]'}>
            <label className="block mb-1" htmlFor={id}>
                Enter your Saturn Node's FIL address
            </label>
            <div className="relative max-w-[560px] w-[100%] m-auto">
                <input
                    id={id}
                    className="w-[100%] h-12 rounded bg-slate-200 text-black text-2xl text-center pl-4 py-2 pr-12"
                    value={address}
                    placeholder="Search for FIL address"
                    onChange={e => setAddress(e.target.value)}
                    required/>
                <span onClick={handleSubmit}>
                    <SearchIcon className={`absolute right-2 top-0 bottom-0 w-8 h-8 m-auto cursor-pointer
                      text-black hover:text-sky-700`} />
                </span>
            </div>
            {!isValid && <p className="text-red-500">Invalid FIL address</p>}
        </form>
    )
}

export default FilAddressForm
