const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');
const campoBusqueda = document.getElementById('buscar-email');
const btnBuscar = document.getElementById('btn-buscar');
const API_URL = 'https://autos-backend-production.up.railway.app';

let clienteActualId = null;

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
          <td class="acciones">
            <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
            <button onclick="verCliente(${cliente.id})">Ver</button>
          </td>
        `;
        tabla.appendChild(fila);
      });
    })
    .catch(err => console.error('Error cargando clientes:', err));
}

function limpiarCampos() {
  form.reset();
  clienteActualId = null;
  form.nombre.disabled = false;
  form.email.disabled = false;
  form.telefono.disabled = false;
  form.direccion.disabled = false;
  [...tabla.rows].forEach(fila => fila.classList.remove('duplicado'));
}

document.addEventListener('click', e => {
  if (!form.contains(e.target) && !tabla.contains(e.target)) {
    limpiarCampos();
  }
});

btnBuscar.addEventListener('click', () => {
  const email = campoBusqueda.value.trim();
  if (!email) return;
  campoBusqueda.value = '';

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => c.email === email);
      [...tabla.rows].forEach(fila => fila.classList.remove('duplicado'));

      if (!cliente) {
        alert('Cliente no registrado');
        form.nombre.disabled = false;
        form.email.disabled = false;
        form.telefono.disabled = false;
        form.direccion.disabled = false;
        return;
      }

      const fila = [...tabla.rows].find(f => f.cells[2].textContent === email);
      if (fila) fila.classList.add('duplicado');

      form.nombre.value = cliente.nombre;
      form.email.value = cliente.email;
      form.telefono.value = cliente.telefono;
      form.direccion.value = cliente.direccion;
      clienteActualId = cliente.id;
    });
});

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

  if (clienteActualId) {
    fetch(`${API_URL}/clientes/${clienteActualId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje);
        limpiarCampos();
        cargarClientes();
      });
  } else {
    fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    })
      .then(res => {
        if (res.status === 409) {
          return res.json().then(data => {
            alert(data.mensaje);
            const fila = [...tabla.rows].find(f => f.cells[2].textContent === cliente.email);
            if (fila) fila.classList.add('duplicado');
            throw new Error('Cliente duplicado');
          });
        }
        return res.json();
      })
      .then(data => {
        alert(data.mensaje);
        limpiarCampos();
        cargarClientes();
      })
      .catch(err => {
        if (err.message !== 'Cliente duplicado') alert(err.message);
      });
  }
});

function eliminarCliente(id) {
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;

  fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      limpiarCampos();
      cargarClientes();
    });
}

function verCliente(id) {
  if (clienteActualId === id) {
    limpiarCampos();
    return;
  }

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => c.id === id);
      if (!cliente) return;

      form.nombre.value = cliente.nombre;
      form.email.value = cliente.email;
      form.telefono.value = cliente.telefono;
      form.direccion.value = cliente.direccion;
      clienteActualId = cliente.id;

      [...tabla.rows].forEach(fila => {
        if (parseInt(fila.cells[0].textContent) === id) {
          fila.classList.add('duplicado');
        } else {
          fila.classList.remove('duplicado');
        }
      });
    });
}

cargarClientes();