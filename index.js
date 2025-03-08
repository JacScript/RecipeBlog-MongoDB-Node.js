const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const mongoose = require('mongoose')

const app = express();
const port = process.env.PORT || 3000;
const MONGOURL = process.env.MONGODB_URI


app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(expressLayouts);

app.use(cookieParser('CookingBlogSecure'));
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
app.use(fileUpload());

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const routes = require('./server/routes/recipeRoutes.js')
app.use('/', routes);

// app.listen(port, ()=> console.log(`Listening to port ${port}`));

// ✅ Set strictQuery to suppress the warning
mongoose.set('strictQuery', false);

// Function to connect to MongoDB with retry logic
async function connectWithRetry() {
    try {
        // Attempt to connect to the MongoDB database
        const databaseConnected = await mongoose.connect(MONGOURL, {
           // useNewUrlParser: true,   // Ensures compatibility with new MongoDB drivers
          //  useUnifiedTopology: true // Makes the MongoDB driver more robust
        });

        // If the database connection is successful, start the server
        if (databaseConnected) {
            app.listen(port,'127.0.0.1', () => {
                console.log(`Database has been connected and server is running on port ${port}`);
            });
        } else {
            // If the connection fails, retry after 5 seconds
            console.log("Database connection failed, retrying...");
            setTimeout(connectWithRetry, 5000);
        }
    } catch (error) {
        // Log any connection errors and retry after 5 seconds
        console.log(`Database connection error: ${error.message}`);
        setTimeout(connectWithRetry, 5000);
    }
}

// Attempt to connect to the database when the server starts
connectWithRetry();