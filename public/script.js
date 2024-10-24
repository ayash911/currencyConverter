const api_url =
  "https://openexchangerates.org/api/latest.json?app_id=f143475d602947aab7696546236a4df8";
let data = {};
let currencySymbols = {};
const container = document.getElementById("cont");

async function logMessage(message) {
  try {
    await fetch("/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    console.error("Error logging message:", error);
  }
}

// Example usage:
logMessage("Currency rates fetched successfully.");

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
    const response = await fetch("/assets/symbols");
    if (response.ok) {
      currencySymbols = await response.json();
    }
  } catch (error) {
    console.error("Error fetching currency symbols:", error);
  }
}

async function fetchCurrencies() {
  try {
    const response = await fetch("/assets/currencies");
    if (response.ok) {
      const currenciesData = await response.json();
      populateDropdowns(currenciesData);
    }
  } catch (error) {
    console.error("Error fetching currency data:", error);
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
  logMessage(`CURRENCY SYMBOLS POPULATED AT ${currentTime2}`);
}

fetchCurrencies();
fetchCurrencySymbols();
