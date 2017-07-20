var mysql = require('mysql');
var inquirer = require('inquirer');

// MySQL database info
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bamazon'
});

// Connect to MySQL database
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  menu();
});

// Display available options and get manager's choice
function menu() {
  inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Manager's Menu Options:",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }
  ]).then(function (answers) {
    if (answers.choice === "View Products for Sale") {
      displayInventory();
    }
    else if (answers.choice === "View Low Inventory") {
      displayLowInventory();
    }
    else if (answers.choice === "Add to Inventory") {
      addInventory(); 
    }
    else if (answers.choice === "Add New Product") {
      addProduct();
    }
    else {
      connection.end();
    }
  });
}

// Display the products available
function displayInventory() {
  var sql = "SELECT * FROM products";
  connection.query(sql, function (error, result) {
    if (error) throw error;
    console.log("");
    console.log("Available Items:");
    for (var i = 0; i < result.length; i++) {
      var str = result[i].item_id + ". " + result[i].product_name +  " - " + result[i].department_name +
        " - $" + result[i].price.toFixed(2) + " - Qty: " + result[i].stock_quantity + " - Product Sales: $" +
        result[i].product_sales.toFixed(2);
      console.log(str);
    }
    console.log("");
    count = result.length;
    menu();
  });
}

var count = 0;

// Display products with low inventory (< 5)
function displayLowInventory() {
  var sql = "SELECT * FROM products WHERE stock_quantity < 5";
  connection.query(sql, function (error, result) {
    if (error) throw error;

    if (result.length === 0) {
      console.log("There are no items with low inventory");
    }
    else {
      console.log("");
      console.log("Items with Low Inventory:");
      for (var i = 0; i < result.length; i++) {
        var str = result[i].item_id + ". " + result[i].product_name + " - " + result[i].department_name +
        " - $" + result[i].price.toFixed(2) + " - Qty: " + result[i].stock_quantity + " - Product Sales: $" +
        result[i].product_sales.toFixed(2);
        console.log(str);
      }
      console.log("");
      menu();
    }
  });
}

// Restock a product
function addInventory() {
  var sql = "SELECT * FROM products";
  connection.query(sql, function (error, result) {
    if (error) throw error;

    console.log("");
    console.log("Available Items:");
    for (var i = 0; i < result.length; i++) {
      var str = result[i].item_id + ". " + result[i].product_name + " - " + result[i].department_name +
        " - $" + result[i].price.toFixed(2) + " - Qty: " + result[i].stock_quantity + " - Product Sales: $" +
        result[i].product_sales.toFixed(2);
      console.log(str);
    }
    console.log("");
    count = result.length;

    if (count > 0) {
      inquirer.prompt([
        {
          type: "input",
          name: "index",
          message: "Which item would you like to stock up?",
          validate: function (input) {
            if (input <= 0 || input > count) {
              return "Please input a valid index.";
            }
            else if (isNaN(input)) {
              return "Please input the item's index.";
            }
            else if (!isInt(input)) {
              return "Please input an integer";
            }
            return true;
          }
        }, {
          type: "input",
          name: "quantity",
          message: "How much would you like to add?",
          validate: function (input) {
            if (isNaN(input)) {
              return "Please input a number.";
            }
            else if (input < 0) {
              return "Please input a positive number";
            }
            else if (!isInt(input)) {
              return "Please input an integer";
            }
            return true;
          }
        }
      ]).then(function (answers) {
        updateInventory(answers.index, answers.quantity);
      });
    }
    else {
      console.log("There are no items available.");
    }
  });
}

// Update database with changes to quantity
function updateInventory(index, quantity) {
  var sql = "UPDATE products SET stock_quantity = stock_quantity + " + quantity + 
    " WHERE ?";
  connection.query(sql, {item_id: index}, function (error, result) {
    if (error) throw error;

    console.log("");
    console.log("Successfully added " + quantity + " units.");
    console.log("");
    menu();
  });
}

// Add a new product to inventory
function addProduct() {
  var sql = "SELECT department_name FROM departments";
  connection.query(sql, function (error, result) {
    if (error) throw error;
  
    var depArr = [];
    result.forEach(function(val) {
      depArr.push(val.department_name);
    });

    inquirer.prompt([
    {
      type: "input",
      name: "product",
      message: "Name of product:"
    }, {
      type: "list",
      name: "department",
      message: "Name of department:",
      choices: depArr
    }, {
      type: "input",
      name: "price",
      message: "Price of product:",
      validate: function (input) {
        if (isNaN(input)) {
          return "Please enter a number";
        }
        else if (input <= 0) {
          return "Please enter a positive number";
        }
        return true;
      }
    }, {
      type: "input",
      name: "quantity",
      message: "Stock quantity:",
      validate: function (input) {
        if (isNaN(input)) {
          return "Please enter a number";
        }
        else if (input <= 0) {
          return "Please enter a positive number";
        }
        else if (!isInt(input)) {
          return "Please input an integer";
        }
        return true;
      }
    }
    ]).then(function (answers) {
      var valuesArr = [[answers.product, answers.department, answers.price, answers.quantity]];
      addProductDB(valuesArr);
    });
  });
}

// Insert new product into database
function addProductDB(valuesArr) {
  var sql = "INSERT INTO products (product_name, department_name, price, stock_quantity) " +
    "VALUES ?";
  connection.query(sql, [valuesArr], function (error, result) {
    if (error) throw error;
    
    console.log("");
    console.log(valuesArr[0][0] + " was successfully added.");
    console.log("");
    menu();
  });
}

// Check if value is an integer
function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}