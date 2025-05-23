const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');
const btnBuscar = document.getElementById('btn-buscar');
const emailBuscar = document.getElementById('email-buscar');
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
        fila.setAttribute('data-id', cliente.id);
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

function limpiarFormulario() {
  form.nombre.value = '';
  form.email.value = '';
  form.telefono.value = '';
  form.direccion.value = '';
  clienteActualId = null;
  [...form.elements].forEach(el => el.disabled = true);
  btnRegistrar.disabled = true;
  btnModificar.style.display = 'none';
  [...tabla.rows].forEach(f => f.classList.remove('duplicado'));
}

btnBuscar.addEventListener('click', () => {
  const email = emailBuscar.value.trim();
  if (!email) return alert('Ingresa un correo para buscar');

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(clientes => {
      const encontrado = clientes.find(c => c.email === email);
      limpiarFormulario();

      if (encontrado) {
        const fila = [...tabla.rows].find(f => f.cells[2].textContent === email);
        if (fila) fila.classList.add('duplicado');

        form.nombre.value = encontrado.nombre;
        form.email.value = encontrado.email;
        form.telefono.value = encontrado.telefono;
        form.direccion.value = encontrado.direccion;

        [...form.elements].forEach(el => el.disabled = false);
        form.email.disabled = true;

        clienteActualId = encontrado.id;
        btnModificar.style.display = 'inline-block';
        btnRegistrar.disabled = true;
      } else {
        [...form.elements].forEach(el => el.disabled = false);
        form.email.value = email;
        btnRegistrar.disabled = false;
        btnModificar.style.display = 'none';
      }
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

  fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      limpiarFormulario();
      cargarClientes();
    })
    .catch(err => alert('Error al registrar cliente'));
});

btnModificar.addEventListener('click', () => {
  const cliente = {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    direccion: form.direccion.value.trim()
  };

  fetch(`${API_URL}/clientes/${clienteActualId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      limpiarFormulario();
      cargarClientes();
    })
    .catch(err => alert('Error al modificar cliente'));
});

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
