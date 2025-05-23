const form = document.getElementById('cliente-form');
const buscarForm = document.getElementById('busqueda-form');
const tabla = document.querySelector('#clientes-table tbody');
const btnModificar = document.getElementById('btn-modificar');
const btnRegistrar = document.getElementById('btn-registrar');
const API_URL = 'https://autos-backend-production.up.railway.app';

let clienteActualId = null;

function cargarClientes() {
  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
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
          </td>
        `;
        tabla.appendChild(fila);
      });
    });
}

buscarForm.addEventListener('submit', e => {
  e.preventDefault();
  const emailBuscado = document.getElementById('buscar-email').value.trim();
  if (!emailBuscado) return;

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(clientes => {
      const cliente = clientes.find(c => c.email === emailBuscado);

      // Reset estilos
      [...tabla.rows].forEach(fila => fila.classList.remove('duplicado'));

      if (!cliente) {
        habilitarFormulario(true);
        form.reset();
        document.getElementById('email').value = emailBuscado;
        btnRegistrar.style.display = 'inline-block';
        btnModificar.style.display = 'none';
        clienteActualId = null;
        alert('Cliente no registrado, puedes agregarlo.');
      } else {
        const fila = [...tabla.rows].find(f => f.cells[2].textContent === emailBuscado);
        if (fila) fila.classList.add('duplicado');

        habilitarFormulario(true);
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefono').value = cliente.telefono;
        document.getElementById('direccion').value = cliente.direccion;

        btnRegistrar.style.display = 'none';
        btnModificar.style.display = 'inline-block';
        clienteActualId = cliente.id;
      }
    });
});

function habilitarFormulario(habilitar) {
  ['nombre', 'email', 'telefono', 'direccion'].forEach(id => {
    document.getElementById(id).disabled = !habilitar;
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const cliente = obtenerDatosFormulario();
  if (!cliente.nombre || !cliente.email) return alert('Nombre y email requeridos');

  fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      form.reset();
      buscarForm.reset();
      habilitarFormulario(false);
      cargarClientes();
    });
});

btnModificar.addEventListener('click', () => {
  const cliente = obtenerDatosFormulario();
  if (!clienteActualId) return alert('No hay cliente para modificar');

  fetch(`${API_URL}/clientes/${clienteActualId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      form.reset();
      buscarForm.reset();
      habilitarFormulario(false);
      btnModificar.style.display = 'none';
      btnRegistrar.style.display = 'inline-block';
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
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;

  fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarClientes();
    });
}

cargarClientes();
