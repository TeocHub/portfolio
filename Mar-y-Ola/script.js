// --- CONFIGURACIÓN ---
// PEGA LA NUEVA URL DE TU APLICACIÓN WEB DE APPS SCRIPT AQUÍ
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGr_KqrCRx4Cxa09BYY5Mf5DxOLm-APRoRGPiV45MetYT-_avuANtK796ZNqzQtowqAw/exec';

// Tu API Key y Spreadsheet ID todavía son necesarios para LEER datos (inventario, socios)
const SPREADSHEET_ID = '14Lq_gAVKeWFf-F7AqJ0uNfmBS8jv7C5V93xs3WlIM_Y';
const API_KEY = 'AIzaSyCupCX8OLYxZ54aLEpOQSdcWsvw33N-oGY';

// --- VARIABLES GLOBALES ---
let cart = [];
let discount = 0;
let validCoupons = {}; // Los cupones se cargarán dinámicamente desde la hoja de cálculo

// --- FUNCIONES DE LA API (SOLO PARA LEER DATOS) ---
async function fetchSheetData(range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al leer datos: ${errorData.error ? errorData.error.message : response.statusText}`);
    }
    const data = await response.json();
    return data.values || [];
}

// --- CARGA INICIAL DE DATOS AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadCoupons();
    showNotification('Sistema listo.');
});

async function loadCoupons() {
    try {
        const couponsData = await fetchSheetData('Descuentos!A2:B');
        validCoupons = {}; // Limpiamos los cupones anteriores
        couponsData.forEach(row => {
            const code = row[0];
            const discountValue = parseFloat(row[1]);
            if (code && !isNaN(discountValue)) {
                validCoupons[code] = discountValue;
            }
        });
        console.log('Cupones cargados:', validCoupons);
    } catch (error) {
        console.error('Error al cargar cupones:', error);
        showNotification('No se pudieron cargar los cupones. La función de descuentos podría no estar disponible.', true);
    }
}

// --- FUNCIONES DE INTERFAZ ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');

    if (tabId === 'inventory-tab') {
        loadInventory();
    }
}

function showNotification(message, isError = false) {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.className = 'notification show';
    if (isError) {
        notificationEl.classList.add('error');
    }
    setTimeout(() => {
        notificationEl.classList.remove('show');
    }, 4000);
}

// --- LÓGICA DE PUNTO DE VENTA ---
async function addToCart() {
    const productId = document.getElementById('product-id').value.trim();
    if (!productId) {
        showNotification('Por favor, ingresa un ID de producto.', true);
        return;
    }

    try {
        const inventory = await fetchSheetData('Inventario Tienda!A2:F');
        const productRow = inventory.find(row => row[0] === productId);

        if (!productRow) {
            showNotification(`Producto con ID "${productId}" no encontrado.`, true);
            return;
        }
        
        const stock = parseInt(productRow[3]);
        if (stock <= 0) {
            showNotification(`El producto "${productRow[1]}" no tiene stock disponible.`, true);
            return;
        }

        const [id, name, price] = productRow;
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            if (existingItem.quantity >= stock) {
                showNotification(`No puedes agregar más de ${stock} unidades de "${name}".`, true);
                return;
            }
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price: parseFloat(price), quantity: 1 });
        }

        updateCartDisplay();
        document.getElementById('product-id').value = '';
        showNotification(`"${name}" agregado a la venta.`);

    } catch (error) {
        showNotification(error.message, true);
    }
}

function updateCartDisplay() {
    const cartItemsEl = document.getElementById('cart-items');
    cartItemsEl.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const row = cartItemsEl.insertRow();
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        subtotal += item.price * item.quantity;
    });

    const finalDiscount = subtotal * discount;
    const total = subtotal - finalDiscount;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `$${finalDiscount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value.trim().toUpperCase();
    const couponStatusEl = document.getElementById('coupon-status');
    
    if (validCoupons[couponCode]) {
        discount = validCoupons[couponCode];
        couponStatusEl.textContent = `¡Cupón válido! Descuento de ${discount * 100}% aplicado.`;
        couponStatusEl.style.color = 'green';
    } else {
        discount = 0;
        couponStatusEl.textContent = 'Cupón no válido.';
        couponStatusEl.style.color = 'red';
    }
    updateCartDisplay();
}

function cancelSale() {
    cart = [];
    discount = 0;
    document.getElementById('product-id').value = '';
    document.getElementById('customer-rut').value = '';
    document.getElementById('coupon-code').value = '';
    document.getElementById('coupon-status').textContent = '';
    updateCartDisplay();
    showNotification('Venta cancelada.');
}

async function confirmSale() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío.', true);
        return;
    }
    
    showNotification('Procesando venta, por favor espera...');
    
    const customerRut = document.getElementById('customer-rut').value.trim();
    const payload = {
        action: 'processSale',
        saleItems: cart,
        customerRut: customerRut
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification(result.message);
            cancelSale();
        } else {
            showNotification(result.message, true);
        }
    } catch (error) {
        showNotification(`Error de red o del servidor: ${error.message}`, true);
    }
}

