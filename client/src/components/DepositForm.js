// client/src/components/DepositForm.js

const DepositForm = ({amount, termYears, onChange, termDisabled}) => {
    return (
        <>
            <div className="input-line">
                <label>Сумма вклада</label>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => onChange('amount', Number(e.target.value))}
                    min={0}
                />
            </div>
            <div className="input-line">
                <label>Срок (в годах)</label>
                <input 
                    type="number" 
                    value={termYears}
                    onChange={(e) => !termDisabled && onChange('termYears', Number(e.target.value))}
                    min={0}
                    disabled={termDisabled}
                />
            </div>
        </>
    )
}

export default DepositForm