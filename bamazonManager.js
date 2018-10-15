var mysql = require("mysql");
var inquirer = require("inquirer");
//It makes things look so pretty in node! 
require("console.table");

//establishing connection to mySQL
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon",
    insecureAuth: true
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    console.log("Welcome to the Bamazon Manager Portal! A place for awesome managers to do their jobs!\n");
    managerPrompt();
});


//asks the manager what they need to do within the portal. 
function managerPrompt() {
    inquirer.prompt([{
        type: "rawlist",
        name: "mgrOptions",
        message: "What would you like to view/work on?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }, ]).then(function (answers) {
        console.log(answers.mgrOptions)
        if (answers.mgrOptions === "View Products for Sale") {
            showProducts();
        } else if (answers.mgrOptions === "View Low Inventory") {
            viewLowInventory();
        } else if (answers.mgrOptions === "Add to Inventory") {
            updateInventory();
        } else if (answers.mgrOptions === "Add New Product") {
            addProducts();
        } else {
            //user validation. If user presses an invalid key 
            console.log("Sorry! Invalid key! Please try again.")
            //re-runs the prompt
            managerPrompt();
        };
    });
};

//a fucntion to show all the products for sale with stock quantities from the mysql database
function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        //asks the manager if they would like to work on other things
        workMore();
    });
};

//Shows manager low inventory items 
function viewLowInventory() {
    //will console.table anything with a quantity of less than 5000 and give an option to update inventory from this prompt screen or move on to the main portal
    connection.query("SELECT * FROM products WHERE stock_quantity < 5000", function (err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([{
            type: "rawlist",
            name: "addInventory",
            message: "Do you want to add inventory to products?",
            choices: ["Yes", "No"]
        }]).then(function (answer) {
            var answer = answer.addInventory;
            if (answer === "Yes") {
                updateInventory();
            } else {
                console.log("\n OK!\n")
                workMore();
            }
        })

    });
};

//Allows the manger to to view all products and update the stock quantities 
function updateInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([{
                type: "input",
                name: "inventory",
                message: "Which product do you want to update? Please enter the item ID"
            },
            {
                type: "input",
                name: "quantity",
                message: "How many units would you like to add to inventory?"
            }
        ]).then(function (mgrUpdate) {
            var item = parseInt(mgrUpdate.inventory);
            var quantity = parseInt(mgrUpdate.quantity);
            var product = null;

            product = res.find(element => (element.item_id === item));

            if (product) {
                connection.query("UPDATE products SET stock_quantity= stock_quantity+? WHERE item_id= ?", [quantity, item]);
                console.log("You have added " + quantity + " units of " + product.product_name + " into the Bamazon inventory!");
                inquirer.prompt([{
                    type: "rawlist",
                    name: "addMore",
                    message: "Do you want to add inventory to any other products?",
                    choices: ["Yes", "No"]
                }]).then(function (answer) {
                    var answer = answer.addMore;
                    if (answer === "Yes") {
                        updateInventory();
                    } else {
                        console.log("OK!\n")
                        workMore();
                    };
                });
            } else {
                //user validation
                console.log("Sorry! Invalid Item ID! Please try again.")
                //re-runs portal option
                updateInventory();
            };
        });
    });
};

//allows a manager to add a new item into the inventory 
function addProducts() {
    inquirer.prompt([{
        type: "input",
        name: "newName",
        message: "What is the Product Name?"
    }, {
        type: "input",
        name: "department",
        message: "What is the product's department?"
    }, {
        type: "input",
        name: "itemPrice",
        message: "How much will the item be sold for?"
    }, {
        type: "input",
        name: "quantity",
        message: "What is the initial stock quantity?"
    }]).then(function (newItem) {
        connection.query("INSERT INTO products SET ?", {
            product_name: newItem.newName,
            price: newItem.itemPrice,
            department: newItem.department,
            stock_quantity: newItem.quantity
        }, function (err, res) {
            if (err) throw err;
            console.log("You have successfully added " + newItem.quantity + " units of " + newItem.newName + " into the Bamazon market place! This item will be sold at the price of $" + newItem.itemPrice + ".\n");
            inquirer.prompt([{
                type: "rawlist",
                name: "addMore",
                message: "Do you need to do add any other products?",
                choices: ["Yes", "No"]
            }]).then(function (answer) {
                var answer = answer.addMore;
                if (answer === "Yes") {
                    addProducts();
                } else {
                   workMore();
                };
            });

        });

    });

};

//Allows manager to work in other portal functions after they are done with the current task
function workMore() {
    inquirer.prompt([{
        type: "rawlist",
        name: "moreWork",
        message: "Do you need to do anything else?",
        choices: ["Yes", "No"]
    }]).then(function (answer) {
        var answer = answer.moreWork;
        if (answer === "Yes") {
            managerPrompt();
        } else {
            //if they are all done, this prints the manager a log off message and the app connection ends. 
            console.log("\nYou are all set. Keep being the awesome manager that you are. Thank you and have a nice day!!")
            //Game Over!
            connection.end();
        }
    });
};

