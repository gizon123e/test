const midtransClient = require('midtrans-client');
const config = require('../config/config-env')

async function test(){
    try {
        let snap = new midtransClient.Snap({
            // Set to true if you want Production Environment (accept real transaction).
            isProduction : false,
            serverKey : "SB-Mid-server-VLclSfu-uNzm9coDCkDrg3wU"
        });
        
        // let parameter = {
        //     "transaction_details": {
        //         "order_id": "YOUR-ORDERID-7",
        //         "gross_amount": 100000
        //     },
        //     "credit_card":{
        //         "secure" : true
        //     },
        //     "customer_details": {
        //         "first_name": "budi",
        //         "last_name": "pratama",
        //         "email": "budi.pra@example.com",
        //         "phone": "08111222333"
        //     }
        // };

        const parameter = {
            transaction_details:{
                order_id: "Order 3",
                gross_amount: 200000
            },
            credit_card:{
                secure: true
            },
            customer_details:{
                first_name: "Gizon",
                last_name: "Jakituna",
                email: "gizon@gmail.com",
                phone: "085846131702"
            }
        }
        
        const transaksi = await snap.createTransaction(JSON.stringify(parameter))
        console.log(transaksi)
            // .then((transaction)=>{
            //     // transaction token
            //     let transactionToken = transaction.token;
            //     console.log(transaction)
            //     console.log('transactionToken:',transactionToken);
            // })
    } catch (error) {
        console.log(error)
    }
}
test()