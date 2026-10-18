// ===============================================================
// ======== ZONA DE CONFIGURACIÓN - EDITA AQUÍ ==================
// ===============================================================

const CONFIG = {
    // Nombre del archivo CSV que contiene los datos
    CSV_FILE: 'haikus.csv'
};

// ===============================================================
// ======== FIN DE LA ZONA DE CONFIGURACIÓN =====================
// ===============================================================

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===============================================================
// ======== FUNCIÓN PARA CARGAR DATOS DEL CSV ===================
// ===============================================================

async function loadCSVData() {
    try {
        showNotification('Leyendo archivo CSV...', 'info');

        const response = await fetch(CONFIG.CSV_FILE);

        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo ${CONFIG.CSV_FILE}. ¿Está en la misma carpeta?`);
        }

        const csvText = await response.text();

        // Procesar el texto CSV
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const dataRows = lines.slice(1);

        const formattedData = dataRows.map((row, index) => {
            const values = row.split(',').map(v => v.trim());
            if (values.length < 3) {
                console.warn(`Fila ${index + 2} incompleta:`, row);
                return null;
            }

            return {
                nombre: values[0],
                silabas: parseInt(values[1]) || 0,
                linea: values[2]
            };
        }).filter(item => item !== null);

        if (formattedData.length === 0) {
            throw new Error('El archivo CSV no contiene datos válidos.');
        }

        showNotification('Archivo CSV leído correctamente', 'success');
        window.haikuLines = formattedData; // Guardar datos globalmente

    } catch (error) {
        console.error('Error al cargar el CSV:', error);
        showNotification(error.message, 'error');
        window.haikuLines = []; // Asegurarse de que no haya datos si hay un error
    }
}

// Función para generar un haiku aleatorio
function generateHaiku() {
    // Verificar si los datos ya se cargaron
    if (!window.haikuLines || window.haikuLines.length === 0) {
        showNotification('Las líneas de haiku no se han cargado. Por favor, espera o recarga la página.', 'error');
        return;
    }

    // Separar líneas por número de sílabas
    const lines5 = window.haikuLines.filter(item => item.silabas === 5);
    const lines7 = window.haikuLines.filter(item => item.silabas === 7);

    // Verificar si hay suficientes líneas para crear un haiku
    if (lines5.length < 2) {
        showNotification(`Se necesitan al menos 2 líneas de 5 sílabas. Solo hay ${lines5.length}`, 'error');
        return;
    }

    if (lines7.length < 1) {
        showNotification(`Se necesita al menos 1 línea de 7 sílabas. Solo hay ${lines7.length}`, 'error');
        return;
    }

    // Mostrar indicador de carga
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('haikuContainer').style.display = 'none';

    // Simular tiempo de carga para mejor UX
    setTimeout(() => {
        // Seleccionar líneas aleatorias sin repetir
        const availableLines5 = [...lines5];
        const line1 = availableLines5.splice(Math.floor(Math.random() * availableLines5.length), 1)[0];
        const line3 = availableLines5.splice(Math.floor(Math.random() * availableLines5.length), 1)[0];
        const line2 = lines7[Math.floor(Math.random() * lines7.length)];

        // Ocultar indicador de carga
        document.getElementById('loadingIndicator').style.display = 'none';

        // Mostrar haiku
        document.getElementById('haikuTitle').textContent =
            `Haiku por ${line1.nombre}, ${line2.nombre} y ${line3.nombre}`;
        document.getElementById('line1').textContent = line1.linea;
        document.getElementById('line2').textContent = line2.linea;
        document.getElementById('line3').textContent = line3.linea;

        document.getElementById('haikuContainer').style.display = 'block';

        showNotification('Haiku generado exitosamente', 'success');
    }, 800);
}

// ===============================================================
// ======== INICIALIZACIÓN DE LA APLICACIÓN =====================
// ===============================================================

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar los datos del CSV al iniciar la página
    loadCSVData();

    // Configurar event listener para el botón
    document.getElementById('generateButton').addEventListener('click', generateHaiku);
});