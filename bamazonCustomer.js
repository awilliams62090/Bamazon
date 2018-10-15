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
        //changing user inputs into integers so the user input matches the primary key 
        var item = parseInt(userPurchase.buyProduct);
        var quantity = parseInt(userPurchase.quantity);
        var product = null;

        //I learned a new way to looping through data array to find a single object vs. using a for loop. Neat-o!
        product = res.find(element => (element.item_id === item));
        // for (var i = 0; i < res.length; i++) {
        //     if (res[i].item_id === item) {
        //         product = res[i];
        //     }
        // }
        if (product) {
            if (product.stock_quantity >= quantity) {
                //once a user decides on a product, if there is enough product in the stock quantity, it will update the stock quantity
                connection.query("UPDATE products SET stock_quantity= stock_quantity-? WHERE item_id= ?", [quantity, item]);
                //math for getting amount added to cart for user based on how many units of the product they purchased 
                var itemTotal = (res[item - 1].price * quantity);
                //prints the total added to the cart for the customer
                console.log("You have selected " + quantity + " units of " + res[item - 1].product_name + ". $" + itemTotal.toFixed(2) + " will be added to your cart!");
                //push item total into the cart array defined globally above
                userCart.push(itemTotal);
                //gives the user another prompt to buy more items
                buyMore();
            } else {
                //if the stock quantity is less than the quantity the user wants to purchase, this alert will be printed and the available items will be displayed for them to try again. 
                console.log("Sorry! Insufficient quantity! Please try again.")
                showProducts();
            }
        } else {
            //user validation so that if they enter a on key id they have to try again
            console.log("Sorry! Invalid Item ID! Please try again.")
            showProducts();
        };
    });


};

//Shows all the products available for purchase with the nifty console.table npm i have installed. 
function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //since this is a customer section we only want to show the item id, the product name and the price so we set an empty array, loop through the whole table and set a new object for those specific values
        var newRes = [];
        for (var i = 0; i < res.length; i++) {
            let newObj = {
                itemID: res[i].item_id,
                productName: res[i].product_name,
                price: "$" + res[i].price.toFixed(2)
            }
            //push new object into the new array 
            newRes.push(newObj);
        }
        //console.table the new array 
        console.table(newRes);
        //starts the purchase process
        promptCustomer(res);

    });
};


//this function will be passed into the userTotal variable below in the .reduce() method to get the sum of the numbers that have been pushed into the userCart
function checkOut(total, num) {
    return total + num;
};

//after a user has chosen their first item, this function will allow them to buy more porducts or check out
function buyMore() {
    inquirer.prompt([{
        type: "rawlist",
        name: "buyAnother",
        message: "Do you want to purchase another product?",
        choices: ["Yes", "No"]
    }]).then(function (answer) {
        var answer = answer.buyAnother;
        //if they say yes, the show products function will run again 
        if (answer === "Yes") {
            showProducts();
        } else {
            //if they say no, the total is calculated for all items that the user has purchased
            var userTotal = userCart.reduce(checkOut)
            //the total is printed for the user
            console.log("\nYour total today is $" + userTotal.toFixed(2) + "\n")
            //a sign off message 
            console.log("Please proceed to check out. Thank you!")
            //the app ends.Game Over. 
            connection.end();
        }
    });
};