// --- LÓGICA DE SOCIOS ---
async function searchMember() {
    const searchRut = document.getElementById('search-rut').value.trim();
    const resultEl = document.getElementById('member-search-result');
    if (!searchRut) {
        resultEl.innerHTML = 'Por favor, ingresa un RUT.';
        return;
    }
    try {
        const members = await fetchSheetData('Socios!A2:D');
        const member = members.find(row => row[0] === searchRut);
        if (member) {
            resultEl.innerHTML = `
                <h4>Información del Socio</h4>
                <p><strong>RUT:</strong> ${member[0]}</p>
                <p><strong>Nombre:</strong> ${member[1]}</p>
                <p><strong>Cumpleaños:</strong> ${member[2]}</p>
                <p><strong>Puntos Acumulados:</strong> ${member[3] || 0}</p>
            `;
        } else {
            resultEl.innerHTML = 'No se encontró un socio con ese RUT.';
        }
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function addMember(event) {
    event.preventDefault();
    const newRut = document.getElementById('new-rut').value.trim();
    const newName = document.getElementById('new-name').value.trim();
    const newBirthday = document.getElementById('new-birthday').value;

    if (!newRut || !newName || !newBirthday) {
        showNotification('Todos los campos son obligatorios.', true);
        return;
    }

    showNotification('Inscribiendo socio...');
    const payload = {
        action: 'addMember',
        rut: newRut,
        name: newName,
        birthday: newBirthday
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification(result.message);
            document.getElementById('new-member-form').reset();
        } else {
            showNotification(result.message, true);
        }
    } catch (error) {
        showNotification(`Error de red o del servidor: ${error.message}`, true);
    }
}

// --- LÓGICA DE INVENTARIO ---
async function loadInventory() {
    const inventoryItemsEl = document.getElementById('inventory-items');
    inventoryItemsEl.innerHTML = '<tr><td colspan="7">Cargando inventario...</td></tr>';
    try {
        const inventory = await fetchSheetData('Inventario Tienda!A2:F');
        inventoryItemsEl.innerHTML = '';
        if (inventory.length === 0) {
            inventoryItemsEl.innerHTML = '<tr><td colspan="7">No hay productos en el inventario.</td></tr>';
            return;
        }

        inventory.forEach(row => {
            const [id, name, price, stock, minStock, type] = row;
            const stockNum = parseInt(stock) || 0;
            const minStockNum = parseInt(minStock) || 0;
            let statusText = 'Equilibrado';
            let statusClass = 'stock-ok';

            if (stockNum <= minStockNum) {
                statusText = '¡Necesita Reposición!';
                statusClass = 'stock-low';
            }

            const tr = inventoryItemsEl.insertRow();
            tr.innerHTML = `
                <td>${id}</td>
                <td>${name}</td>
                <td>$${parseFloat(price).toFixed(2)}</td>
                <td>${stockNum}</td>
                <td>${minStockNum}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>${type}</td>
            `;
        });
    } catch (error) {
        inventoryItemsEl.innerHTML = `<tr><td colspan="7">Error al cargar inventario: ${error.message}</td></tr>`;
    }
}