var mysql      = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bamazon'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  getItems();
});

function getItems() {
  var sql = "SELECT * FROM products";
  connection.query(sql, function (error, result) {
    if (error) throw error;

    console.log("Available Items:");
    for (var i = 0; i < result.length; i++) {
      var str = result[i].item_id + ". " + result[i].product_name + " - $" +
        result[i].price.toFixed(2) + " - Qty: " + result[i].stock_quantity;
      console.log(str);
    }
    console.log("");
    getUserInput();
  });
}

function getUserInput() {
  inquirer.prompt([
    {
      type: "input",
      name: "index",
      message: "Which item would you like to purchase?",
      validate: function (input) {
        if (isNaN(input)) {
          return "Please input the item's number.";
        }
        return true;
      }
    }, {
      type: "input",
      name: "quantity",
      message: "How much would you like to purchase?",
      validate: function (input) {
        if (isNaN(input)) {
          return "Please input a number.";
        }
        return true;
      }
    }
  ]).then(function (answers) {
    // console.log(answers);
    var index = parseInt(answers.index);
    var quantity = parseInt(answers.quantity);
    console.log("");
    checkOrder(index, quantity);
  });
}

function checkOrder(index, quantity) {
  var sql = "SELECT * FROM products WHERE ?";
  connection.query(sql, {item_id: index}, function (error, result) {
    if (error) throw error;
    
    if (result[0].stock_quantity < quantity) {
      console.log("Insufficient quantity!");
      console.log("Your order has been cancelled.\n");
      continueShopping();
    }
    else {
      console.log("Processing Order");
      var newQuantity = result[0].stock_quantity - quantity;
      processOrder(newQuantity, index);
        
      console.log("Your order has been completed.");
      var total = result[0].price * quantity;
      console.log("Order Total: $" + total.toFixed(2));
      console.log("Thank you for shopping at Bamazon!\n");
      continueShopping();
    }
  });
}

function processOrder(quantity, id) {
  var sql = "UPDATE products SET ? WHERE ?";
  connection.query(sql, [
    {
      stock_quantity: quantity,
    }, {
      item_id: id
    }], function (error, result) {
    if (error) throw error;
  });
}

function continueShopping() {
  inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: "Would you like to continue shopping?",
  }).then(function (answers) {
    if (answers.confirm) {
      console.log("");
      getItems();
    }
    else {
      connection.end();
    }
  });
}