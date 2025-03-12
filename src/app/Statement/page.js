'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import '../globals.css';
// import { io } from "socket.io-client";


export default function Statement(){
  const [accounts, setAccounts] = useState([]);
  const [transactions_logs, setTransactions_logs] = useState([]);
  const [openDetails, setOpenDetails] = useState({});
  const [mounted, setMounted] = useState(false);
  const [selectedDates, setSelectedDates] = useState("");
  const [searchAmount, setSearchamount] = useState([]);

  useEffect(() => {
    const fetchAccounts = async  () => {
      try {
        const response = await fetch("http://localhost:8000/api/accounts/allAccount");
        

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setAccounts(data);
        console.log("✅ Data received:",data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
    fetchAccounts();
   
    
     console.log("transactions_logs updated:", transactions_logs);
  }, []);
  const fetchTransaction = async (accountId) => {
    try {
      const response = await fetch("http://localhost:8000/api/transaction/allTransaction_logs");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      console.log("fetching transactions...:", data);
      if (!Array.isArray(data)) {
        console.error("❌ Unexpected data format:", data);
        return;
      }

      setTransactions_logs((prev) => ({
        ...prev, [accountId]:data }));
      
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  useEffect(() => {
    accounts.forEach((acc) => {
      fetchTransaction(acc.accountid); 
    });
  }, [accounts]);
  const fetchTransaction_amount = async (accountId,amount) => {
    try {
      const response = await fetch(`http://localhost:8000/api/transaction/ByAmount?amount=${amount}&Id=${accountId}` , {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transaction amounts");
      const data = await response.json();
      console.log("fetching transaction amounts...:", data);
      if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        return;
      }
      setTransactions_logs((prev) => ({...prev, [accountId]:data }));
    } catch (error) {
      console.error("Error fetching transaction amounts:", error);
    }
  };
  const fetchTransactions_logs_date = async  (accountId, date) => {
    try {
      const response = await fetch(`http://localhost:8000/api/transaction/byAccountIdAndDate?Id=${accountId}&date=${date}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();
      console.log("Fetched Data for", accountId, "on", date, ":", data);
      if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        return;
      }
      setTransactions_logs((prev) => ({...prev, [accountId]:data }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleDateChange = (e, accountId) => {
    const selected = e.target.value;
    console.log(`Date changed for account ${accountId}:`, selected);
    setSelectedDates((prevDates) => ({
        ...prevDates,
        [accountId]: selected,
    }));
    fetchTransactions_logs_date(accountId, selected);
    if (!selected) {
      console.log(`Date cleared for account ${accountId}`);
      handleCleared(accountId);
  } else {
      fetchTransactions_logs_date(accountId, selected);
  }
};
const handleCleared = (accountId) => {
  console.log(`Handling date cleared for account ${accountId}`);
  fetchTransaction(accountId);
};
const handleSearch = (e,accountId) => {
  const search = e.target.value;
  console.log(`Handling amount search for account ${accountId}`,search);
  setSearchamount((prevs) => ({
    ...prevs,
    [accountId]: search,
}));
fetchTransaction_amount(accountId, search);
if(!search) {
  handleCleared(accountId);
}else{
  fetchTransaction_amount(accountId, search);
}

};
  const toggleDetails = (index) => {
    setOpenDetails((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  return (
      <div className="flex flex-wrap justify-center gap-10 p-10">
  {accounts.length === 0 ? (
    <p>Loading...</p>
  ) : (
    accounts.map((account, accIndex) => {
      const filteredTransactions = transactions_logs[account.accountid] && Array.isArray(transactions_logs[account.accountid])
      ? transactions_logs[account.accountid]
          .filter((transaction) => {
            const selectedDate = selectedDates[account.accountid];
            const searchAmountValue = searchAmount[account.accountid];
            const transactionmAmount = transaction.amount;
            const transactionDate = transaction.timestamp?.split(" ")[0];
            // if (!selectedDate && !searchAmountValue) {
            //   return transaction.account_id.accountid === account.accountid;
            // }
            // if(searchAmountValue){
            //   return transaction.account_id.accountid === account.accountid && transactionmAmount === searchAmountValue;
            // }
            // if(selectedDate){
            //   return transaction.account_id.accountid === account.accountid && transactionDate === selectedDate;
            // }
            return transaction.account_id.accountid === account.accountid;
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      : [];
    
      return (
        <div key={accIndex} className="w-96  p-5 rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 bg-purple-600 p-4 rounded-lg shadow">
          <h2 className="text-white text-lg font-semibold">{account.accountname}</h2>
          <p className="text-white">{account.accountid}</p>
          <p className="text-white text-xl font-bold mt-2 text-right"> {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                }).format(account.balance)} บาท</p>
        </div>
        <div className="mt-4">
        <label className="block text-gray-600 mb-2">เลือกวันเดือนปีที่ต้องการ</label>
        <input
          type="date"
          className="w-full p-2 border rounded"
          onChange={(e) => handleDateChange(e, account.accountid)}
        />
          </div>
        <div className="mt-3 bg-white  rounded-lg h-64 overflow-y-auto shadow">
        <div className="sticky top-0 z-10 bg-white p-4 shadow-md">
            <div className="flex justify-between font-medium mb-1">

              <span className="text-sm">วัน-เวลา</span>
              <div className="flex items-center gap-2 w-3/4">
              <span className="text-sm">เงินเข้า/เงินออก </span>
              <div className="relative flex-grow">
    
    <input
      type="text"
      placeholder="ค้นหา"
      className="p-1 pl-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      onChange={(e) => handleSearch(e,account.accountid)}
    />
    <svg className="absolute left-2 top-2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 1110.5 4a6.5 6.5 0 016.5 6.5z"></path>
    </svg>
  </div>
  </div>
              
           </div>
            </div>
            
            {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, i) => (
              <div key={i} className="border-b">
                <div
                  className="flex justify-between py-2 cursor-pointer"
                  onClick={() => toggleDetails(`${accIndex}-${i}`)}
                >
                  <span>{transaction.timestamp}</span>
                  <span className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                    {transaction.amount}
                  </span>
                </div>
                {openDetails[`${accIndex}-${i}`] && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p><strong>รายละเอียด:</strong> {transaction.logs_name || "ไม่มีข้อมูล"}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            transactions_logs[account.accountid] ? (
              <p className="text-gray-500">ไม่มีธุรกรรมในวันนี้</p>
            ) : (
              <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            )
          )}
         </div>
          </div>
       
      )
    })
  )
}
</div>
)
}
