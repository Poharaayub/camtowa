const video = document.getElementById('video');
const gridCanvas = document.getElementById('gridCanvas');
const gctx = gridCanvas.getContext('2d');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('captureBtn');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');

const daysID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const monthsID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const WA_LINK = 'https://chat.whatsapp.com/KnxTC4uGQdGI6WAAVh0UGg?mode=ac_t';

function formatTimestamp(date){
  return `${daysID[date.getDay()]} ${date.getDate()} ${monthsID[date.getMonth()]} ${date.getFullYear()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;
}

// Buka kamera HD + fokus otomatis
(async ()=>{
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video:{
        facingMode:'environment',
        width:{ ideal:1920 },
        height:{ ideal:1080 },
        focusMode: "continuous"
      },
      audio:false
    });
    video.srcObject = stream;
  } catch(e){
    alert('Gagal membuka kamera: ' + e.message);
  }
})();

// Slider kecerahan
brightnessSlider.addEventListener('input',()=>{
  const val = brightnessSlider.value;
  brightnessValue.textContent = val + '%';
  video.style.filter = `brightness(${val}%)`;
});

// Gambar grid 3×4
function drawGrid(){
  gridCanvas.width = video.clientWidth;
  gridCanvas.height = video.clientHeight;

  gctx.clearRect(0,0,gridCanvas.width,gridCanvas.height);
  gctx.strokeStyle = 'rgba(255,255,255,0.5)';
  gctx.lineWidth = 1;

  // Vertikal
  for(let i=1; i<3; i++){
    const x = (gridCanvas.width/3)*i;
    gctx.beginPath();
    gctx.moveTo(x,0);
    gctx.lineTo(x,gridCanvas.height);
    gctx.stroke();
  }
  // Horizontal
  for(let j=1; j<4; j++){
    const y = (gridCanvas.height/4)*j;
    gctx.beginPath();
    gctx.moveTo(0,y);
    gctx.lineTo(gridCanvas.width,y);
    gctx.stroke();
  }
  requestAnimationFrame(drawGrid);
}

video.addEventListener('loadedmetadata', () => {
  drawGrid();
});

// Tangkap foto
captureBtn.addEventListener('click', async ()=>{
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const targetRatio = 3/4;

  let cropWidth = vw;
  let cropHeight = vw / targetRatio;
  if (cropHeight > vh) {
    cropHeight = vh;
    cropWidth = vh * targetRatio;
  }
  const cropX = (vw - cropWidth) / 2;
  const cropY = (vh - cropHeight) / 2;

  const finalW = 900;
  const finalH = 1200;
  canvas.width = finalW;
  canvas.height = finalH;

  ctx.filter = `brightness(${brightnessSlider.value}%)`;
  ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, finalW, finalH);
  ctx.filter = "none";

  // Stempel teks dengan outline
  const stamp = formatTimestamp(new Date());
  const ocsText = "OCS NFI";
  const fontSize = Math.floor(finalW * 0.04);

  ctx.font = `${fontSize}px sans-serif`;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#00ff00';

  ctx.strokeText(ocsText, 15, finalH - (fontSize*2) - 10);
  ctx.fillText(ocsText, 15, finalH - (fontSize*2) - 10);

  ctx.strokeText(stamp, 15, finalH - 10);
  ctx.fillText(stamp, 15, finalH - 10);

  try {
    const blob = await new Promise(res=>canvas.toBlob(res,'image/png'));
    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({'image/png': blob});
      await navigator.clipboard.write([item]);
    }
  } catch(e) { console.warn('Gagal salin gambar', e); }

  try {
    await navigator.clipboard.writeText(stamp);
  } catch(e) { console.warn('Gagal salin teks', e); }

  window.open(WA_LINK,'_blank');
});

