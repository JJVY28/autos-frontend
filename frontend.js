const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');
const buscarInput = document.getElementById('buscarCorreo');
const buscarBtn = document.getElementById('buscar');

const API_URL = 'https://autos-backend-production.up.railway.app';
let clienteActual = null;

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
        fila.setAttribute('data-id', cliente.id);
        fila.innerHTML = `
          <td>${cliente.id}</td>
          <td>${cliente.nombre}</td>
          <td>${cliente.email}</td>
          <td>${cliente.telefono}</td>
          <td>${cliente.direccion}</td>
          <td class="acciones">
            <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
            <button class="ver-datos" data-id="${cliente.id}">Ver</button>
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

  if (clienteActual) {
    modificarCliente(clienteActual);
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

            limpiarResaltado();

            [...tabla.rows].forEach(fila => {
              if (fila.cells[2].textContent === cliente.email) {
                fila.classList.add('resaltado');
              }
            });

            throw new Error('Cliente duplicado');
          });
        }

        if (!res.ok) throw new Error('Error en registro');
        return res.json();
      })
      .then(data => {
        alert(data.mensaje);
        limpiarFormulario();
        cargarClientes();
      })
      .catch(err => {
        if (err.message !== 'Cliente duplicado') {
          alert(err.message);
        }
      });
  }
});

buscarBtn.addEventListener('click', () => {
  const correo = buscarInput.value.trim();

  limpiarFormulario();
  limpiarResaltado();

  if (!correo) return;

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => c.email === correo);

      if (!cliente) {
        alert('Cliente no registrado');
        form.nombre.disabled = false;
        form.email.disabled = false;
        form.telefono.disabled = false;
        form.direccion.disabled = false;
        form.email.value = correo;
        buscarInput.value = '';
        return;
      }

      [...tabla.rows].forEach(fila => {
        if (fila.cells[2].textContent === correo) {
          fila.classList.add('resaltado');
        }
      });

      buscarInput.value = '';
    });
});

tabla.addEventListener('click', e => {
  if (e.target.classList.contains('ver-datos')) {
    const id = e.target.dataset.id;
    const fila = e.target.closest('tr');
    form.nombre.value = fila.cells[1].textContent;
    form.email.value = fila.cells[2].textContent;
    form.telefono.value = fila.cells[3].textContent;
    form.direccion.value = fila.cells[4].textContent;
    clienteActual = id;

    form.nombre.disabled = false;
    form.email.disabled = false;
    form.telefono.disabled = false;
    form.direccion.disabled = false;
  }
});

document.addEventListener('click', e => {
  const esClickEnFormulario = form.contains(e.target);
  const esClickEnTabla = e.target.closest('#clientes-table');
  const esClickEnBuscar = e.target.id === 'buscar' || e.target.id === 'buscarCorreo';
  const esClickEnBotonVer = e.target.classList.contains('ver-datos');

  if (!esClickEnFormulario && !esClickEnTabla && !esClickEnBuscar && !esClickEnBotonVer) {
    limpiarFormulario();
    clienteActual = null;
    limpiarResaltado();
  }
});

function modificarCliente(id) {
  const cliente = {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    direccion: form.direccion.value.trim()
  };

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
      limpiarFormulario();
      clienteActual = null;
      cargarClientes();
    })
    .catch(err => alert(err.message));
}

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

function limpiarFormulario() {
  form.reset();
  form.nombre.disabled = false;
  form.email.disabled = false;
  form.telefono.disabled = false;
  form.direccion.disabled = false;
}

function limpiarResaltado() {
  [...tabla.rows].forEach(fila => fila.classList.remove('resaltado'));
}

cargarClientes();
