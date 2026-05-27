const map = L.map('map').setView([48.9215, 24.7097], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const form = document.getElementById('event-form');
const nameInput = document.getElementById('event-name');
const typeSelect = document.getElementById('event-type');
const dateInput = document.getElementById('event-date');
const cancelBtn = document.getElementById('cancel-btn');

let pendingLatLng = null;

map.on('click', (e) => {
  pendingLatLng = e.latlng;
  form.style.display = 'block';
  nameInput.focus();
});

document.getElementById('add-btn').addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name || !pendingLatLng) return;

  const date = dateInput.value;
  const type = typeSelect.value;

  const marker = L.marker(pendingLatLng).addTo(map);
  marker.bindPopup(`
    <strong>${name}</strong><br>
    Type: ${type}<br>
    ${date ? `Date: ${date}` : ''}
  `).openPopup();

  nameInput.value = '';
  dateInput.value = '';
  form.style.display = 'none';
  pendingLatLng = null;
});

cancelBtn.addEventListener('click', () => {
  form.style.display = 'none';
  pendingLatLng = null;
});
