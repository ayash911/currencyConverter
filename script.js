const api_url =
  "https://openexchangerates.org/api/latest.json?app_id=f143475d602947aab7696546236a4df8";
let data = {};
let currencySymbols = {};
const container = document.getElementById("cont");

async function logMessage(message) {
  const logToLocal = async () => {
    if (window.location.hostname === "localhost") {
      console.log("local");
      try {
        await fetch("/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });
      } catch (error) {
        console.error("Error logging message locally:", error);
      }
    }
  };

  const logToLoggly = async () => {
    try {
      const logglyData = {
        message: message,
        token: "7080c1dc-be9c-4ae1-b840-c2edb5960ca4",
        tags: ["Winston-NodeJS"],
      };
      await fetch(
        "https://logs-01.loggly.com/inputs/7080c1dc-be9c-4ae1-b840-c2edb5960ca4/tag/Winston-NodeJS/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(logglyData),
        }
      );
    } catch (error) {
      console.error("Error logging to Loggly:", error);
    }
  };

  await Promise.all([logToLocal(), logToLoggly()]);
}

async function fetchRates() {
  try {
    const response = await fetch(api_url);
    data = await response.json();
    let currentTime = new Date();
    await logMessage(`RATES FETCHED AT ${currentTime}`);
  } catch (error) {
    await logMessage(`Error fetching exchange rates: ${error}`);
  }
}

fetchRates();

async function fetchCurrencySymbols() {
  try {
    const response = await fetch("./assets/symbols.json");
    if (response.ok) {
      currencySymbols = await response.json();
      await logMessage("Currency symbols fetched successfully.");
    }
  } catch (error) {
    await logMessage(`Error fetching currency symbols: ${error}`);
  }
}

async function fetchCurrencies() {
  try {
    const response = await fetch("./assets/currencies.json");
    if (response.ok) {
      const currenciesData = await response.json();
      populateDropdowns(currenciesData);
    }
  } catch (error) {
    await logMessage(`Error fetching currency data: ${error}`);
  }
}

function populateDropdowns(currencies) {
  const fromCurrency = document.getElementById("fromCurrency");
  const toCurrency = document.getElementById("toCurrency");

  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";

  currencies.forEach((currency) => {
    const option = document.createElement("option");
    option.value = currency.symbol;
    option.textContent = `${currency.symbol} - ${currency.name}`;
    fromCurrency.appendChild(option.cloneNode(true));
    toCurrency.appendChild(option);
  });

  let currentTime2 = new Date();
  logMessage(`CURRENCY SYMBOLS POPULATED AT ${currentTime2}`);
}

function updateCurrencySymbol() {
  const selectedCurrency = document.getElementById("fromCurrency").value;
  const symbolDisplay = document.querySelector(".symbol");
  symbolDisplay.textContent = currencySymbols[selectedCurrency] || "";
  let currentTime2 = new Date();
  logMessage(`UPDATED CURRENCY SYMBOLS AT ${currentTime2}`);
}

function swapCurrencies() {
  const fromCurrency = document.getElementById("fromCurrency");
  const toCurrency = document.getElementById("toCurrency");
  [fromCurrency.value, toCurrency.value] = [
    toCurrency.value,
    fromCurrency.value,
  ];

  const img = document.querySelector("img");
  img.style.transform = "rotate(180deg)";

  updateCurrencySymbol();

  setTimeout(() => {
    img.style.transform = "rotate(0deg)";
  }, 300);
}

document.querySelector("img").addEventListener("click", swapCurrencies);
document
  .getElementById("fromCurrency")
  .addEventListener("change", updateCurrencySymbol);

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const fromCurrencyValue = document.getElementById("fromCurrency").value;
  const toCurrencyValue = document.getElementById("toCurrency").value;

  if (isNaN(amount)) {
    alert("Please enter a valid amount.");
    return;
  }

  const fromRate = data.rates[fromCurrencyValue];
  const toRate = data.rates[toCurrencyValue];

  if (!fromRate || !toRate) {
    alert("Currency data is not available.");
    return;
  }

  const convertedAmount = ((amount * toRate) / fromRate).toFixed(3);
  document.getElementById(
    "result"
  ).textContent = `${amount} ${fromCurrencyValue} = ${convertedAmount} ${toCurrencyValue}`;
  const liveTime = new Date(data.timestamp * 1000).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  document.getElementById(
    "rate"
  ).textContent = `Live rate as of ${liveTime} IST`;

  document.getElementById("rate2").textContent = `1 ${fromCurrencyValue} = ${(
    toRate / fromRate
  ).toFixed(3)} ${toCurrencyValue}`;

  let currentTime2 = new Date();
  logMessage(`CONVERSION DONE AT ${currentTime2}`);
}

fetchCurrencies();
fetchCurrencySymbols();
