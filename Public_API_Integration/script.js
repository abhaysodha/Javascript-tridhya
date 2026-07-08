let cachedRates = null;
let cachedBase = null;

function fetchRates(base) {
  console.log("Fetching rates for:", base);
  statusEl.textContent = "Fetching latest rates...";

  return fetch(`https://open.er-api.com/v6/latest/${base}`)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network error, try again");
      }
      return response.json();
    })
    .then(function (data) {
      if (data.result != "success") {
        throw new Error("API returned Error");
      }
      cachedRates = data.rates;
      cachedBase = base;
      console.log("fetched fresh..!");
      statusEl.textContent = "Rates updated ";
      return data.rates;
    })
    .catch(function (err) {
      console.log("Error : ", err.message);
      statusEl.textContent = "Error: " + err.message;
      throw err;
    });
}

function getRates(base) {
  if (cachedRates && cachedBase === base) {
    console.log("Data is returned from cached");
    statusEl.textContent = "Using cached rates";
    return Promise.resolve(cachedRates);
  }
  return fetchRates(base);
}

function currencyCoverting(amount, from, to, rates) {
  if (!amount || isNaN(amount)) return null;

  const rateForm = rates[from];
  const rateTo = rates[to];

  const amountInbase = amount / rateForm;
  const converted = amountInbase * rateTo;

  return converted.toFixed(4);
}

function debounce(callback, dealy) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    console.log("timer is cleared");
    timer = setTimeout(function () {
      console.log("tiemer is active...");
      callback(...args);
    }, dealy);
  };
}

async function handleConversion(amount, from, to) {
  try {
    const rates = await getRates(from);
    const result = currencyCoverting(amount, from, to, rates);
    console.log(`result : ${result} ${to}`);
    resultEl.textContent = `Result: ${result} ${to}`;
  } catch (err) {
    console.log("conversion failed", err.message);
    resultEl.textContent = "Conversion failed";
  }
}



function populateDropdowns(rates) {
  const currencyCodes = Object.keys(rates);

  const optionsHTML = currencyCodes
    .map(code => `<option value="${code}">${code}</option>`)
    .join('');

  fromSelect.innerHTML = optionsHTML;
  toSelect.innerHTML = optionsHTML;

  fromSelect.value = "USD";
  toSelect.value = "INR";
}

const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const resultEl = document.getElementById('result');
const statusEl = document.getElementById('status');


fetchRates("USD").then(function (rates) {
  populateDropdowns(rates);
});

function handleInput() {
  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!amount) {
    resultEl.textContent = "Result: --";
    return;
  }

  handleConversion(amount, from, to);
}


const debouncedHandleInput = debounce(handleInput, 500);

amountInput.addEventListener('input', debouncedHandleInput);
fromSelect.addEventListener('change', handleInput);
toSelect.addEventListener('change', handleInput);