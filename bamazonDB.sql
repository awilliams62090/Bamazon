DROP DATABASE IF EXISTS bamazon; 
CREATE DATABASE bamazon; 
USE bamazon;
CREATE TABLE products(
item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100),
  department VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT(10) NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Hard Cover Box Set Harry Potter: The Complete Series", "Entertainment",100.00, 20000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Avengers: Infinity War", "Entertainment", 20.00, 5000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Kitchen Aid Stand Mixer", "Kitchen", 330.00, 2000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("A Mighty Wind: The Album", "Kitchen", 9.99, 4000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Tie Dye T-shirt", "Clothing", 15.99, 10000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("'But First, Coffee' Coffee Mug", "Kitchen", 6.00, 8000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Tailgating Pros Cornhole Set", "Sports and Games", 79.00, 15000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Giant Jenga Yard Games", "Sports and Games", 89.99, 5000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("The Softest Leggings you will ever wear", "Clothing", 10.45, 20000);

INSERT INTO products(product_name, department, price, stock_quantity) 
VALUES ("Giant Pineapple Pool Floaty", "Outdoor", 17.99, 85000);

SELECT * FROM products;