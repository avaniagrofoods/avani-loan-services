
const testLoanLead = async () => {
  const payload = {
    name: "Test Loan Lead",
    phone: "918888888888",
    email: "test@loan.com",
    loanType: "Personal Loan",
    amount: "500000",
    source: "Test_Script_Validation"
  };

  console.log("Testing Avani Loan Service API...");
  try {
    const response = await fetch('https://www.avanifinserv.com/api/save-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test Failed:", err.message);
  }
};

testLoanLead();
