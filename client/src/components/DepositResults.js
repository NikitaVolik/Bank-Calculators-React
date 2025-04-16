// client/src/components/DepositResults.js
import "./LoanResults.sass"

const DepositResults = ({results}) => {
    return (
        <div className="results bordered">
            <h2>Результат расчёта</h2>
            <div className="result">
                <h3>Тип вклада: </h3>
                <p className="big-text">{results.name}</p>
            </div>
            <div className="result">
                <h3>Срок: </h3>
                <p className="big-text">{results.termYears} лет {results.fixedTermMonths > 0 ? "(Фиксированный)" : ""}</p>
            </div>
            <div className="result">
                <h3>Итоговая сумма: </h3>
                <p className="big-text">{results.totalAmount.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="result">
                <h3>Доход: </h3>
                <p className="big-text">{results.interest.toLocaleString('ru-RU')} ₽</p>
            </div>
        </div>
    )
}

export default DepositResults