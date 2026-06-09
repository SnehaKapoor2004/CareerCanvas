import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../app/features/authSlice';


const Navbar = () => {
   const {user} = useSelector(state =>state.auth)
  const dispatch = useDispatch()
    const navigate = useNavigate();
    const logoutUser = () => {
        //logout logic
        navigate('/');
        dispatch(logout())
    }
  return (
    <div className='shadow bg-white'>
        <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-late-800 transition-all'>
        <Link to='/'>
        <img src={logo} alt="logo" className="h-11 w-auto" />
        </Link>  
        <div className='flex items-center gap-4 text-sm'>
            <p className='max-sm:hidden'>Hi, {user?.name}</p>
           <button
  onClick={logoutUser}
  className="
    bg-white
    text-gray-700
    border border-gray-300
    px-6 py-1.5
    rounded-full
    shadow-sm
    hover:bg-gray-50
    hover:border-gray-400
    active:scale-95
    transition-all
    font-medium
  "
>
  Logout
</button>

        </div>
        </nav>
    </div>
  )
}

export default Navbar