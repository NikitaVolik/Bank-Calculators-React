// client/src/components/EditDepositModal.js

import { useState } from "react";
import "./EditLoanModal.sass"

const EditDepositModal = ({deposit, onClose, onUpdate}) => {
    const [updatedDeposit, setUpdatedDeposit] = useState({...deposit})
    const [error, setError] = useState('')

    const handleSave = async () => {
        console.log('handleSave +')
        try {
            const depositToSend = {
                ...updatedDeposit,
                annualRate: Number(updatedDeposit.annualRate),
                fixedTermMonths: Number(updatedDeposit.fixedTermMonths) || 0
            }
            console.log('call')
            await onUpdate(depositToSend)
            console.log('sended')
            onClose()
            console.log('closed')
        } catch (error) {
            console.error(error)
            setError("Ошибка при сохранении: " + error.message)
        }
        console.log('handleSave -')
    }
    
    return (
        <div className="modal-overlay edit-loan">
            <div className="modal bordered">
                <h3>Изменение депозита <b>{deposit.depositType}</b></h3>
                {error && <p className="error-text">{error}</p>}
                <input
                    type="text"
                    value={updatedDeposit.name}
                    onChange={(e) => setUpdatedDeposit({...updatedDeposit, name: e.target.value})}
                    />
                <input
                    type="text"
                    value={updatedDeposit.description}
                    onChange={(e) => setUpdatedDeposit({...updatedDeposit, description: e.target.value})}
                    />
                <input
                    type="number"
                    value={updatedDeposit.annualRate}
                    onChange={(e) => setUpdatedDeposit({...updatedDeposit, annualRate: Number(e.target.value)})}
                    />
                <input
                    type="number"
                    placeholder="0 (Без ограничений)"
                    value={updatedDeposit.fixedTermMonths}
                    onChange={(e) => setUpdatedDeposit({...updatedDeposit, fixedTermMonths: Number(e.target.value)})}
                    />
                <div className="wrapper">
                    <button className="button green-button" onClick={handleSave}>Сохранить</button>
                    <button className="close-btn" onClick={onClose}>Отменить</button>
                </div>
            </div>
    </div>
    )
}

export default EditDepositModal