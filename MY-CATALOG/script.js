const SHEET_ID = '1YxVuLvYEQLHJ1FnXcj7nBS0UnMO20zB3p1UzNVkDacQ';
const SHEET_NAME = 'Sheet1';

const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;
const grid = document.getElementById('catalog-grid');
const searchBar = document.getElementById('search-bar');

const statTotal = document.getElementById('stat-total');
const statMale = document.getElementById('stat-male');
const statFemale = document.getElementById('stat-female');

const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

let allStudents = [];
const singleBannerGradient = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';

function detectGender(name) {
  if (!name) return 'Lelaki';
  const uName = name.toUpperCase();
  if (uName.includes(' BINTI ') || uName.includes(' BT ') || uName.includes(' A/P ') || uName.endsWith(' BINTI')) {
    return 'Perempuan';
  }
  return 'Lelaki';
}

function updateTimestamp() {
  if (!statTotal) return;
  
  // Secara automatik bina elemen jika tiada dalam HTML
  let lastUpdatedEl = document.getElementById('last-updated');
  if (!lastUpdatedEl) {
    lastUpdatedEl = document.createElement('div');
    lastUpdatedEl.id = 'last-updated';
    lastUpdatedEl.style.cssText = 'font-size: 11px; color: #64748b; margin-top: 6px; display: flex; align-items: center; gap: 5px; font-weight: 500;';
    statTotal.parentNode.appendChild(lastUpdatedEl);
  }

  const now = new Date();
  const formattedTime = now.toLocaleString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  lastUpdatedEl.innerHTML = `
    <span style="height: 7px; width: 7px; background-color: #10b981; border-radius: 50%; display: inline-block;"></span>
    Masa Live: ${formattedTime}
  `;
}

function displayProducts(items) {
  const total = items.length;
  const maleCount = items.filter(s => detectGender(s["NAME"]) === 'Lelaki').length;
  const femaleCount = items.filter(s => detectGender(s["NAME"]) === 'Perempuan').length;

  if (statTotal) statTotal.textContent = total;
  if (statMale) statMale.textContent = maleCount;
  if (statFemale) statFemale.textContent = femaleCount;

  updateTimestamp();

  if (total === 0) {
    if (grid) grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">Tiada maklumat dijumpai.</p>';
    return;
  }
  
  if (grid) {
    grid.innerHTML = items.map((student, index) => {
      const studentName = student["NAME"] || 'Pelajar';
      const company = student["NAMA PERNIAGAAN"] || student["NAMA SYARIKAT"] || 'N/A';
      const product = student["PRODUK"] || 'N/A';
      
      const gender = detectGender(studentName);
      const genderClass = gender === 'Perempuan' ? 'female' : '';
      const imageStyle = student["IMAGE"] 
        ? `background-image: url('${student["IMAGE"]}');` 
        : `background: ${singleBannerGradient};`;

      return `
        <div class="softr-card" onclick="openModal(${index})">
          <div class="card-banner" style="${imageStyle}">
            <div class="tag-container">
              <span class="tag-badge">Aktif</span>
              <span class="tag-badge tag-gender ${genderClass}">${gender}</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="student-name">${studentName}</h3>
            <div class="company-name">${company}</div>
            <div class="product-name">${product}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openModal(index) {
  const student = allStudents[index];
  if (!student || !modalBody || !modalOverlay) return;

  const studentName = student["NAME"] || 'Pelajar';
  const company = student["NAMA PERNIAGAAN"] || student["NAMA SYARIKAT"] || 'N/A';
  const product = student["PRODUK"] || 'N/A';
  const race = student["BANGSA"] || 'N/A';
  const ssuNo = student["SSU"] || 'N/A';
  const ssmNo = student["SSM"] || 'N/A';
  const milikan = student["JENIS MILIKAN PERNIAGAAN"] || 'N/A';

  modalBody.innerHTML = `
    <h2 class="modal-title">${studentName}</h2>
    
    <div class="modal-field">
      <div class="modal-field-label">Nama Perniagaan</div>
      <div class="modal-field-value text-blue">${company}</div>
    </div>
    <div class="modal-field">
      <div class="modal-field-label">Produk</div>
      <div class="modal-field-value">${product}</div>
    </div>
    <div class="modal-field">
      <div class="modal-field-label">Bangsa</div>
      <div class="modal-field-value">${race}</div>
    </div>
    <div class="modal-field">
      <div class="modal-field-label">SSU</div>
      <div class="modal-field-value">${ssuNo}</div>
    </div>
    <div class="modal-field">
      <div class="modal-field-label">SSM</div>
      <div class="modal-field-value">${ssmNo}</div>
    </div>
    <div class="modal-field">
      <div class="modal-field-label">Jenis Milikan Perniagaan</div>
      <div class="modal-field-value">${milikan}</div>
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('active');
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

function filterData() {
  if (!searchBar) return;
  const searchTerm = searchBar.value.toLowerCase();
  const filtered = allStudents.filter(student => {
    const nameMatch = (student["NAME"] || '').toLowerCase().includes(searchTerm);
    const raceMatch = (student["BANGSA"] || '').toLowerCase().includes(searchTerm);
    const companyMatch = (student["NAMA PERNIAGAAN"] || student["NAMA SYARIKAT"] || '').toLowerCase().includes(searchTerm);
    const productMatch = (student["PRODUK"] || '').toLowerCase().includes(searchTerm);
    const ssuMatch = (student["SSU"] || '').toLowerCase().includes(searchTerm);
    const ssmMatch = (student["SSM"] || '').toLowerCase().includes(searchTerm);
    return nameMatch || raceMatch || companyMatch || productMatch || ssuMatch || ssmMatch;
  });
  displayProducts(filtered);
}

async function loadCatalog() {
  try {
    const response = await fetch(API_URL);
    allStudents = await response.json();
    displayProducts(allStudents);
  } catch (error) {
    console.error('Error fetching data:', error);
    if (grid) grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Gagal memuatkan data dari Google Sheet.</p>';
  }
}

if (searchBar) searchBar.addEventListener('input', filterData);
loadCatalog();
