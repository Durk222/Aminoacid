//ESTE ES EL COMPRESOR DE IMÁGENES
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const canvas = document.getElementById('processCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const previewImage = document.getElementById('previewImage');
const infectionRange = document.getElementById('infectionRange');
const iterValue = document.getElementById('iterValue');
const downloadBtn = document.getElementById('downloadBtn');
const watermarkCheck = document.getElementById('watermarkCheck');
const loader = document.getElementById('loader');

let originalImage = new Image();
let isProcessing = false;

// Configuración inicial
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Manejo de carga de imagen
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                resetCanvas();
                infectionRange.value = 0;
                iterValue.innerText = "0";
                downloadBtn.disabled = false;
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function resetCanvas() {
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    previewImage.src = canvas.toDataURL();
}

// El slider dispara el proceso
infectionRange.addEventListener('change', async () => {
    if (!originalImage.src || isProcessing) return;
    
    const iterations = parseInt(infectionRange.value);
    iterValue.innerText = iterations;
    
    if (iterations === 0) {
        resetCanvas();
        return;
    }

    startDecayProcess(iterations);
});

async function startDecayProcess(iterations) {
    isProcessing = true;
    loader.classList.remove('hidden');
    downloadBtn.disabled = true;

    // Reiniciamos con la imagen original antes de empezar el bucle
    ctx.drawImage(originalImage, 0, 0);
    
    // Si la marca de agua está activa, la ponemos AL PRINCIPIO
    // para que se comprima y se destruya junto con la imagen (efecto sangrado)
    if (watermarkCheck.checked) {
        addWatermark();
    }

    // El Bucle de la Muerte
    for (let i = 0; i < iterations; i++) {
        aminoDecayFilter(); // Aplicar daño matemático
        
        // Simular compresión JPEG y recargar
        // Esperamos un frame para que la UI no se congele totalmente
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const jpegQuality = 0.3 + (Math.random() * 0.2); // Calidad terrible variable
        const compressedUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        
        await new Promise((resolve) => {
            const tempImg = new Image();
            tempImg.onload = () => {
                // Aquí hacemos el "Resampling" sucio para generar el halo
                // Escalamos un poco diferente para forzar interpolación
                ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
                resolve();
            };
            tempImg.src = compressedUrl;
        });
    }

    previewImage.src = canvas.toDataURL();
    isProcessing = false;
    loader.classList.add('hidden');
    downloadBtn.disabled = false;
}

// EL ALGORITMO NUCLEAR
function aminoDecayFilter() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Recorremos cada píxel
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. EL SESGO VERDE (Green Bias)
        // Multiplicamos G y reducimos R y B.
        // Esto imita el error de conversión YUV de Amino.
        r = r * 0.96; 
        g = g * 1.04; 
        b = b * 0.95;

        // 2. CONTRASTE NUCLEAR (Deep Fried)
        // Empujar los colores hacia los extremos para quemar la imagen
        // Si es brillante, hazlo más brillante. Si es oscuro, más oscuro.
        // Pero con tendencia al verde en los oscuros.
        
        // Umbral de neón
        if (g > 200) g = 255; 
        
        // Levantamiento de negros (The Bill Cipher effect)
        // Si el pixel es muy oscuro (ruido), conviértelo en verde radioactivo oscuro
        if (r < 40 && g < 40 && b < 40) {
            g += 15; // El "ruido" se vuelve verde
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function addWatermark() {
    const barHeight = 40;
    
    // Fondo verde radioactivo de Amino
    ctx.fillStyle = '#00FC96'; 
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
    
    // Texto
    ctx.fillStyle = '#1F2125';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Amino Amino', canvas.width / 2, canvas.height - 12);
}

// Descargar
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'obra_de_arte_amino.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.8);
    link.click();
});
