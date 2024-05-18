const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const cors = require("cors");

const app = express();
const port = 2000;

//for restricting resource access
var corsOptions = {
    origin: "http://localhost:2000"
  };
  
  app.use(cors(corsOptions));
  
  app.use(express.json());
  
  app.use(express.urlencoded({ extended: true }));



  // Convert naira amount to kobo
 const nairaToKobo = (nairaAmount) => {
    return Math.round(nairaAmount * 100 * 100); // Multiply by 100 to convert to kobo, 100 for precision and round to integer
}


app.post('/transaction', async (req, res) => {
    const { amount } = req.body;

    try {
       
        const result = await pool.query(
            'INSERT INTO accounts (amount) VALUES ($1) RETURNING id, amount',
            [amount]
        );

        const savedAccount = result.rows[0];

        res.status(200).json({ message: 'Transaction saved successfully', data: savedAccount });
    } catch (error) {
        console.error('Error saving transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/transactions', async (req, res) => {
    try {
    
        const result = await pool.query('SELECT * FROM accounts');

        // Convert the amounts to kobo
        const transactions = result.rows.map(transaction => ({
            ...transaction,
            amount_kobo: nairaToKobo(transaction.amount),
        }));

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/transaction/:id', async (req, res) => {
    const { id } = req.params;

    try {
        
        const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Convert the amount to kobo
        const transaction = result.rows[0];
        transaction.amount_kobo = nairaToKobo(transaction.amount);

        res.status(200).json(transaction);
        
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.listen(port, () => {
    console.log(`Server running on port:${port}`);
});