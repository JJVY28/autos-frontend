const form = document.getElementById('cliente-form');
const tabla = document.querySelector('#clientes-table tbody');
const buscarForm = document.getElementById('busqueda-form');
const buscarInput = document.getElementById('buscar-email');
const modificarBtn = document.getElementById('btn-modificar');

const API_URL = 'https://autos-backend-production.up.railway.app';

let clienteEncontradoId = null;

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
            <button onclick="verDatosCliente(${cliente.id})">Ver datos</button>
          </td>
        `;
        tabla.appendChild(fila);
      });
    });
}

buscarForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = buscarInput.value.trim().toLowerCase();

  if (!email) return;

  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => c.email.toLowerCase() === email);

      [...tabla.rows].forEach(fila => {
        fila.classList.remove('duplicado');
      });

      if (cliente) {
        const fila = [...tabla.rows].find(f => f.cells[2].textContent.toLowerCase() === email);
        if (fila) fila.classList.add('duplicado');

        clienteEncontradoId = cliente.id;
        form.nombre.value = cliente.nombre;
        form.email.value = cliente.email;
        form.telefono.value = cliente.telefono;
        form.direccion.value = cliente.direccion;

        form.nombre.disabled = false;
        form.email.disabled = false;
        form.telefono.disabled = false;
        form.direccion.disabled = false;

        modificarBtn.style.display = 'inline-block';
      } else {
        alert('Cliente no registrado');
        form.reset();
        form.nombre.disabled = false;
        form.email.disabled = false;
        form.telefono.disabled = false;
        form.direccion.disabled = false;
        modificarBtn.style.display = 'none';
        clienteEncontradoId = null;
      }

      buscarInput.value = '';
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
    .then(res => {
      if (res.status === 409) throw new Error('duplicado');
      if (!res.ok) throw new Error('Error en registro');
      return res.json();
    })
    .then(data => {
      alert(data.mensaje);
      form.reset();
      form.nombre.disabled = true;
      form.email.disabled = true;
      form.telefono.disabled = true;
      form.direccion.disabled = true;
      modificarBtn.style.display = 'none';
      cargarClientes();
    })
    .catch(err => {
      if (err.message === 'duplicado') {
        alert('Cliente ya registrado');
      } else {
        alert(err.message);
      }
    });
});

modificarBtn.addEventListener('click', () => {
  if (!clienteEncontradoId) return;

  const cliente = {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    direccion: form.direccion.value.trim()
  };

  fetch(`${API_URL}/clientes/${clienteEncontradoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al modificar');
      return res.json();
    })
    .then(data => {
      alert(data.mensaje);
      form.reset();
      form.nombre.disabled = true;
      form.email.disabled = true;
      form.telefono.disabled = true;
      form.direccion.disabled = true;
      modificarBtn.style.display = 'none';
      cargarClientes();
    })
    .catch(err => alert(err.message));
});

function eliminarCliente(id) {
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;

  fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarClientes();
    })
    .catch(err => alert(err.message));
}

function verDatosCliente(id) {
  fetch(`${API_URL}/clientes`)
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => c.id === id);
      if (cliente) {
        clienteEncontradoId = cliente.id;
        form.nombre.value = cliente.nombre;
        form.email.value = cliente.email;
        form.telefono.value = cliente.telefono;
        form.direccion.value = cliente.direccion;

        form.nombre.disabled = false;
        form.email.disabled = false;
        form.telefono.disabled = false;
        form.direccion.disabled = false;
        modificarBtn.style.display = 'inline-block';
      }
    });
}

cargarClientes();
