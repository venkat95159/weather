// ========== script.js ==========
(function() {
  // ----- configuration -----
  const API_KEY = '131083183cd978e839b55a91f5397606';
  let currentUnits = 'metric';
  let currentCityName = 'London';
  let currentWeatherData = null; // store full weather data for popups

  // ----- dom elements -----
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const weatherDiv = document.getElementById('weatherContent');
  const currentLocationBtn = document.getElementById('currentLocationBtn');
  const unitToggle = document.getElementById('unitToggle');
  const unitLabel = document.getElementById('unitLabel');
  const refreshBtn = document.getElementById('refreshBtn');
  const greetingEl = document.getElementById('greetingMsg');

  // ----- popup elements -----
  const popupOverlay = document.getElementById('popupOverlay');
  const popupTitle = document.getElementById('popupTitle');
  const popupContent = document.getElementById('popupContent');
  const popupClose = document.getElementById('popupClose');

  // ========== FIXED GREETING FUNCTION ==========
  function updateGreeting() {
    const hour = new Date().getHours();
    let greet = '';
    let icon = '';

    if (hour >= 5 && hour < 12) {
      greet = 'good morning';
      icon = 'sun';
    } else if (hour >= 12 && hour < 17) {
      greet = 'good afternoon';
      icon = 'sun';
    } else if (hour >= 17 && hour < 21) {
      greet = 'good evening';
      icon = 'moon';
    } else {
      greet = 'good night';
      icon = 'moon';
    }

    greetingEl.innerHTML = `<i class="fas fa-${icon}"></i> ${greet}`;
  }

  // initial call
  updateGreeting();

  // ----- advanced background mapping -----
  function setBackgroundByCondition(condition) {
    const bgMap = {
      Clear: "url('https://images.unsplash.com/photo-1545569341-973eb8501872?q=80&w=2070&auto=format&fit=crop')",
      Clouds: "url('https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=2070&auto=format&fit=crop')",
      Rain: "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop')",
      Thunderstorm: "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop')",
      Snow: "url('https://images.unsplash.com/photo-1483664852095-7321d2e400b4?q=80&w=2070&auto=format&fit=crop')",
      Mist: "url('https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1932&auto=format&fit=crop')",
      Fog: "url('https://images.unsplash.com/photo-1543968996-ee822b8176ba?q=80&w=2070&auto=format&fit=crop')",
      Haze: "url('https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=2006&auto=format&fit=crop')",
      Smoke: "url('https://images.unsplash.com/photo-1504630085234-6e0d1aa4a6d8?q=80&w=1974&auto=format&fit=crop')",
      Dust: "url('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2010&auto=format&fit=crop')"
    };
    const fallback = "url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1965&auto=format&fit=crop')";
    document.body.style.backgroundImage = bgMap[condition] || bgMap['Clear'] || fallback;
  }

  // ----- icon mapper -----
  function getIcon(iconCode) {
    if (!iconCode) return '☁️';
    const code = iconCode.substring(0,2);
    switch(code) {
      case '01': return '<i class="fas fa-sun"></i>';
      case '02': return '<i class="fas fa-cloud-sun"></i>';
      case '03': return '<i class="fas fa-cloud"></i>';
      case '04': return '<i class="fas fa-cloud-meatball"></i>';
      case '09': return '<i class="fas fa-cloud-rain"></i>';
      case '10': return '<i class="fas fa-cloud-sun-rain"></i>';
      case '11': return '<i class="fas fa-cloud-bolt"></i>';
      case '13': return '<i class="fas fa-snowflake"></i>';
      case '50': return '<i class="fas fa-smog"></i>';
      default: return '<i class="fas fa-cloud"></i>';
    }
  }

  // ----- show popup with metric details (ADVANCED) -----
  function showMetricPopup(metricType, value, unit, description, extraInfo) {
    let title = '';
    let icon = '';
    let mainValue = value;
    let detailLines = '';

    // super advanced: different content per metric
    switch(metricType) {
      case 'humidity':
        title = 'Humidity';
        icon = '<i class="fas fa-droplet" style="color: #66ccff;"></i>';
        detailLines = `
          <div style="margin-top: 1.2rem; background: rgba(255,255,255,0.1); border-radius: 24px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>dew point</span>
              <span>${extraInfo.dewPoint ?? '--'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>comfort level</span>
              <span>${value < 30 ? 'dry' : (value < 50 ? 'comfortable' : (value < 70 ? 'muggy' : 'oppressive'))}</span>
            </div>
          </div>
        `;
        break;
      case 'wind':
        title = 'Wind';
        icon = '<i class="fas fa-wind" style="color: #aaccff;"></i>';
        detailLines = `
          <div style="margin-top: 1.2rem; background: rgba(255,255,255,0.1); border-radius: 24px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>gusts</span>
              <span>${extraInfo.gust ?? '--'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>direction</span>
              <span>${extraInfo.direction ?? '--'}</span>
            </div>
          </div>
        `;
        break;
      case 'pressure':
        title = 'Pressure';
        icon = '<i class="fas fa-compress-alt" style="color: #ffd966;"></i>';
        detailLines = `
          <div style="margin-top: 1.2rem; background: rgba(255,255,255,0.1); border-radius: 24px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>sea level</span>
              <span>${extraInfo.seaLevel ?? value} hPa</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>trend</span>
              <span>${extraInfo.trend ?? 'stable'}</span>
            </div>
          </div>
        `;
        break;
      case 'visibility':
        title = 'Visibility';
        icon = '<i class="fas fa-eye" style="color: #b0e0e6;"></i>';
        detailLines = `
          <div style="margin-top: 1.2rem; background: rgba(255,255,255,0.1); border-radius: 24px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>air quality</span>
              <span>${extraInfo.aqi ?? '--'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>condition</span>
              <span>${value > 10 ? 'excellent' : (value > 5 ? 'good' : (value > 2 ? 'moderate' : 'poor'))}</span>
            </div>
          </div>
        `;
        break;
      default: break;
    }

    popupTitle.innerText = title;
    popupContent.innerHTML = `
      ${icon}
      <div class="value-large">${mainValue} ${unit}</div>
      <div class="description">${description}</div>
      ${detailLines}
    `;
    popupOverlay.classList.add('active');
  }

  // ----- close popup -----
  function closePopup() {
    popupOverlay.classList.remove('active');
  }

  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });

  // ----- render weather data with clickable metrics -----
  function renderWeather(data) {
    if (!data) return;
    currentWeatherData = data; // store for popups

    const isMetric = (currentUnits === 'metric');
    const temp = isMetric ? data.main.temp : (data.main.temp * 9/5 + 32);
    const feels = isMetric ? data.main.feels_like : (data.main.feels_like * 9/5 + 32);
    const tempUnit = isMetric ? '°C' : '°F';

    let windSpeed = data.wind.speed;
    let windUnit = isMetric ? 'm/s' : 'mph';
    if (!isMetric) windSpeed = (windSpeed * 2.23694).toFixed(1);

    const visibilityKm = (data.visibility / 1000).toFixed(1);
    const condition = data.weather[0].main;
    setBackgroundByCondition(condition);

    // advanced derived data for popups
    const dewPoint = ((data.main.temp - (100 - data.main.humidity) / 5)).toFixed(1) + (isMetric ? '°C' : '°F');
    const windDir = data.wind.deg ? data.wind.deg + '°' : '--';
    const gust = data.wind.gust ? (isMetric ? data.wind.gust.toFixed(1) + ' m/s' : (data.wind.gust * 2.23694).toFixed(1) + ' mph') : '--';

    const html = `
      <div style="animation: fadeUp 0.6s ease;">
        <div class="weather-main">
          <div class="city-name">
            <i class="fas fa-map-pin"></i> ${data.name}, ${data.sys.country || ''}
          </div>
          <div class="temp-large">
            ${Math.round(temp)}<span class="temp-unit">${tempUnit}</span>
          </div>
          <div class="weather-desc">
            ${getIcon(data.weather[0].icon)}  ${data.weather[0].description} · feels ${Math.round(feels)}${tempUnit}
          </div>
        </div>

        <!-- clickable metric grid -->
        <div class="detail-grid">
          <div class="detail-item" data-metric="humidity" data-value="${data.main.humidity}" data-unit="%" data-desc="relative humidity">
            <i class="fas fa-droplet"></i>
            <div class="detail-label">humidity</div>
            <div class="detail-value">${data.main.humidity}<span class="detail-unit">%</span></div>
          </div>
          <div class="detail-item" data-metric="wind" data-value="${windSpeed}" data-unit="${windUnit}" data-desc="wind speed · gusts ${gust}">
            <i class="fas fa-wind"></i>
            <div class="detail-label">wind</div>
            <div class="detail-value">${windSpeed}<span class="detail-unit"> ${windUnit}</span></div>
          </div>
          <div class="detail-item" data-metric="pressure" data-value="${data.main.pressure}" data-unit="hPa" data-desc="atmospheric pressure">
            <i class="fas fa-compress-alt"></i>
            <div class="detail-label">pressure</div>
            <div class="detail-value">${data.main.pressure}<span class="detail-unit"> hPa</span></div>
          </div>
          <div class="detail-item" data-metric="visibility" data-value="${visibilityKm}" data-unit="km" data-desc="visibility distance">
            <i class="fas fa-eye"></i>
            <div class="detail-label">visibility</div>
            <div class="detail-value">${visibilityKm}<span class="detail-unit"> km</span></div>
          </div>
        </div>
      </div>
    `;
    weatherDiv.innerHTML = html;

    // attach click handlers to detail items
    document.querySelectorAll('.detail-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const metric = item.dataset.metric;
        const value = item.dataset.value;
        const unit = item.dataset.unit;
        const desc = item.dataset.desc;

        // build extra info based on metric
        let extra = {};
        if (metric === 'humidity') extra = { dewPoint };
        else if (metric === 'wind') extra = { gust, direction: windDir };
        else if (metric === 'pressure') extra = { seaLevel: data.main.pressure, trend: 'steady' };
        else if (metric === 'visibility') extra = { aqi: 'good (est)' };

        showMetricPopup(metric, value, unit, desc, extra);
      });
    });
  }

  // ----- fetch weather from API -----
  async function fetchWeather(city, unitSystem) {
    if (!city.trim()) {
      weatherDiv.innerHTML = `<div class="message-area error-chip"><i class="fas fa-exclamation-triangle"></i> enter city</div>`;
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unitSystem}`;
    weatherDiv.innerHTML = `<div class="message-area"><i class="fas fa-spinner fa-pulse"></i> loading</div>`;

    try {
      const resp = await fetch(url);
      const json = await resp.json();
      if (!resp.ok) {
        weatherDiv.innerHTML = `<div class="message-area error-chip"><i class="fas fa-circle-exclamation"></i> ${json.message || 'error'}</div>`;
        return;
      }
      currentCityName = json.name;
      cityInput.value = json.name;
      renderWeather(json);
    } catch (err) {
      weatherDiv.innerHTML = `<div class="message-area error-chip"><i class="fas fa-wifi-slash"></i> network issue</div>`;
    }
  }

  // ----- initial load -----
  fetchWeather('London', currentUnits);

  // ----- event listeners -----
  searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city, currentUnits);
  });

  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const city = cityInput.value.trim();
      if (city) fetchWeather(city, currentUnits);
    }
  });

  unitToggle.addEventListener('click', () => {
    currentUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
    unitLabel.innerText = currentUnits === 'metric' ? '°C' : '°F';
    unitToggle.innerHTML = currentUnits === 'metric' ? 
      '<i class="fas fa-temperature-high"></i> <span id="unitLabel">°C</span>' : 
      '<i class="fas fa-temperature-low"></i> <span id="unitLabel">°F</span>';
    if (currentCityName) fetchWeather(currentCityName, currentUnits);
  });

  refreshBtn.addEventListener('click', () => {
    if (currentCityName) fetchWeather(currentCityName, currentUnits);
    else fetchWeather('London', currentUnits);
  });

  currentLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      weatherDiv.innerHTML = `<div class="message-area error-chip">geolocation not supported</div>`;
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnits}`;
      weatherDiv.innerHTML = `<div class="message-area"><i class="fas fa-spinner fa-pulse"></i> locating</div>`;
      try {
        const resp = await fetch(url);
        const json = await resp.json();
        if (resp.ok) {
          currentCityName = json.name;
          cityInput.value = json.name;
          renderWeather(json);
        } else {
          weatherDiv.innerHTML = `<div class="message-area error-chip">location not found</div>`;
        }
      } catch {
        weatherDiv.innerHTML = `<div class="message-area error-chip">location error</div>`;
      }
    }, () => {
      weatherDiv.innerHTML = `<div class="message-area error-chip">location denied</div>`;
    });
  });

  // update greeting every minute to ensure it changes with time
  setInterval(updateGreeting, 60000);
})();
