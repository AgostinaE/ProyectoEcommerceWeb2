const Product = require(__dirname + '../../model/Product.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const translate = require(__dirname + '../../node_modules/node-google-translate-skidz/lib/translate.js');
const discountRatePath = path.join(__dirname, '../db/discountRate.json');

function readDiscountData() {
  try {
    const discountData = fs.readFileSync(discountRatePath, 'utf8');
    return JSON.parse(discountData);
  } catch (error) {
    console.error('Error al leer el archivo de descuentos:', error);
    return [];
  }
}

function translateField(text) {
  return new Promise((resolve, reject) => {
    translate({
      text: text,
      source: 'en',
      target: 'es'
    }, function (result) {
      if (result && result.translation) {
        resolve(result.translation);
      } else {
        reject(new Error('Failed to translate text')); // Rechaza la promesa en caso de error
      }
    });
  });
}

const getProducts = async function getProducts() {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    const modifiedData = response.data.map(product => {
      const modifiedProduct = { ...product };
      if (modifiedProduct.hasOwnProperty('description')) {
        modifiedProduct.dt = modifiedProduct.description;
        delete modifiedProduct.description;
      }
      return modifiedProduct;
    });
    const jsonString = JSON.stringify(modifiedData);
    const translated = await translateField(jsonString);
    const translatedJson = JSON.parse(translated);
    const translatedData = translatedJson.map(product => ({
      title: product.title,
      dt: product.dt
    }));
    const updatedData = response.data.map((product, index) => ({
      ...product,
      title: translatedData[index].title,
      description: translatedData[index].dt
    }));
    const products = updatedData.map(productData => new Product(
      productData.id,
      productData.title,
      productData.price,
      productData.description,
      productData.category,
      productData.image,
      productData.rating,
      discount_percentage = 0,
      discounted_amount = 0,
      final_price = 0,
      quantity = 1
    ));
    return products;
  } catch (error) {
    console.error(error);
  }
}

function getApplyDiscount(products, discountData) {
  try {
    const discountedProducts = products.map(product => {
      const discountInfo = discountData.find(item => item.id === product.id);
      if (discountInfo && discountInfo.discount_percentage > 0) {
        product.discount_percentage = discountInfo.discount_percentage;
        product.discounted_amount = product.price * (discountInfo.discount_percentage / 100);
        product.final_price = product.price - product.discounted_amount;
        product.quantity = 1;
      }
      return product;
    });
    return discountedProducts;
  } catch (error) {
    console.error('Error al aplicar descuentos:', error);
    throw error;
  }
}

module.exports = { getProducts, getApplyDiscount, readDiscountData };