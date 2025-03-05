import React from "react";

const TransactionForm = ({
  type, // "deposit" or "withdraw"
  phoneNumber,
  setPhoneNumber,
  amount,
  setAmount,
  loading,
  transactionStatus,
  onSubmit
}) => {
  const isDeposit = type === "deposit";
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {isDeposit ? "Deposit via M-Pesa" : "Withdraw to M-Pesa"}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g., 0712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount (KES)</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
            min="10"
            max="150000"
          />
        </div>
        {transactionStatus && (
          <div className={`mb-4 p-2 rounded ${
            transactionStatus.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {transactionStatus}
          </div>
        )}
        <button
          type="submit"
          className={`w-full py-2 ${
            isDeposit ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
          } text-white rounded disabled:bg-gray-300`}
          disabled={loading || !phoneNumber || !amount}
        >
          {loading ? "Processing..." : isDeposit ? "Deposit" : "Withdraw"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;