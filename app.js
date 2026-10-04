const API_KEY = '6c6056043babf828043776ddcdc64e82';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const MAX_HISTORY = 5;

const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const historyRow = document.getElementById('historyRow');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const weatherResultEl = document.getElementById('weatherResult');
const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');

const showLoading = () => {
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  weatherResultEl.classList.add('hidden');
};

const showError = (message) => {
  loadingEl.classList.add('hidden');
  weatherResultEl.classList.add('hidden');
  errorEl.textContent = `⚠️ ${message}`;
  errorEl.classList.remove('hidden');
};

const showResult = (data) => {
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');

  const { name, main, weather, wind } = data;
  const iconCode = weather[0].icon;

  cityNameEl.textContent = name;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconEl.alt = weather[0].description;
  temperatureEl.textContent = `${Math.round(main.temp)}°C`;
  descriptionEl.textContent = weather[0].description;
  humidityEl.textContent = `Kelembaban: ${main.humidity}% · Angin: ${wind.speed} m/s`;

  weatherResultEl.classList.remove('hidden');
};

const getHistory = () => {
  const saved = localStorage.getItem('weatherHistory');
  return saved ? JSON.parse(saved) : [];
};

const saveToHistory = (city) => {
  let history = getHistory();

history = history.filter((item) => item.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  history = history.slice(0, MAX_HISTORY);

  localStorage.setItem('weatherHistory', JSON.stringify(history));
  renderHistory();
};

const renderHistory = () => {
  const history = getHistory();

historyRow.innerHTML = history
    .map((city) => `<button type="button" class="history-tag" data-city="${city}">${city}</button>`)
    .join('');
};

historyRow.addEventListener('click', (event) => {
  const tag = event.target.closest('.history-tag');
  if (!tag) return;
  const city = tag.dataset.city;
  cityInput.value = city;
  fetchWeather(city);
});

const fetchWeather = async (city) => {
  showLoading();

  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;

  try {
    const response = await fetch(url);

    if (response.status === 404) {
      showError(`Kota "${city}" tidak ditemukan. Coba cek penulisannya.`);
      return;
    }

    if (!response.ok) {
      showError('Terjadi kesalahan pada server. Coba lagi nanti.');
      return;
    }

    const data = await response.json();
    showResult(data);
    saveToHistory(data.name);

  } catch (error) {
    // Error handling: masalah jaringan (internet mati, dll)
    showError('Gagal terhubung ke internet. Periksa koneksi kamu.');
    console.error('Network error:', error);
  }
};

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return;

  fetchWeather(city);
});

renderHistory();