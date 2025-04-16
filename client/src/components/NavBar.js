// client/src/components/NavBar.js

import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import AuthModal from "./AuthModal"
import "./NavBar.sass"

const NavBar = () => {
    const [isAuthOpen, setAuthOpen] = useState(false)
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [role, setRole] = useState(localStorage.getItem('role') || '')
    const navigate = useNavigate()
    
    const handleLogin = (userRole) => {
        setRole(userRole)
        localStorage.setItem('role', userRole)
    }

    const handleLogOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        setRole('')
        navigate('/')
    }

    const getLinkClass = ({ isActive }) => ( isActive ? 'active-link' : '')

    const toggleMobileMenu = () => {setMobileMenuOpen(!isMobileMenuOpen)}

    return (
        <nav>
            <img className="line" data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMzY2IiBoZWlnaHQ9IjYiIHZpZXdCb3g9IjAgMCAxMzY2IDYiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPiA8ZGVmcz4gPGxpbmVhckdyYWRpZW50IGlkPSJwcmVmaXhfX2EiIHgxPSIuNTk2JSIgeDI9IjEwMCUiIHkxPSI1MCUiIHkyPSI1MCUiPiA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDBEOTAwIi8+IDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkYwMCIvPiA8L2xpbmVhckdyYWRpZW50PiA8L2RlZnM+IDxwYXRoIGZpbGw9InVybCgjcHJlZml4X19hKSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwSDEzNjZWNkgweiIvPiA8L3N2Zz4=" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMzY2IiBoZWlnaHQ9IjYiIHZpZXdCb3g9IjAgMCAxMzY2IDYiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPiA8ZGVmcz4gPGxpbmVhckdyYWRpZW50IGlkPSJwcmVmaXhfX2EiIHgxPSIuNTk2JSIgeDI9IjEwMCUiIHkxPSI1MCUiIHkyPSI1MCUiPiA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDBEOTAwIi8+IDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkYwMCIvPiA8L2xpbmVhckdyYWRpZW50PiA8L2RlZnM+IDxwYXRoIGZpbGw9InVybCgjcHJlZml4X19hKSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwSDEzNjZWNkgweiIvPiA8L3N2Zz4=" decoding="async" alt="Экосистема Сбера" /> 
            <div className="container nav-area">
                <img className="logo" src="/img/logo.svg" />
                <div className="menu-wrapper">
                    <button className={`burger ${isMobileMenuOpen ? 'opened' : 'closed'}`} onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? "✕" : "☰"}
                    </button>
                    <div className={`menu ${isMobileMenuOpen ? 'open' : ''}`}>
                        <div className="items">
                            <NavLink to='/' className={getLinkClass}>Кредиты</NavLink>
                            <NavLink to='/deposit' className={getLinkClass}>Вклады и накопления</NavLink>
                            {role === 'admin' && <NavLink to='/admin' className={getLinkClass}>Админ</NavLink>}
                        </div>
                        {role ? (<button className="log-out nav-button green-button" onClick={handleLogOut}>Выйти</button>):
                            (<button className="nav-button" onClick={() => setAuthOpen(true)}>Войти</button>)
                        }
                    </div>
                </div>
            </div>
            <AuthModal 
                isOpen = {isAuthOpen}
                onClose = {() => setAuthOpen(false)}
                onLogin = {handleLogin}
            />
        </nav>
    )
}

export default NavBar