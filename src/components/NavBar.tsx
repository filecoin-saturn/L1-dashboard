import classNames from 'classnames'
import { Link } from 'react-router-dom'

import logo from '@/assets/saturn-logo.svg'

function NavBar ({ className }: { className?: string }) {
    const classes = classNames('flex h-24 p-4', className)

    return (
        <div className={classes}>
            <Link to="/">
                <img src={logo} alt="logo"></img>
            </Link>
        </div>
    )
}

export default NavBar
