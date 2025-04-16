// client/src/server-api.js

const API_BASE_URL = process.env.REACT_APP_API_URL + process.env.REACT_APP_API_ENDPOINT

export const fetchLoanTypes = () => {
    return fetch(`${API_BASE_URL}types`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Не удалось загрузить данные")
            }
            return response.json()
        })
        .then((data) => {
            console.log("Полученные данные", data)
            return data
        })
        .catch((error) => {
            console.error("Ошибка загрузки", error)
            throw error
        })
}

export const calculateLoan = (loanType, loanAmount, termYears) => {
    return fetch(`${API_BASE_URL}calculate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({loanType, loanAmount, termYears}),
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then((errorData) => {
                throw new Error(errorData.error || "Ошибка при расчёте кредита")
            })
        }
        return response.json()
    })
    .catch((error) => {
        console.error('Ошибка:', error)
        throw error
    })
}

export const fetchDepositTypes = async () => {
    return fetch(`${API_BASE_URL}deposit-types`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки типов вкладов")
            }
            return response.json()
        })
        .then((data) => {
            console.log("Полученные данные", data)
            return data
        })
        .catch((error) => {
            console.error("Ошибка загрузки", error)
            throw error
        })
}

export const calculateDeposit = async (depositType, depositAmount, termYears) => {
    return fetch(`${API_BASE_URL}calculate-deposit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({depositType, depositAmount, termYears})
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then((errorData) => {
                throw new Error(errorData.error || "Ошибка при расчёте депозита")
            })
        }
        return response.json()
    })
    .catch((error) => {
        console.error('Ошибка:', error)
        throw error
    })
}

export const addLoanType = (loanData, token) => 
    fetch(`${API_BASE_URL}types`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(loanData)
    })
    .then((response) => response.json())
    
export const addDepositType = (depositData, token) => {
    return fetch(`${API_BASE_URL}deposit-types`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(depositData)
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then((errorData) => {
                throw new Error(errorData.error || "Ошибка при добавлении депозита")
            })
        }
        return response.json()
    })
}

export const updateLoanType = (loanData, token) => {
    fetch(`${API_BASE_URL}types`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(loanData)
    })
    .then((response) => response.json())
}

export const updateDepositType = (depositData, token) => {
    console.log('updateDepositType')
    return fetch(`${API_BASE_URL}deposit-types`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(depositData)
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then((errorData) => {
                throw new Error(errorData.error || "Ошибка при изменении депозита")
            })
        }
        return response.json()
    })
    .catch((err) => {
        console.error("Ошибка в updatedDeposit", err)
        throw err
    })
}

export const deleteLoanType = (loanType, token) => {
    fetch(`${API_BASE_URL}types/${loanType}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(loanType)
    })
    .then((response) => response.json())
}

export const deleteDepositType = (depositType, token) => {
    return fetch(`${API_BASE_URL}deposit-types/${depositType}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then((errorData) => {
                throw new Error(errorData.error || "Ошибка при удалении депозита")
            })
        }
        return response.json()
    })
}