// client/src/components/EditLoanModal.js

import { useState } from "react";
import React from "react";
import "./EditLoanModal.sass"

const API_BASE_URL = process.env.REACT_APP_API_URL + process.env.REACT_APP_API_ENDPOINT

const EditLoanModal = ({loan, onClose, onUpdate}) => {

    console.log(loan)
    const [updatedLoan, setUpdatedLoan] = useState({...loan})
    const [error, setError] = useState('')
    const token = localStorage.getItem('token')
    
    const handleSave = async () => {
        try {
            setUpdatedLoan({...updatedLoan, annualRate: Number(updatedLoan.annualRate)})
            console.log(updatedLoan)
            const response = await fetch(API_BASE_URL + 'types/', {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedLoan)
            })
            if (response.ok) {
                onUpdate()
                onClose()
            } else {
                const data = await response.json()
                console.log(response)
                setError('Ошибка при обновлении кредита: '  + data.details ? data.details : data.error)
            }
        } catch (err) {
            setError('Ошибка соединения с сервером', err)
        }
    }

    return (
        <div className="modal-overlay edit-loan">
            <div className="modal bordered">
                <h3>Изменение кредита <b>{loan.loanType}</b></h3>
                {error && <p className="error-text">{error}</p>}
                <input 
                    type="text" 
                    value={updatedLoan.name} 
                    onChange={(e) => setUpdatedLoan({...updatedLoan, name: e.target.value})}
                />
                <input 
                    type="text" 
                    value={updatedLoan.description} 
                    onChange={(e) => setUpdatedLoan({...updatedLoan, description: e.target.value})}
                />
                <input 
                    type="number" 
                    value={updatedLoan.annualRate} 
                    onChange={(e) => setUpdatedLoan({...updatedLoan, annualRate: Number(e.target.value)})}
                />
                <div className="wrapper">
                    <button className="button green-button" onClick={handleSave}>Сохранить</button>
                    <button className="close-btn" onClick={onClose}>Отменить</button>
                </div>
            </div>
        </div>
    )
}

export default EditLoanModal