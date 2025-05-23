const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');

const API_URL = 'https://autos-backend-production.up.railway.app';

function cargarClientes() {
    fetch(`${API_URL}/clientes`)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) {
                alert('Error: No se pudo cargar la lista de clientes');
                return;
            }

            tabla.innerHTML = '';
            data.forEach(cliente => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.direccion}</td>
                    <td>
                        <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(err => {
            console.error('Error cargando clientes:', err);
        });
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const cliente = {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        telefono: form.telefono.value.trim(),
        direccion: form.direccion.value.trim()
    };

    if (!cliente.nombre || !cliente.email) {
        alert('Nombre y Email son obligatorios');
        return;
    }

    fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    })
    .then(res => {
        if (res.status === 409) {
            return res.json().then(data => {
                alert(data.mensaje);

                // Limpiar clases anteriores
                [...tabla.rows].forEach(fila => {
                    fila.classList.remove('duplicado');
                });

                // Resaltar y agregar botón Modificar
                [...tabla.rows].forEach(fila => {
                    if (fila.cells[2].textContent === cliente.email) {
                        fila.classList.add('duplicado');

                        const id = fila.cells[0].textContent;
                        const accionesCelda = fila.cells[5];
                        accionesCelda.innerHTML = `
                            <button onclick="eliminarCliente(${id})">Eliminar</button>
                            <button onclick="modificarCliente(${id})">Modificar</button>
                        `;
                    }
                });

                throw new Error('Cliente duplicado');
            });
        }

        if (!res.ok) {
            throw new Error('Error en registro');
        }

        return res.json();
    })
    .then(data => {
        alert(data.mensaje);
        form.reset();
        cargarClientes();
    })
    .catch(err => {
        if (err.message !== 'Cliente duplicado') {
            alert(err.message);
        }
    });
});

function eliminarCliente(id) {
    if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;

    fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Error al eliminar');
            return res.json();
        })
        .then(data => {
            alert(data.mensaje);
            cargarClientes();
        })
        .catch(err => alert(err.message));
}

function modificarCliente(id) {
    const cliente = {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        telefono: form.telefono.value.trim(),
        direccion: form.direccion.value.trim()
    };

    if (!cliente.nombre || !cliente.email) {
        alert('Nombre y Email son obligatorios');
        return;
    }

    fetch(`${API_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al actualizar cliente');
        return res.json();
    })
    .then(data => {
        alert(data.mensaje);
        form.reset();
        cargarClientes();
    })
    .catch(err => alert(err.message));
}

cargarClientes();
