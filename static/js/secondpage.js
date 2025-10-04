// ===== Three.js Stars =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000011, 0);
document.body.appendChild(renderer.domElement);

const starCount = 3000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < starCount; i++) {
    starPositions.push((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 10);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.z = 6;

function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.0005;
    renderer.render(scene, camera);
}
animate();

// ===== Buttons =====
const importBtn = document.getElementById('importBtn');
const importOptions = document.getElementById('importOptions');
const manualBtn = document.getElementById('manualBtn');
const fileBtn = document.getElementById('fileBtn');
const fileTypeOptions = document.getElementById('fileTypeOptions');
const csvFile = document.getElementById('csvFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const manualTableContainer = document.getElementById('manualTableContainer');
const manualTable = document.getElementById('manualTable');
const previewTable = document.getElementById('previewTable');
const resultsDiv = document.getElementById('results');

const exportPDFBtn = document.getElementById('exportPDFBtn');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const exportJSONBtn = document.getElementById('exportJSONBtn');

let selectedFormat = null;
let selectedMethod = null;

// Show options
importBtn.addEventListener('click', ()=>{
    importOptions.style.display = 'block';
    fileTypeOptions.style.display = 'none';
    analyzeBtn.style.display = 'none';
    manualTableContainer.style.display = 'none';
});

// Manual / File
manualBtn.addEventListener('click', ()=>{
    selectedMethod = 'manual';
    manualTableContainer.style.display = 'block';
    analyzeBtn.style.display = 'inline-block';
});
fileBtn.addEventListener('click', ()=>{
    selectedMethod = 'file';
    fileTypeOptions.style.display = 'block';
    analyzeBtn.style.display = 'none';
});

// File type
fileTypeOptions.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        selectedFormat = btn.dataset.format;
        if(selectedFormat==='csv') csvFile.accept = '.csv';
        else csvFile.accept = '.json';
        csvFile.click();
        analyzeBtn.style.display = 'inline-block';
    });
});

// File input
csvFile.addEventListener('change', ()=>{
    if(!csvFile.files[0]) return;
});

// ===== Analyze =====
analyzeBtn.addEventListener('click', async ()=>{
    let rows = [];
    if(selectedMethod==='file'){
        if(!csvFile.files[0]) { alert("Select a file first"); return; }
        const reader = new FileReader();
        reader.onload = function(e){
            if(selectedFormat==='csv'){
                rows = e.target.result.split('\n').filter(r=>r.trim()!=='');
            } else {
                const jsonData = JSON.parse(e.target.result);
                rows = Object.values(jsonData).map(r=>Object.values(r).join(','));
            }
            processRows(rows);
        };
        reader.readAsText(csvFile.files[0]);
    } else {
        // Manual Table
        const trs = Array.from(manualTable.querySelectorAll('tbody tr'));
        rows.push(Array.from(manualTable.querySelectorAll('thead th')).map(th=>th.textContent).join(','));
        trs.forEach(tr=>{
            const tds = Array.from(tr.querySelectorAll('td'));
            rows.push(tds.map(td=>td.textContent).join(','));
        });
        processRows(rows);
    }
});

function processRows(rows) {
    showPreview(rows);
    const dataRows = rows.slice(1);
    const headers = rows[0].split(',');
    const dataForAPI = dataRows.map((r, i) => {
        const values = r.split(',');
        return {
            name: values[0] || `Planet ${i+1}`,
            orbital_period: parseFloat(values[1]) || 0,
            planet_radius: parseFloat(values[2]) || 0,
            star_temp: parseFloat(values[3]) || 0,
            star_radius: parseFloat(values[4]) || 0,
            transit_depth: parseFloat(values[5]) || 0,
            transit_duration: parseFloat(values[6]) || 0,
            equilibrium_temp: parseFloat(values[7]) || 0,
            star_logg: parseFloat(values[8]) || 0,
            star_mass: parseFloat(values[9]) || 0,
            star_metallicity: parseFloat(values[10]) || 0,
            signal_to_noise: parseFloat(values[11]) || 0,
            insolation_flux: parseFloat(values[12]) || 0,
            planet_mass_earth: parseFloat(values[13]) || 0
        };
    });
    
    // Call API
    fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataForAPI })
    })
    .then(response => response.json())
    .then(result => {
     if (result.success) {
    generateResults(result.results);

    // Show metrics
    const metricsDiv = document.createElement('div');
    metricsDiv.className = 'metrics';
    metricsDiv.innerHTML = `
        <h3>📊 Model Performance</h3>
        <p>Test Accuracy: ${result.metrics.test_accuracy}</p>
        <p>Test F1 Score: ${result.metrics.test_f1}</p>
        <p>CV Mean: ${result.metrics.cv_mean}</p>
    `;
    resultsDiv.appendChild(metricsDiv);

    if (result.results.some(r => r.prediction === "CONFIRMED")) {
        showCelebration();
    }

    exportPDFBtn.style.display='inline-block';
    exportCSVBtn.style.display='inline-block';
    exportJSONBtn.style.display='inline-block';
} else {
    alert(result.message);
}

    })
    .catch(error => {
        alert('Error analyzing data: ' + error.message);
    });
}

