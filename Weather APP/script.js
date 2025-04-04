// script.js
// 配置信息
const CONFIG = {
  API_KEY: 'c5439fb6e5a8f981e64150ff8fd45962', 
  API_URL: 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=',
  HISTORY_MAX: 5
};

// DOM元素
const dom = {
  searchBtn: document.getElementById('search-btn'),
  cityInput: document.getElementById('city-input'),
  weatherInfo: document.getElementById('weather-info'),
  historyList: document.getElementById('history-list')
};

// 状态管理
const state = {
  searchHistory: JSON.parse(localStorage.getItem('weatherHistory')) || []
};

/* 事件监听 */
document.addEventListener('DOMContentLoaded', initApp);

dom.searchBtn.addEventListener('click', handleSearch);
dom.cityInput.addEventListener('keypress', e => e.key === 'Enter' && handleSearch());
dom.historyList.addEventListener('click', handleHistoryClick);

/* 核心功能 */
async function initApp() {
  renderHistory();
  if (state.searchHistory.length > 0) {
    getWeatherData(state.searchHistory[0]);
  }
}

async function handleSearch() {
  const city = dom.cityInput.value.trim();
  if (!city) return showError('请输入城市名称');
  getWeatherData(city);
}

async function getWeatherData(city) {
  try {
    const response = await fetch(`${CONFIG.API_URL}${city}&appid=${CONFIG.API_KEY}`);
    
    if (!response.ok) {
      throw new Error(response.status === 404 ? '城市未找到' : '获取数据失败');
    }

    const data = await response.json();
    updateUI(data);
    updateHistory(city);
    dom.cityInput.value = '';
    
  } catch (error) {
    showError(error.message);
  }
}

/* 界面更新 */
function updateUI(data) {
  const { name, main, weather, wind } = data;
  dom.weatherInfo.innerHTML = `
    <h2>${name}</h2>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" 
         alt="${weather[0].description}">
    <p>🌡️ ${Math.round(main.temp)}°C (体感 ${Math.round(main.feels_like)}°C)</p>
    <p>💧 湿度: ${main.humidity}%</p>
    <p>🌪️ 风速: ${wind.speed} m/s</p>
    <p>🌈 ${weather[0].description}</p>
  `;
}

function updateHistory(city) {
  state.searchHistory = state.searchHistory.filter(item => item !== city);
  state.searchHistory.unshift(city);
  
  if (state.searchHistory.length > CONFIG.HISTORY_MAX) {
    state.searchHistory.pop();
  }
  
  localStorage.setItem('weatherHistory', JSON.stringify(state.searchHistory));
  renderHistory();
}

function renderHistory() {
  dom.historyList.innerHTML = state.searchHistory
    .map(city => `<li>${city}</li>`)
    .join('');
}

/* 辅助功能 */
function handleHistoryClick(e) {
  if (e.target.tagName === 'LI') {
    getWeatherData(e.target.textContent);
  }
}

function showError(message) {
  dom.weatherInfo.innerHTML = `<div class="error">❌ ${message}</div>`;
  setTimeout(() => dom.weatherInfo.innerHTML = '', 3000);
}