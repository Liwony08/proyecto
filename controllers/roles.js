/*const express = require('express');
const router = express.Router();
const conexion = require('../database/db');

// Rutas para gestionar roles
router.get('/', (req, res) => {
    conexion.query('SELECT * FROM roles', (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('roles', { results: results });
        }
    });
});

router.get('/create', (req, res) => {
    res.render('create-role');
});

router.post('/save', (req, res) => {
    const { role } = req.body;
    conexion.query('INSERT INTO roles (role) VALUES (?)', [role], (error, results) => {
        if (error) {
            console.error(error);
            res.send('Error al crear el rol');
        } else {
            res.redirect('/roles');
        }
    });
});

router.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM roles WHERE id=?', [id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('edit-role', { role: results[0] });
        }
    });
});

router.post('/update', (req, res) => {
    const { id, role } = req.body;
    conexion.query('UPDATE roles SET role=? WHERE id=?', [role, id], (error, results) => {
        if (error) {
            console.error(error);
            res.send('Error al actualizar el rol');
        } else {
            res.redirect('/roles');
        }
    });
});

router.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM roles WHERE id=?', [id], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/roles');
        }
    });
});

module.exports = router;
*/