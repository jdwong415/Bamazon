DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INTEGER(10) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(13,2) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL,
    PRIMARY KEY (item_id)
);
    
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Toilet Paper", "Health & Personal Care", 21.20, 100),
	     ("Men's T-Shirt", "Clothing", 12.09, 50),
       ("Game System", "Electronics", 262.99, 200),
       ("Chocolate Chip Cookies", "Food", 8.50, 150),
       ("Mint Chocolate Chip Ice Cream", "Food", 3.99, 90),
       ("Baseball Bat", "Sports", 99.99, 30),
       ("Desktop Computer", "Electronics", 999.99, 100),
       ("Full Zip Hoodie", "Clothing", 25.00, 99),
       ("Whitening Toothpaste", "Health & Personal Care", 4.49, 120),
       ("5qt Motor Oil", "Automotive", 16.97, 250);
