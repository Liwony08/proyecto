const express = require('express');
const bcrypt = require('bcryptjs');
const conexion = require('./database/db');
const router = express.Router();

// Middleware para comprobar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    req.flash('errorMessage', 'Debes iniciar sesión para acceder a esta página.');
    res.redirect('/login');
}

// ------------------------- Rutas de Autenticación -------------------------

// Página de inicio (redirección según sesión)
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.redirect('/landing');
    }
});

// Página de presentación
router.get('/landing', (req, res) => {
    res.render('landing');
});

// Página de registro
router.get('/register', (req, res) => {
    res.render('register');
});

// Procesar registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    conexion.query('INSERT INTO usersregister (username, password) VALUES (?, ?)', [username, hashedPassword], (error) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al registrar al usuario.');
            res.redirect('/register');
        } else {
            req.flash('successMessage', 'Usuario registrado exitosamente.');
            res.redirect('/login');
        }
    });
});

// Página de inicio de sesión
router.get('/login', (req, res) => {
    res.render('login');
});

// Procesar inicio de sesión
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    conexion.query('SELECT * FROM usersregister WHERE username = ?', [username], async (error, results) => {
        if (error || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            req.flash('errorMessage', 'Credenciales inválidas.');
            res.redirect('/login');
        } else {
            req.session.user = username;
            req.flash('successMessage', 'Inicio de sesión exitoso.');
            res.redirect('/home');
        }
    });
});

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.redirect('/home');
        res.clearCookie('connect.sid');
        req.flash('successMessage', 'Sesión cerrada exitosamente.');
        res.redirect('/login');
    });
});

// Página principal
router.get('/home', isAuthenticated, (req, res) => {
    res.render('home', { user: req.session.user });
});

// ------------------------- Rutas de Usuarios -------------------------

// Listar usuarios
router.get('/users', isAuthenticated, (req, res) => {
    const query = `
        SELECT users.id, users.username AS user, roles.role_name AS rol
        FROM users
        LEFT JOIN user_rol ON users.id = user_rol.user_id
        LEFT JOIN roles ON user_rol.rol_id = roles.id
    `;
    conexion.query(query, (error, results) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al obtener los usuarios.');
            res.redirect('/home');
        } else {
            res.render('users/index', { results });
        }
    });
});

// Crear usuario
router.get('/users/create', isAuthenticated, (req, res) => {
    conexion.query('SELECT * FROM roles', (error, results) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al obtener roles.');
            res.redirect('/users');
        } else {
            res.render('users/create', { roles: results });
        }
    });
});

// Guardar nuevo usuario
router.post('/users/save', isAuthenticated, (req, res) => {
    const { username, rol } = req.body;

    conexion.query('INSERT INTO users (username) VALUES (?)', [username], (error, result) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al guardar el usuario.');
            res.redirect('/users');
        } else {
            const userId = result.insertId;
            conexion.query('INSERT INTO user_rol (user_id, rol_id) VALUES (?, ?)', [userId, rol], (error) => {
                if (error) {
                    console.error(error);
                    req.flash('errorMessage', 'Error al asignar rol al usuario.');
                } else {
                    req.flash('successMessage', 'Usuario creado exitosamente.');
                }
                res.redirect('/users');
            });
        }
    });
});

// Editar usuario
router.get('/users/edit/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;

    conexion.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al obtener el usuario.');
            res.redirect('/users');
        } else {
            res.render('users/edit', { user: results[0] });
        }
    });
});

// Actualizar usuario
router.post('/users/update', isAuthenticated, (req, res) => {
    const { id, username, rol } = req.body;

    conexion.query('UPDATE users SET username = ? WHERE id = ?', [username, id], (error) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al actualizar el usuario.');
            res.redirect('/users');
        } else {
            conexion.query('UPDATE user_rol SET rol_id = ? WHERE user_id = ?', [rol, id], (error) => {
                if (error) {
                    console.error(error);
                    req.flash('errorMessage', 'Error al actualizar el rol del usuario.');
                } else {
                    req.flash('successMessage', 'Usuario actualizado exitosamente.');
                }
                res.redirect('/users');
            });
        }
    });
});

// Eliminar usuario
router.get('/users/delete/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;

    conexion.query('DELETE FROM user_rol WHERE user_id = ?', [id], (error) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al eliminar el usuario.');
            res.redirect('/users');
        } else {
            conexion.query('DELETE FROM users WHERE id = ?', [id], (error) => {
                if (error) {
                    console.error(error);
                    req.flash('errorMessage', 'Error al eliminar el usuario.');
                } else {
                    req.flash('successMessage', 'Usuario eliminado exitosamente.');
                }
                res.redirect('/users');
            });
        }
    });
});

// ------------------------- Rutas de Roles -------------------------

router.get('/roles', isAuthenticated, (req, res) => {
    conexion.query('SELECT * FROM roles', (error, results) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al obtener los roles.');
            res.redirect('/home');
        } else {
            res.render('roles/index', { roles: results });
        }
    });
});

// Crear rol
router.get('/roles/create', isAuthenticated, (req, res) => {
    res.render('roles/create');
});

// Guardar nuevo rol
router.post('/roles/save', isAuthenticated, (req, res) => {
    const { role_name } = req.body;

    conexion.query('INSERT INTO roles (role_name) VALUES (?)', [role_name], (error) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al guardar el rol.');
        } else {
            req.flash('successMessage', 'Rol creado exitosamente.');
        }
        res.redirect('/roles');
    });
});

// Eliminar rol
router.get('/roles/delete/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;

    conexion.query('DELETE FROM roles WHERE id = ?', [id], (error) => {
        if (error) {
            console.error(error);
            req.flash('errorMessage', 'Error al eliminar el rol.');
        } else {
            req.flash('successMessage', 'Rol eliminado exitosamente.');
        }
        res.redirect('/roles');
    });
});

module.exports = router;
