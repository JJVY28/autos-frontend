const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');
const buscarBtn = document.getElementById('buscar-btn');
const buscarEmail = document.getElementById('buscar-email');

const API_URL = 'https://autos-backend-production.up.railway.app';

let clienteSeleccionado = null;

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
          limpiarFormulario();

          [...tabla.rows].forEach(fila => {
            fila.classList.remove('duplicado');
          });

          [...tabla.rows].forEach(fila => {
            if (fila.cells[2].textContent === cliente.email) {
              fila.classList.add('duplicado');
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
      limpiarFormulario();
      cargarClientes();
    })
    .catch(err => alert(err.message));
}

function verCliente(id) {
  if (clienteSeleccionado === id) {
    limpiarFormulario();
    clienteSeleccionado = null;
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
      clienteSeleccionado = id;

      [...tabla.rows].forEach(fila => {
        fila.classList.remove('duplicado');
        if (parseInt(fila.cells[0].textContent) === id) {
          fila.classList.add('duplicado');
        }
      });
    });
}

buscarBtn.addEventListener('click', () => {
  const email = buscarEmail.value.trim().toLowerCase();
  if (!email) return;

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      limpiarFormulario();
      buscarEmail.value = '';

      const cliente = data.find(c => c.email.toLowerCase() === email);

      [...tabla.rows].forEach(fila => {
        fila.classList.remove('duplicado');
      });

      if (!cliente) {
        alert('Cliente no registrado');
        form.nombre.disabled = false;
        form.email.disabled = false;
        form.telefono.disabled = false;
        form.direccion.disabled = false;
        return;
      }

      [...tabla.rows].forEach(fila => {
        if (fila.cells[2].textContent.toLowerCase() === email) {
          fila.classList.add('duplicado');
        }
      });
    });
});

function limpiarFormulario() {
  form.reset();
  clienteSeleccionado = null;
  form.nombre.disabled = false;
  form.email.disabled = false;
  form.telefono.disabled = false;
  form.direccion.disabled = false;

  [...tabla.rows].forEach(fila => {
    fila.classList.remove('duplicado');
  });
}

cargarClientes();
s