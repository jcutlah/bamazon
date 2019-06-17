const mysql = require('mysql');
const inquirer = require('inquirer');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "JCut0122!@#",
    database: "bamazon"
});
function showTable(){
    connection.query("SELECT * FROM products", function(err, response){
        if (err){
            console.log(err);
            console.log(connection.sql);
        };
        for (i=0;i<response.length;i++){
            showProducts(response);
        }
        initProgrum();
    });
}
function inventoryInfo(item){
    return {isInStock: (item.stock_quantity > 0), quantity: item.stock_quantity};
}
function showProducts(arr){
    for(i=0;i<arr.length;i++){
        let prod = arr[i];
        if (i===0){
            console.log('----------------------------------------------------------------------------------------------------');
        }
        console.log("Item ID: " + prod.item_id + " | Item Name: " + prod.product_name + " | Department: " + prod.department_name + " | Price: " + prod.price + " | Quantity: " + prod.stock_quantity);
        console.log('----------------------------------------------------------------------------------------------------');
    }
}
function getItem(){
    inquirer.prompt([
        {
            message: "Whatchya wanna buy? Gimme the Item ID",
            name: "id"
        }
    ]).then(function(answers){
        connection.query("SELECT * FROM products WHERE item_id = ?", [answers.id], function(err, response){
            showProducts(response);
            itemInfo = inventoryInfo(response[0]);
            if (itemInfo.isInStock){
                inquirer.prompt([
                    {
                        type: 'message',
                        name: 'quantity',
                        message: 'How many would you like?'
                    }
                ]).then(function(quantities){
                    if (quantities.quantity <= itemInfo.quantity){
                        console.log('enough in stock');
                        let newQuantity = itemInfo.quantity - quantities.quantity;
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQuantity, answers.id], function(err, res){
                            if (err) throw err;
                            console.log(`Sold! Enjoy ${quantities.quantity} of the ${response[0].product_name}.`);
                        });
                        setTimeout(function(){
                            showTable();
                        }, 3000); 
                    } else {
                        console.log('not enough in stock');
                        setTimeout(function(){
                            showTable();
                        }, 2000);
                    }
                });
            } else {
                console.log('Sorry, item not in stock');
                setTimeout(function(){
                    showTable();
                }, 2000);
            }
        });
    })

}
function initProgrum(){
    inquirer.prompt([
        {
            message: "Heyo! Welcome to Bamazon. Whatchya wanna do?",
            type: "list",
            name: "id",
            choices: [
                {
                    name: "Buy something",
                    value: "buy"
                },
                {
                    name: "Exit",
                    value: "exit"
                }
            ]
        }
    ]).then(function(answers){
        switch(answers.id){
            case "exit":
                connection.end();
                return console.log("Have a nice dayy, okay byeeee");
            case "buy":
                getItem();
                break;
        }
    });
}
showTable();