// script.js
// 配置信息
const CONFIG = {
  // OpenWeatherMap API的密钥
  API_KEY: 'c5439fb6e5a8f981e64150ff8fd45962', 
  // 获取天气数据的API基础URL，units=metric表示使用摄氏度作为温度单位
  API_URL: 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=',
  // 最大历史记录数量
  HISTORY_MAX: 5
};

// DOM元素引用
const dom = {
  // 搜索按钮元素
  searchBtn: document.getElementById('search-btn'),
  // 城市输入框元素
  cityInput: document.getElementById('city-input'),
  // 显示天气信息的容器
  weatherInfo: document.getElementById('weather-info'),
  // 显示搜索历史的列表
  historyList: document.getElementById('history-list')
};

// 状态管理对象
const state = {
  // 从localStorage中获取天气搜索历史记录，如果不存在则初始化为空数组
  searchHistory: JSON.parse(localStorage.getItem('weatherHistory')) || []
};

/* 事件监听 */
// 当DOM完全加载后，初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 为搜索按钮添加点击事件监听器，触发搜索功能
dom.searchBtn.addEventListener('click', handleSearch);

// 为城市输入框添加键盘事件监听器，当按下回车键时触发搜索功能
dom.cityInput.addEventListener('keypress', e => e.key === 'Enter' && handleSearch());

// 为搜索历史列表添加点击事件监听器，点击历史记录项时再次查询该城市的天气
dom.historyList.addEventListener('click', handleHistoryClick);

/* 核心功能 */
// 初始化应用：渲染搜索历史并根据最近搜索的城市获取天气数据
async function initApp() {
  renderHistory(); // 渲染历史记录列表
  if (state.searchHistory.length > 0) {
    // 如果历史记录不为空，获取最近一次搜索城市的天气数据
    getWeatherData(state.searchHistory[0]);
  }
}

// 处理搜索请求：获取用户输入的城市名称并查询天气数据
async function handleSearch() {
  // 获取用户输入的城市名称，并去除前后空白字符
  const city = dom.cityInput.value.trim();
  // 如果用户没有输入城市名称，则显示错误信息并返回
  if (!city) return showError('请输入城市名称');
  // 查询并显示指定城市的天气数据
  getWeatherData(city);
}

// 获取指定城市的天气数据
async function getWeatherData(city) {
  try {
    // 使用fetch API向OpenWeatherMap发送请求以获取天气数据
    const response = await fetch(`${CONFIG.API_URL}${city}&appid=${CONFIG.API_KEY}`);
    
    // 如果响应状态码不是200-299，则抛出错误信息
    if (!response.ok) {
      throw new Error(response.status === 404 ? '城市未找到' : '获取数据失败');
    }

    // 解析响应体为JSON格式
    const data = await response.json();
    // 更新用户界面以显示最新的天气信息
    updateUI(data);
    // 更新搜索历史记录
    updateHistory(city);
    // 清空输入框
    dom.cityInput.value = '';
    
  } catch (error) {
    // 捕获并显示错误信息
    showError(error.message);
  }
}

/* 界面更新 */
// 更新用户界面以显示天气信息
function updateUI(data) {
  // 解构赋值：从data中提取name, main, weather, wind等属性
  const { name, main, weather, wind } = data;
  // 将天气信息插入到weatherInfo元素中
  dom.weatherInfo.innerHTML = `
    <h2>${name}</h2>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" 
         alt="${weather[0].description}">
    <p>🌡️ 温度: ${Math.round(main.temp)}°C (体感 ${Math.round(main.feels_like)}°C)</p>
    <p>💧 湿度: ${main.humidity}%</p>
    <p>🌪️ 风速: ${wind.speed} m/s</p>
    <p>🌈 天气: ${weather[0].description}</p>
  `;
}

// 更新搜索历史记录
function updateHistory(city) {
  // 过滤掉重复的城市记录
  state.searchHistory = state.searchHistory.filter(item => item !== city);
  // 将新的城市记录添加到历史记录的开头
  state.searchHistory.unshift(city);
  
  // 如果历史记录的数量超过最大限制，则移除最后一个元素
  if (state.searchHistory.length > CONFIG.HISTORY_MAX) {
    state.searchHistory.pop();
  }
  
  // 将更新后的历史记录保存到localStorage中
  localStorage.setItem('weatherHistory', JSON.stringify(state.searchHistory));
  // 渲染历史记录列表
  renderHistory();
}

// 渲染搜索历史记录列表
function renderHistory() {
  // 将历史记录数组转换为HTML列表项字符串并插入到historyList元素中
  dom.historyList.innerHTML = state.searchHistory
    .map(city => `<li>${city}</li>`)
    .join('');
}

/* 辅助功能 */
// 处理历史记录点击事件：根据点击的历史记录项查询天气数据
function handleHistoryClick(e) {
  // 如果点击的元素是<li>标签，则查询该城市名称的天气数据
  if (e.target.tagName === 'LI') {
    getWeatherData(e.target.textContent);
  }
}

// 显示错误信息
function showError(message) {
  // 将错误信息插入到weatherInfo元素中，并添加错误样式
  dom.weatherInfo.innerHTML = `<div class="error">❌ ${message}</div>`;
  // 3秒后自动清除错误信息
  setTimeout(() => dom.weatherInfo.innerHTML = '', 3000);
}
