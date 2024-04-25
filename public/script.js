function aumentarContadorCarrito() {
    let carritoCounter = document.getElementById('carritoCounter');
    let contadorActual = parseInt(carritoCounter.textContent);
    carritoCounter.textContent = contadorActual + 1;
}

function agregarAlCarrito(producto) {
    const botonAgregar = event.target;
    botonAgregar.disabled = true;
    fetch('/api/agregarCarrito', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ producto: producto })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al agregar al carrito');
            }
            botonAgregar.classList.remove('btn-warning');
            botonAgregar.classList.add('btn-success');
            botonAgregar.textContent = 'En carrito de compras';
            aumentarContadorCarrito();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

function aumentarCantidad(index, productId) {
    var cantidadBtn = document.getElementById('cantidad_' + index + '_btn');
    var cantidad = parseInt(cantidadBtn.textContent);
    var precio = parseFloat(cantidadBtn.getAttribute('data-price'));
    cantidad++;
    cantidadBtn.textContent = cantidad;
    actualizarTotal(precio);
    actualizarCantidadEnCarrito(parseInt(productId), cantidad);
}

function disminuirCantidad(index, productId) {
    var cantidadBtn = document.getElementById('cantidad_' + index + '_btn');
    var cantidad = parseInt(cantidadBtn.textContent);
    var precio = parseFloat(cantidadBtn.getAttribute('data-price'));
    if (cantidad > 0) {
        cantidad--;
        cantidadBtn.textContent = cantidad;
        actualizarTotal(-precio);
        actualizarCantidadEnCarrito(parseInt(productId), cantidad);
    }
}

function enviarCompra(event) {
    event.preventDefault();
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    fetch('/api/comprar', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la compra');
            }
            console.log('Compra realizada con éxito');
            window.location.href = '/Shopping';
        })
        .catch(error => {
            console.error('Error en la compra:', error);
        });
}

function actualizarCantidadEnCarrito(productId, cantidad) {
    const data = { productId: productId, quantity: cantidad };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('/api/actualizarCantidad', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errror al actualizar la cantidad');
            }
            console.log('Producto actualizado correctamente');
        })
        .catch(error => {
            console.error('Error al actualizar la cantidad', error);
        });
}

function actualizarTotal(precio) {
    var totalSpan = document.getElementById('totalCompra');
    var total = parseFloat(totalSpan.textContent);
    total += precio;
    totalSpan.textContent = total.toFixed(2);
}

function eliminarProducto(index) {
    const productoId = index;

    fetch('/api/eliminarCarrito', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productoId: productoId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito');
            }
            console.log('Producto eliminado del carrito exitosamente');
            window.location.reload();
        })
        .catch(error => {
            console.error('Error al eliminar el producto del carrito:', error);
        });
}