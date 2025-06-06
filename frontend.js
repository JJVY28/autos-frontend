const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');
const API_URL = 'https://autos-backend-production.up.railway.app';

const buscarInput = document.getElementById('buscar-email');
const btnBuscar = document.getElementById('btn-buscar');
const btnActualizar = document.getElementById('btn-actualizar');
const btnRegistrar = document.getElementById('btn-registrar');

let clienteSeleccionadoId = null;

function cargarClientes() {
  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada del servidor:", data);
        return;
      }

      tabla.innerHTML = '';
      data.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.dataset.email = cliente.email;

        fila.innerHTML = `
          <td>${cliente.id}</td>
          <td>${cliente.nombre}</td>
          <td>${cliente.email}</td>
          <td>${cliente.telefono}</td>
          <td>${cliente.direccion}</td>
          <td class="acciones">
            <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
            <button onclick="cargarClienteEnFormulario(${cliente.id})">Ver</button>
          </td>
        `;
        tabla.appendChild(fila);
      });
    })
    .catch(err => console.error("Error cargando clientes:", err));
}

btnBuscar.addEventListener('click', () => {
  const email = buscarInput.value.trim().toLowerCase();
  if (!email) return alert('Ingresa un email');

  let encontrado = false;

  [...tabla.rows].forEach(fila => {
    fila.classList.remove('duplicado');
    if (fila.cells[2].textContent.toLowerCase() === email) {
      fila.classList.add('duplicado');
      encontrado = true;
    }
  });

  buscarInput.value = '';

  if (!encontrado) {
    habilitarCamposFormulario(true);
    form.reset();
    form.email.value = email;
    btnActualizar.style.display = 'none';
    btnRegistrar.disabled = false;
    clienteSeleccionadoId = null;
  } else {
    habilitarCamposFormulario(false);
    btnRegistrar.disabled = true;
  }
});

function habilitarCamposFormulario(habilitar) {
  form.nombre.disabled = !habilitar;
  form.email.disabled = !habilitar;
  form.telefono.disabled = !habilitar;
  form.direccion.disabled = !habilitar;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const cliente = obtenerDatosFormulario();

  if (!cliente.nombre || !cliente.email) {
    alert("Nombre y correo son obligatorios");
    return;
  }

  fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => {
      if (res.status === 409) {
        alert('El cliente ya existe');
        return;
      }
      if (!res.ok) {
        throw new Error("Error al registrar cliente");
      }
      return res.json();
    })
    .then(data => {
      if (data) {
        alert('Cliente registrado');
        form.reset();
        limpiarEstadoFormulario();
        cargarClientes();
      }
    })
    .catch(err => console.error("Error al registrar:", err));
});

btnActualizar.addEventListener('click', () => {
  if (!clienteSeleccionadoId) return;

  const cliente = obtenerDatosFormulario();

  fetch(`${API_URL}/clientes/${clienteSeleccionadoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      form.reset();
      limpiarEstadoFormulario();
      cargarClientes();
    });
});

function obtenerDatosFormulario() {
  return {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    direccion: form.direccion.value.trim()
  };
}

function eliminarCliente(id) {
  if (!confirm('¿Eliminar cliente?')) return;

  fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarClientes();
    });
}

function cargarClienteEnFormulario(id) {
  if (clienteSeleccionadoId === id) {
    form.reset();
    limpiarEstadoFormulario();
    return;
  }

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => c.id === id);
      if (cliente) {
        form.nombre.value = cliente.nombre;
        form.email.value = cliente.email;
        form.telefono.value = cliente.telefono;
        form.direccion.value = cliente.direccion;
        habilitarCamposFormulario(true);
        btnActualizar.style.display = 'inline-block';
        btnRegistrar.disabled = true;
        clienteSeleccionadoId = id;
      }
    });
}

document.addEventListener('click', (e) => {
  const dentroDeForm = form.contains(e.target);
  const dentroDeTabla = tabla.parentElement.contains(e.target);
  const dentroDeBuscar = buscarInput.contains(e.target) || btnBuscar.contains(e.target);

  if (!dentroDeForm && !dentroDeTabla && !dentroDeBuscar) {
    form.reset();
    limpiarEstadoFormulario();
  }
});

function limpiarEstadoFormulario() {
  habilitarCamposFormulario(false);
  btnActualizar.style.display = 'none';
  btnRegistrar.disabled = false;
  clienteSeleccionadoId = null;
}

window.addEventListener('DOMContentLoaded', () => {
  cargarClientes();
});
