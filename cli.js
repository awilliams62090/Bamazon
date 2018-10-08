var mysql = require("mysql");
var inquirer = require("inquirer");
//This will hold the monetary values our user spends while in bamazon. 
var userCart = [];
//It makes things look so pretty in node! 
require('console.table');

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
    console.log("Welcome to Bamazon!\n");
    showProducts();

});

//Function Prompting customer which item they want 
function promptCustomer(res) {
    inquirer.prompt([{
            type: "input",
            name: "buyProduct",
            message: "Which product do you want to purchase? Please enter the item ID"
        },
        {
            type: "input",
            name: "quantity",
            message: "How many units would you like to purchase?"
        }
    ]).then(function (userPurchase) {
        var item = parseInt(userPurchase.buyProduct);
        var quantity = parseInt(userPurchase.quantity);
        var product = null;

        //A new way to looping through data array to find a single object vs. using a for loop. 
        product = res.find(element => (element.item_id === item));
        // for (var i = 0; i < res.length; i++) {
        //     if (res[i].item_id === item) {
        //         product = res[i];
        //     }
        // }
        if (product) {
            if (product.stock_quantity >= quantity) {
                connection.query("UPDATE products SET stock_quantity= stock_quantity-? WHERE item_id= ?", [quantity, item]);
                var itemTotal = (res[item - 1].price * quantity);
                console.log("You have selected " + quantity + " units of " + res[item - 1].product_name + ". $" + itemTotal.toFixed(2) + " will be added to your cart!");
                userCart.push(itemTotal);
                buyMore();
            } else {
                console.log("Sorry! Insufficient quantity! Please try again.")
                showProducts();
            }
        } else {
            console.log("Sorry! Invalid Item ID! Please try again.")
            showProducts();
        };
    });


};

function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var newRes = [];
        for (var i = 0; i < res.length; i++) {
            let newObj = {
                itemID: res[i].item_id,
                productName: res[i].product_name,
                price: "$" + res[i].price.toFixed(2)
            }
            newRes.push(newObj);
        }
        console.table(newRes);
        promptCustomer(res);

    });
};

function checkOut(total, num) {
    return total + num;
};

function buyMore() {
    inquirer.prompt([{
        type: "rawlist",
        name: "buyAnother",
        message: "Do you want to purchase another product?",
        choices: ["Yes", "No"]
    }]).then(function (answer) {
        var answer = answer.buyAnother;
        if (answer === "Yes") {
            showProducts();
        } else {
            var userTotal = userCart.reduce(checkOut)
            console.log("\nYour total today is $" + userTotal.toFixed(2) + "\n")
            console.log("Please proceed to check out. Thank you!")
            connection.end();
        }
    });
};