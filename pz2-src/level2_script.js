function renderTable(data) {
  const keys = Object.keys(data[0]);
  const thead = keys.map(k => `<th>${k}</th>`).join('');
  const tbody = data.map(row =>
    `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`
  ).join('');
  return `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
}

function renderBarChart(data, labelKey, valueKey, title) {
  const max = Math.max(...data.map(r => r[valueKey]));
  const bars = data.map(row => {
    const pct = (row[valueKey] / max * 100).toFixed(1);
    return `
      <div class="bar-row">
        <span class="bar-label">${row[labelKey]}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${row[valueKey].toLocaleString()}</span>
      </div>`;
  }).join('');
  return `<p class="chart-title">${title}</p><div class="bar-chart">${bars}</div>`;
}

async function init() {
  const response = await fetch('data.json');
  const text = await response.text();
  const data = JSON.parse(text);

  document.getElementById('table-container').innerHTML = renderTable(data);
  document.getElementById('sales-chart').innerHTML = renderBarChart(data, 'model', 'price_usd', 'Price (USD)');
  document.getElementById('rating-chart').innerHTML = renderBarChart(data, 'model', 'rating', 'User Rating (out of 5)');
}

init();
