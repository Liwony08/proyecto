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

const PORT = process.env.PORT || 3000; // Usar el puerto proporcionado por Railway o el 3000 por defecto
app.listen(PORT, () => {
    console.log(`Servidor en el puerto http://localhost:${PORT}`);
});

