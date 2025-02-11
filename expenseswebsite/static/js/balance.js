const updateBalanceUI = async () => {
  try {
      const response = await fetch("/api/balance/");
      const data = await response.json();

      document.querySelector(".total-income").textContent = `$${data.total_income}`;
      document.querySelector(".total-expenses").textContent = `$${data.total_expenses}`;
      document.querySelector(".remaining-balance").textContent = `$${data.balance}`;
  } catch (error) {
      console.error("Error fetching balance data:", error);
  }
};

// Run when the page loads
window.onload = () => {
  updateBalanceUI();
};
