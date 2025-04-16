// client/src/components/AuthModal.js

import React, { useState } from "react"

const API_BASE_URL = process.env.REACT_APP_API_URL

const AuthModal = ({ isOpen, onClose, onLogin }) => {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(API_BASE_URL + '/api/auth/login', {
                method: 'POST',
                headers: {"content-type": "application/json"},
                body: JSON.stringify({ login, password })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('role', data.role) // Сохраняем роль
                onLogin(data.role)
                onClose()
            } else {
                setError(data.error || "Ошибка входа")
            }
        } catch (err) {
            setError("Ошибка соединения с сервером")
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal bordered">
                <h2>Авторизация</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Логин"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required>
                    </input>
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required>
                    </input>
                    <div className="wrapper">
                        <button type="submit" className="green-button">Войти</button>
                        <button type="button" onClick={onClose} className="close-btn">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AuthModal