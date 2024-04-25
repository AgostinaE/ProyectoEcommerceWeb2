class Product {
  constructor(id, title, price, description, category, image, rating, discount_percentage, discounted_amount, final_price, quantity) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.description = description;
    this.category = category;
    this.image = image;
    this.rating = rating;
    this.discount_percentage = discount_percentage;
    this.discounted_amount = discounted_amount;
    this.final_price = final_price;
    this.quantity = quantity;
  }
}

module.exports = Product