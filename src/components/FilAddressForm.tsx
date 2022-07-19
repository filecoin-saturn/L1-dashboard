import { validateAddressString } from '@glif/filecoin-address'
import classNames from 'classnames'
import { FormEvent, useEffect, useState } from 'react'

import SearchIcon from './SearchIcon'
import { useNavigate } from 'react-router-dom'

// Address with data: f16m5slrkc6zumruuhdzn557a5sdkbkiellron4qa

interface FilAddressFormProps {
    address?: string
    autoFocus?: boolean
    size?: 'md' | 'lg'
    className?: string
}

function FilAddressForm (props: FilAddressFormProps) {
    const [address, setAddress] = useState(props.address ?? '')
    const [isValid, setIsValid] = useState(true)
    const navigate = useNavigate()

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        handleAddress()
    }

    const handleAddress = () => {
        setIsValid(true)

        if (address) {
            if (validateAddressString(address)) {
                navigate(`/address/${address}`)
            } else {
                setIsValid(false)
            }
        }
    }

    useEffect(() => {
        if (address && !validateAddressString(address)) {
            setIsValid(false)
        }
    }, [])

    const { size = 'md' } = props
    const isLarge = size === 'lg'
    const inputClasses = classNames({ 'h-12 text-2xl': isLarge })
    const iconClasses = classNames({
        'h-8 w-8': isLarge,
        'h-6 w-6': size === 'md'
    })
    // Sized to a FIL address
    const width = isLarge ? 'max-w-[580px] w-[580px]' : 'max-w-[400px] w-[400px]'

    return (
        <form
            onSubmit={handleSubmit}
            className={`relative flex justify-center ${width} ${props.className ?? ''}`}>
            <input
                className={`flex-1 rounded bg-slate-900 text-slate-100
                    text-center pl-4 py-2 pr-12 ${inputClasses}`}
                value={address}
                placeholder="Enter FIL address"
                onChange={e => setAddress(e.target.value)}
                autoFocus={props.autoFocus}
                required/>
            <button onClick={handleAddress}>
                <SearchIcon className={`absolute right-2 top-0 bottom-0
                    m-auto cursor-pointer text-slate-100 hover:text-sky-700 ${iconClasses}`} />
            </button>
            {!isValid && <p className="absolute top-[105%] text-red-500">Invalid FIL address</p>}
        </form>
    )
}

export default FilAddressForm
