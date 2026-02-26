(function () {
  const RESORTS = [
    { name: "Hohe Wand Wiese", slug: "hohe-wand-wiese", lat: 48.15, lon: 16.23, distance: "30 min", altitude: 470, lifts: 2 },
    { name: "Unterberg", slug: "unterberg", lat: 47.78, lon: 15.87, distance: "1 hour", altitude: 1342, lifts: 5 },
    { name: "Semmering", slug: "semmering", lat: 47.63, lon: 15.83, distance: "1h 15min", altitude: 1350, lifts: 6 },
    { name: "Stuhleck", slug: "stuhleck", lat: 47.57, lon: 15.78, distance: "1h 20min", altitude: 1774, lifts: 11 },
    { name: "Oetscher", slug: "oetscher", lat: 47.86, lon: 15.22, distance: "2 hours", altitude: 1400, lifts: 7 },
    { name: "Hochkar", slug: "hochkar", lat: 47.72, lon: 14.96, distance: "2 hours", altitude: 1808, lifts: 8 },
    { name: "Annaberg", slug: "annaberg", lat: 47.87, lon: 15.34, distance: "1h 45min", altitude: 1200, lifts: 8 },
    { name: "Moenichkirchen", slug: "moenichkirchen", lat: 47.51, lon: 16.04, distance: "1h 30min", altitude: 1280, lifts: 7 },
    { name: "Obertauern", slug: "obertauern", lat: 47.25, lon: 13.56, distance: "3h 30min", altitude: 2313, lifts: 26 },
    { name: "Hinterstoder", slug: "hinterstoder", lat: 47.69, lon: 14.15, distance: "2h 45min", altitude: 1860, lifts: 12 }
  ];

  // Weather code to description and emoji
  var WEATHER = {
    0:  { desc: "Clear skies",       icon: "\u2600\uFE0F" },
    1:  { desc: "Mostly clear",      icon: "\uD83C\uDF24\uFE0F" },
    2:  { desc: "Partly cloudy",     icon: "\u26C5" },
    3:  { desc: "Overcast",          icon: "\u2601\uFE0F" },
    45: { desc: "Foggy",             icon: "\uD83C\uDF2B\uFE0F" },
    48: { desc: "Icy fog",           icon: "\uD83C\uDF2B\uFE0F" },
    51: { desc: "Light drizzle",     icon: "\uD83C\uDF26\uFE0F" },
    53: { desc: "Drizzle",           icon: "\uD83C\uDF26\uFE0F" },
    55: { desc: "Heavy drizzle",     icon: "\uD83C\uDF27\uFE0F" },
    61: { desc: "Light rain",        icon: "\uD83C\uDF26\uFE0F" },
    63: { desc: "Rain",              icon: "\uD83C\uDF27\uFE0F" },
    65: { desc: "Heavy rain",        icon: "\uD83C\uDF27\uFE0F" },
    66: { desc: "Freezing rain",     icon: "\uD83E\uDEE7" },
    67: { desc: "Heavy freezing rain", icon: "\uD83E\uDEE7" },
    71: { desc: "Light snow",        icon: "\uD83C\uDF28\uFE0F" },
    73: { desc: "Snow",              icon: "\u2744\uFE0F" },
    75: { desc: "Heavy snow",        icon: "\u2744\uFE0F" },
    77: { desc: "Snow grains",       icon: "\u2744\uFE0F" },
    80: { desc: "Rain showers",      icon: "\uD83C\uDF27\uFE0F" },
    81: { desc: "Heavy showers",     icon: "\uD83C\uDF27\uFE0F" },
    82: { desc: "Violent showers",   icon: "\uD83C\uDF27\uFE0F" },
    85: { desc: "Snow showers",      icon: "\uD83C\uDF28\uFE0F" },
    86: { desc: "Heavy snow showers", icon: "\uD83C\uDF28\uFE0F" },
    95: { desc: "Thunderstorm",      icon: "\u26A1" },
    96: { desc: "Thunderstorm + hail", icon: "\u26A1" },
    99: { desc: "Thunderstorm + heavy hail", icon: "\u26A1" }
  };

  function getWeather(code) {
    return WEATHER[code] || { desc: "Unknown", icon: "\u2601\uFE0F" };
  }

  // Get next Saturday and Sunday dates as YYYY-MM-DD
  function getWeekendDates() {
    var now = new Date();
    var day = now.getDay(); // 0=Sun, 6=Sat
    var daysUntilSat = (6 - day + 7) % 7;
    if (daysUntilSat === 0 && now.getHours() < 18) {
      daysUntilSat = 0; // today is Saturday and before 6pm, use this weekend
    } else if (daysUntilSat === 0) {
      daysUntilSat = 7; // Saturday evening, show next weekend
    }
    // If today is Sunday before 6pm, show this weekend (today)
    if (day === 0 && now.getHours() < 18) {
      daysUntilSat = 6; // next Saturday
      // Actually for Sunday, let's just show today
      var sun = new Date(now);
      var sat = new Date(now);
      sat.setDate(sat.getDate() - 1); // yesterday was Saturday
      return {
        sat: formatDate(sat),
        sun: formatDate(sun),
        label: "This Weekend"
      };
    }

    var satDate = new Date(now);
    satDate.setDate(now.getDate() + daysUntilSat);
    var sunDate = new Date(satDate);
    sunDate.setDate(satDate.getDate() + 1);

    // Determine label
    var label = daysUntilSat <= 1 ? "This Weekend" : "This Weekend";

    return {
      sat: formatDate(satDate),
      sun: formatDate(sunDate),
      label: label
    };
  }

  function formatDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatDisplayDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  async function fetchResortForecast(resort, satDate, sunDate) {
    var url = "https://api.open-meteo.com/v1/forecast"
      + "?latitude=" + resort.lat
      + "&longitude=" + resort.lon
      + "&daily=snowfall_sum,temperature_2m_min,temperature_2m_max,weathercode"
      + "&timezone=Europe/Vienna"
      + "&start_date=" + satDate
      + "&end_date=" + sunDate;

    var resp = await fetch(url);
    if (!resp.ok) throw new Error("API error " + resp.status);
    var data = await resp.json();

    var daily = data.daily;
    var totalSnow = 0;
    var minTemp = Infinity;
    var maxTemp = -Infinity;
    var worstWeatherCode = 0;

    for (var i = 0; i < daily.time.length; i++) {
      totalSnow += daily.snowfall_sum[i] || 0;
      if (daily.temperature_2m_min[i] < minTemp) minTemp = daily.temperature_2m_min[i];
      if (daily.temperature_2m_max[i] > maxTemp) maxTemp = daily.temperature_2m_max[i];
      if (daily.weathercode[i] > worstWeatherCode) worstWeatherCode = daily.weathercode[i];
    }

    return {
      name: resort.name,
      slug: resort.slug,
      distance: resort.distance,
      altitude: resort.altitude,
      lifts: resort.lifts,
      snowfall: Math.round(totalSnow * 10) / 10,
      tempMin: Math.round(minTemp),
      tempMax: Math.round(maxTemp),
      weatherCode: worstWeatherCode,
      weather: getWeather(worstWeatherCode)
    };
  }

  async function loadForecasts() {
    var container = document.getElementById("snow-forecast");
    if (!container) return;

    var weekend = getWeekendDates();

    // Show date range in header
    var dateRange = document.getElementById("snow-date-range");
    if (dateRange) {
      dateRange.textContent = formatDisplayDate(weekend.sat) + " - " + formatDisplayDate(weekend.sun);
    }

    try {
      // Fetch all resorts in parallel
      var promises = RESORTS.map(function (r) {
        return fetchResortForecast(r, weekend.sat, weekend.sun);
      });
      var results = await Promise.all(promises);

      // Sort by snowfall (most first)
      results.sort(function (a, b) { return b.snowfall - a.snowfall; });

      // Render winner
      var winner = results[0];
      var winnerEl = document.getElementById("snow-winner");
      if (winnerEl) {
        var snowMessage = winner.snowfall > 0
          ? winner.snowfall + " cm of fresh snow expected!"
          : "Best conditions at " + winner.altitude + " m altitude";

        winnerEl.innerHTML =
          '<div class="snow-winner__icon">' + winner.weather.icon + '</div>' +
          '<div class="snow-winner__body">' +
            '<p class="snow-winner__kicker">Top Pick ' + weekend.label + '</p>' +
            '<h3 class="snow-winner__name">Head to ' + winner.name + '!</h3>' +
            '<p class="snow-winner__detail">' + snowMessage + '</p>' +
            '<p class="snow-winner__meta">' +
              '<span>' + winner.weather.icon + ' ' + winner.weather.desc + '</span>' +
              '<span>' + winner.tempMin + '/' + winner.tempMax + ' &#176;C</span>' +
              '<span>' + winner.distance + ' from Vienna</span>' +
              '<span>' + winner.lifts + ' lifts</span>' +
            '</p>' +
          '</div>';
        winnerEl.classList.add("snow-winner--loaded");
      }

      // Render grid (all resorts)
      var gridEl = document.getElementById("snow-grid");
      if (gridEl) {
        var html = "";
        for (var i = 0; i < results.length; i++) {
          var r = results[i];
          var rank = i + 1;
          var snowLabel = r.snowfall > 0 ? r.snowfall + " cm" : "0 cm";
          html +=
            '<div class="snow-card">' +
              '<div class="snow-card__rank">' + rank + '</div>' +
              '<div class="snow-card__content">' +
                '<div class="snow-card__header">' +
                  '<h4 class="snow-card__name">' + r.name + '</h4>' +
                  '<span class="snow-card__weather">' + r.weather.icon + '</span>' +
                '</div>' +
                '<div class="snow-card__stats">' +
                  '<div class="snow-card__stat">' +
                    '<span class="snow-card__stat-value">' + snowLabel + '</span>' +
                    '<span class="snow-card__stat-label">Snow</span>' +
                  '</div>' +
                  '<div class="snow-card__stat">' +
                    '<span class="snow-card__stat-value">' + r.tempMin + '/' + r.tempMax + '&#176;</span>' +
                    '<span class="snow-card__stat-label">Temp</span>' +
                  '</div>' +
                  '<div class="snow-card__stat">' +
                    '<span class="snow-card__stat-value">' + r.lifts + '</span>' +
                    '<span class="snow-card__stat-label">Lifts</span>' +
                  '</div>' +
                  '<div class="snow-card__stat">' +
                    '<span class="snow-card__stat-value">' + r.distance + '</span>' +
                    '<span class="snow-card__stat-label">Drive</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
        }
        gridEl.innerHTML = html;
      }

      // Hide loading, show content
      var loading = document.getElementById("snow-loading");
      var content = document.getElementById("snow-content");
      if (loading) loading.style.display = "none";
      if (content) content.style.display = "block";

    } catch (err) {
      var loading = document.getElementById("snow-loading");
      if (loading) {
        loading.innerHTML =
          '<p class="snow-error">Could not load snow data. Try refreshing the page.</p>';
      }
    }
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadForecasts);
  } else {
    loadForecasts();
  }
})();