// ===== Preview Table =====
function showPreview(rows){
    previewTable.style.display = 'table';
    previewTable.querySelector('thead').innerHTML='';
    previewTable.querySelector('tbody').innerHTML='';
    const headers = rows[0].split(',');
    const headerRow = document.createElement('tr');
    headers.forEach(h=>{ const th=document.createElement('th'); th.textContent=h; headerRow.appendChild(th); });
    previewTable.querySelector('thead').appendChild(headerRow);
    rows.slice(1).forEach(r=>{
        const tr = document.createElement('tr');
        r.split(',').forEach(c=>{
            const td=document.createElement('td');
            td.textContent=c;
            tr.appendChild(td);
        });
        previewTable.querySelector('tbody').appendChild(tr);
    });
}

// ===== Generate Results Cards (Updated for API) =====
function generateResults(results){
    resultsDiv.innerHTML='';
    results.forEach(r => {
        const card = document.createElement('div');
        card.className='card';
        card.innerHTML = `<h3>${r.name}</h3>
        <p>Prediction: ${r.prediction}</p>
        <p>Confidence: ${r.confidence}%</p>
        <p>Orbital: ${r.features.orbital_period}</p>
        <p>Radius: ${r.features.planet_radius}</p>
        <p>Star Temp: ${r.features.star_temp}</p>
        <p>Habitable: ${r.habitable}</p>`;
        resultsDiv.appendChild(card);
    });
}

// ===== Export PDF =====
exportPDFBtn.addEventListener('click', ()=>{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Exoplanet Analysis Results", 10, 10);
    let y = 20;
    document.querySelectorAll('.card').forEach(card=>{
        const title = card.querySelector('h3').textContent;
        const details = Array.from(card.querySelectorAll('p')).map(p=>p.textContent).join(', ');
        doc.setFontSize(12);
        doc.text(`${title}: ${details}`, 10, y);
        y+=10;
    });
    doc.save("exoplanet_results.pdf");
});

// ===== Export CSV =====
exportCSVBtn.addEventListener('click', ()=>{
    const cards = document.querySelectorAll('.card');
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"Planet","Prediction","Confidence","Orbital","Radius","Star Temp","Habitable"\n`;
    cards.forEach(card=>{
        const title = card.querySelector('h3').textContent;
        const details = Array.from(card.querySelectorAll('p')).map(p=>`"${p.textContent.split(': ')[1]}"`).join(',');
        csvContent += `"${title}",${details}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download","exoplanet_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// ===== Export JSON =====
exportJSONBtn.addEventListener('click', ()=>{
    const cards = document.querySelectorAll('.card');
    const jsonArray = [];
    cards.forEach(card=>{
        const obj = {};
        obj.name = card.querySelector('h3').textContent;
        Array.from(card.querySelectorAll('p')).forEach(p=>{
            const [key,val] = p.textContent.split(': ');
            obj[key.trim()] = val.trim();
        });
        jsonArray.push(obj);
    });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonArray,null,2));
    const link = document.createElement('a');
    link.setAttribute("href",dataStr);
    link.setAttribute("download","exoplanet_results.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// ===== Back to Home =====
document.getElementById('backBtn').addEventListener('click', ()=>{
    window.location.href="/";
});

// JS: تظهر الزينة لو confirmed planet
function showCelebration() {
    const celebration = document.getElementById("celebration");
    celebration.style.display = "block";
    setTimeout(() => {
        celebration.style.display = "none"; // تختفي بعد 3 ثواني
    }, 3000);
}

// === Upload Custom Model ===
const modelUploadForm = document.getElementById("modelUploadForm");
const uploadMsg = document.getElementById("uploadMsg");

if (modelUploadForm) {
  modelUploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("modelFile");
    if (!fileInput.files.length) {
      uploadMsg.textContent = "⚠️ Please select a .pkl model file first.";
      uploadMsg.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await fetch("/api/upload_model", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      uploadMsg.textContent = data.message;
      uploadMsg.style.color = data.success ? "lightgreen" : "red";
    } catch (err) {
      uploadMsg.textContent = "⚠️ Error: " + err.message;
      uploadMsg.style.color = "red";
    }
  });
}
