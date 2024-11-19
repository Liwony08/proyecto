const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const router = require('./router');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('successMessage');
    res.locals.errorMessage = req.flash('errorMessage');
    next();
});

app.set('view engine', 'ejs');

app.use('/', router);

app.listen(3000, () => {
    console.log('Servidor en el puerto http://localhost:3000');
});
