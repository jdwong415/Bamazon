var mysql = require('mysql');
var inquirer = require('inquirer');
require('console.table');

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

// Display available options and get supervisor's choice
function menu() {
  inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Manager's Menu Options:",
      choices: ["View Product Sales By Department", "Create New Department", "Exit"]
    }
  ]).then(function (answers) {
    if (answers.choice === "View Product Sales By Department") {
      displaySales();
    }
    else if (answers.choice === "Create New Department") {
      createDepartment();
    }
    else {
      connection.end();
    }
  });
}

// Display deparment stastics and total profit
function displaySales() {
  var sql = "SELECT departments.department_id AS ID, departments.department_name AS Department, IFNULL(SUM(products.product_sales),0) AS 'Product Sales', " +
    "IFNULL(SUM(products.product_sales),0) - departments.over_head_costs AS 'Total Profit' FROM departments " +
    "LEFT JOIN products ON departments.department_name = products.department_name " +
    "GROUP BY departments.department_name ORDER BY department_id";
    connection.query(sql, function (error, result) {
      if (error) throw error;

      console.log("");
      console.table(result);
      console.log("");
      menu();
    });
}

// Create a new department
function createDepartment() {
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
        name: "department",
        message: "Enter department name:",
        validate: function (input) {
          var ret = "";
          depArr.forEach(function(val) {
            if (input === val) {
              ret = input + " already exists.";
            }
          });
          if (ret) return ret;
          return true;
        }
      }, {
        type: "input",
        name: "overhead",
        message: "Enter overhead costs:",
        validate: function (input) {
          if (isNaN(input)) {
            return "Please input a number.";
          }
          else if (input < 0) {
            return "Please input a positive number";
          }
          return true;
        }
      }
    ]).then(function (answers) {
      var valuesArr = [[answers.department, answers.overhead]]
      addDepartmentDB(valuesArr);
    });
  });
}

// Insert new department into database
function addDepartmentDB(valuesArr) {
  var sql = "INSERT INTO departments (department_name, over_head_costs) VALUES ?";
  connection.query(sql, [valuesArr], function (error, result) {
    if (error) throw error

    console.log("");
    console.log(valuesArr[0][0] + " was successfully added.");
    console.log("");
    menu();
  });
}