const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const { getProducts, getApplyDiscount, readDiscountData } = require(__dirname + '/ProductLogic/ProductLogic.js');

app.set('view engine', 'ejs');

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/', async (req, res) => {
  try {
    const products = await getProducts();
    const discountData = readDiscountData();
    const productsWithDiscount = getApplyDiscount(products, discountData);
    const productosCarritoJSON = fs.readFileSync(__dirname + '/db/productsCart.json');
    const productosCarrito = JSON.parse(productosCarritoJSON);
    const carritoCount = productosCarrito.length;
    res.render('index', { products: productsWithDiscount, productosCarrito: productosCarrito, carritoCount: carritoCount });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/ShoppingCar', async (req, res) => {
  try {
    const productosCarritoJSON = fs.readFileSync(__dirname + '/db/productsCart.json');
    const productosCarrito = JSON.parse(productosCarritoJSON);
    res.render('shoppingCar', { productosCarrito: productosCarrito });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/Shopping', async (req, res) => {
  try {
    const comprasJSON = fs.readFileSync(__dirname + '/db/shopping.json');
    const compras = JSON.parse(comprasJSON);
    res.render('shopping', { compras: compras });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post('/api/agregarCarrito', async (req, res) => {
  try {
    if (!req.body || !req.body.producto) {
      return res.status(400).send('Missing product data');
    }
    const nuevoProducto = req.body.producto;
    const productosJSON = fs.readFileSync(__dirname + '/db/productsCart.json');
    const productos = JSON.parse(productosJSON);
    productos.push(nuevoProducto);
    fs.writeFileSync(__dirname + '/db/productsCart.json', JSON.stringify(productos, null, 2));

    res.status(200).json({ message: 'Producto agregado exitosamente' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.delete('/api/eliminarCarrito', async (req, res) => {
  try {
    if (!req.body || !req.body.productoId) {
      return res.status(400).send('Missing product ID');
    }
    const productoId = req.body.productoId;
    const productosJSON = fs.readFileSync(__dirname + '/db/productsCart.json');
    let productos = JSON.parse(productosJSON);

    // Filtrar los productos para excluir el producto con el ID proporcionado
    productos = productos.filter(producto => producto.id !== productoId);

    fs.writeFileSync(__dirname + '/db/productsCart.json', JSON.stringify(productos, null, 2));

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post('/api/actualizarCantidad', async (req, res) => {
  try {
    if (!req.body || !req.body.productId || !req.body.quantity) {
      return res.status(400).send('Missing product ID or quantity');
    }
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    const productosJSON = fs.readFileSync(__dirname + '/db/productsCart.json');
    let productos = JSON.parse(productosJSON);
    const productoIndex = productos.findIndex(producto => producto.id === productId);
    if (productoIndex === -1) {
      return res.status(404).send('Product not found in cart');
    }
    productos[productoIndex].quantity = quantity;
    fs.writeFileSync(__dirname + '/db/productsCart.json', JSON.stringify(productos, null, 2));
    res.status(200).json({ message: 'Cantidad Actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post('/api/comprar', (req, res) => {
  try {
    const productosJSON = fs.readFileSync(__dirname + '/db/productsCart.json');
    let productos = JSON.parse(productosJSON);
    let totalCompra = 0;
    productos.forEach(producto => {
      if (producto.discount_percentage !== 0) {
        totalCompra += producto.final_price * producto.quantity;
      } else {
        totalCompra += producto.price * producto.quantity;
      }
    });
    totalCompra = parseFloat(totalCompra.toFixed(2));
    const productosCarritoJSON = JSON.stringify([], null, 2);
    fs.writeFileSync(__dirname + '/db/productsCart.json', productosCarritoJSON);
    let facturas = [];
    try {
      const facturasJSON = fs.readFileSync(__dirname + '/db/shopping.json');
      facturas = JSON.parse(facturasJSON);
      if (!Array.isArray(facturas)) {
        facturas = [];
      }
    } catch (error) {
      console.error('Error al leer las facturas existentes:', error);
    }
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1;
    const año = fechaActual.getFullYear();
    const hora = fechaActual.toLocaleTimeString('en-US', { hour12: true });
    const diaFormateado = dia < 10 ? '0' + dia : dia;
    const mesFormateado = mes < 10 ? '0' + mes : mes;
    const fechaCompleta = `${diaFormateado}/${mesFormateado}/${año} ${hora}`;
    const nuevaFactura = {
      productos,
      totalCompra,
      fecha: fechaCompleta
    };
    facturas.push(nuevaFactura);
    const facturasJSON = JSON.stringify(facturas, null, 2);
    fs.writeFileSync(__dirname + '/db/shopping.json', facturasJSON);
    res.status(200).json({ message: 'Compra guardada exitosamente' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(3002, () => {
  console.log('Servidor escuchando en el puerto 3002');
});