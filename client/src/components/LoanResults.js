// client/src/components/LoanResults.js

import React, { useState } from "react";
import "./LoanResults.sass"

const API_BASE_URL = process.env.REACT_APP_API_URL + process.env.REACT_APP_API_ENDPOINT

const LoanResults = ({results}) => {
    const [email, setEmail] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSending(true)
        setMessage('')

        try {
            const response = await fetch(API_BASE_URL + 'send-email', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, loanData: results})
            })

            const data = await response.json()

            if (response.ok) {
                setMessage("Расчёт отправлен на email")
                setEmail("")
            } else {
                setMessage("Произошла ошибка при отправке: " + (data.error || 'Неизвестная ошибка'))
            }
        } catch (error) {
            setMessage("Произошла ошибка при отправке: " + (error.message || 'Сетевая ошибка'))
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="results bordered">
            <h2>Результат расчёта</h2>
            <div className="result">
                <h3>Тип кредита: </h3>
                <p className="big-text">{results.name}</p>
            </div>
            <div className="result">
                <h3>Ежемесячный платёж: </h3>
                <p className="big-text">{results.monthlyPayment.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="result">
                <h3>Общая сумма выплат: </h3>
                <p className="big-text">{results.totalPayment.toLocaleString('ru-RU')} ₽</p>
            </div>

            <form onSubmit={handleSubmit} className="email-form">
                <div className="email-input">
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите email"
                        required
                        disabled={isSending}
                    />
                    <button type="submit" disabled={isSending || !email} className="green-button">
                        {isSending? "Отправка..." : "Отправить на email"}
                    </button>
                </div>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    )
}

export default LoanResults