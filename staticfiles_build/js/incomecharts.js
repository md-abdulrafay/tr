let incomeChart;
let weeklyIncomeChart;
let yearlyIncomeChart;

const getRandomType = () => {
  const types = [
    "bar",
    "horizontalBar",
    "pie",
    "line",
    "radar",
    "doughnut",
    "polarArea",
  ];
  return types[Math.floor(Math.random() * types.length)];
};

const displayIncomeChart = (data, labels) => {
  const type = getRandomType();
  var ctx = document.getElementById("incomeChart").getContext("2d");
  if (incomeChart) {
    incomeChart.destroy();
  }
  incomeChart = new Chart(ctx, {
    type: type, // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data: {
      labels: labels,
      datasets: [
        {
          label: `Amount (Last 6 months) (${type} View)`,
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 99, 132,0.7)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132,0.7)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "Income Distribution Per Source",
        fontSize: 20,
      },
      legend: {
        display: true,
        position: "right",
        labels: {
          fontColor: "#000",
        },
      },
    },
  });
};

const displayWeeklyIncomeChart = (data, labels) => {
  var ctx = document.getElementById("weeklyIncomeChart").getContext("2d");
  if (weeklyIncomeChart) {
    weeklyIncomeChart.destroy();
  }
  weeklyIncomeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Weekly Income',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Income Over This Week',
        fontSize: 20,
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          fontColor: '#000',
        },
      },
    },
  });
};

const displayYearlyIncomeChart = (data, labels) => {
  var ctx = document.getElementById("yearlyIncomeChart").getContext("2d");
  if (yearlyIncomeChart) {
    yearlyIncomeChart.destroy();
  }
  yearlyIncomeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Yearly Income',
          data: data,
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Income Over This Year',
        fontSize: 20,
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          fontColor: '#000',
        },
      },
    },
  });
};

const getIncomeData = () => {
  console.log("Fetching income chart data");
  fetch("/income/income_category_summary/")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((results) => {
      console.log("Results from API:", results);
      const category_data = results.income_category_data;
      console.log("Category data:", category_data);
      const labels = Object.keys(category_data);
      const data = Object.values(category_data);
      console.log("Labels:", labels);
      console.log("Data:", data);

      if (labels.length === 0 || data.length === 0) {
        console.log("No data available to display.");
        document.getElementById("incomeChart").style.display = "none";
        document.getElementById("noIncomeDataMessage").style.display = "block";
      } else {
        displayIncomeChart(data, labels);
      }

      const weeklyData = results.weekly_income_data;
      const weeklyLabels = Object.keys(weeklyData);
      const weeklyValues = Object.values(weeklyData);

      if (weeklyLabels.length === 0 || weeklyValues.length === 0) {
        console.log("No weekly data available to display.");
        document.getElementById("weeklyIncomeChart").style.display = "none";
        document.getElementById("noWeeklyIncomeDataMessage").style.display = "block";
      } else {
        displayWeeklyIncomeChart(weeklyValues, weeklyLabels);
      }

      const yearlyData = results.yearly_income_data;
      const yearlyLabels = Object.keys(yearlyData);
      const yearlyValues = Object.values(yearlyData);

      if (yearlyLabels.length === 0 || yearlyValues.length === 0) {
        console.log("No yearly data available to display.");
        document.getElementById("yearlyIncomeChart").style.display = "none";
        document.getElementById("noYearlyIncomeDataMessage").style.display = "block";
      } else {
        displayYearlyIncomeChart(yearlyValues, yearlyLabels);
      }
    })
    .catch((error) => {
      console.error("Error fetching chart data:", error);
      document.getElementById("noIncomeDataMessage").innerText = `Error: ${error.message}`;
      document.getElementById("noIncomeDataMessage").style.display = "block";
    });
};

document.addEventListener("DOMContentLoaded", getIncomeData);

document.getElementById("income-summary-link").addEventListener("click", (event) => {
  event.preventDefault();
  getIncomeData();
});
