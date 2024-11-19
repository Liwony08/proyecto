const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const conexion = require('./database/db');

// Middleware para comprobar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Redirigir la raíz
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.redirect('/landing');
    }
});


// Registro de usuario
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar el usuario en la base de datos
    conexion.query('INSERT INTO usersregister (username, password) VALUES (?, ?)', [username, hashedPassword], (error, results) => {
        if (error) {
            console.error(error);
            res.send('Error al registrar al usuario');
        } else {
            req.session.user = username;
            res.redirect('/home');
        }
    });
});
// Ruta para la página de presentación (landing)
router.get('/landing', (req, res) => {
    res.render('landing');
});


// Inicio de sesión
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    conexion.query('SELECT * FROM usersregister WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.error(error);
            res.send('Error al iniciar sesión');
        } else if (results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
            res.send('Credenciales inválidas');
        } else {
            req.session.user = username;
            res.redirect('/home');
        }
    });
});

// Página de inicio
router.get('/home', isAuthenticated, (req, res) => {
    res.render('home', { user: req.session.user });
});

// Rutas para usuarios
router.get('/users', (req, res) => {
    const query = `
        SELECT users.id, users.username AS user, roles.role_name AS rol
        FROM users
        LEFT JOIN user_rol ON users.id = user_rol.user_id
        LEFT JOIN roles ON user_rol.rol_id = roles.id
    `;
    conexion.query(query, (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('index.ejs', { results: results });
        }
    });
});






router.get('/users/create', isAuthenticated, (req, res) => {
    conexion.query('SELECT * FROM roles', (error, results) => {
        if (error) throw error;
        res.render('create.ejs', { roles: results });
    });
});

router.get('/users/edit/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    const getUserQuery = `
        SELECT users.id, users.username, user_rol.rol_id
        FROM users
        LEFT JOIN user_rol ON users.id = user_rol.user_id
        WHERE users.id = ?
    `;
    conexion.query(getUserQuery, [id], (error, userResults) => {
        if (error) throw error;
        const getRolesQuery = 'SELECT * FROM roles';
        conexion.query(getRolesQuery, (error, roleResults) => {
            if (error) throw error;
            const user = userResults[0];
            res.render('edit.ejs', { user: user, roles: roleResults });
        });
    });
});


router.get('/users/delete/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.beginTransaction((err) => {
        if (err) {
            console.log(err);
            res.redirect('/users');
        }
        conexion.query('DELETE FROM user_rol WHERE user_id = ?', [id], (error, results) => {
            if (error) {
                return conexion.rollback(() => {
                    console.log(error);
                    res.redirect('/users');
                });
            }
            conexion.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
                if (error) {
                    return conexion.rollback(() => {
                        console.log(error);
                        res.redirect('/users');
                    });
                }
                conexion.commit((err) => {
                    if (err) {
                        return conexion.rollback(() => {
                            console.log(err);
                            res.redirect('/users');
                        });
                    }
                    res.redirect('/users');
                });
            });
        });
    });
});

router.post('/save', (req, res) => {
    const { user, rol } = req.body;
    const query = "INSERT INTO users (username) VALUES (?)";
    conexion.query(query, [user], (err, result) => {
        if (err) {
            console.error(err);
            res.send('Error');
        } else {
            const userId = result.insertId;
            const roleQuery = "INSERT INTO user_rol (user_id, rol_id) VALUES (?, ?)";
            conexion.query(roleQuery, [userId, rol], (err, result) => {
                if (err) {
                    console.error(err);
                    res.send('Error');
                } else {
                    res.redirect('/users');
                }
            });
        }
    });
});


router.post('/update', isAuthenticated, (req, res) => {
    const { id, username, rol } = req.body;
    const updateUserQuery = 'UPDATE users SET username = ? WHERE id = ?';
    conexion.query(updateUserQuery, [username, id], (error, results) => {
        if (error) throw error;
        const updateUserRolQuery = 'UPDATE user_rol SET rol_id = ? WHERE user_id = ?';
        conexion.query(updateUserRolQuery, [rol, id], (error, results) => {
            if (error) throw error;
            res.redirect('/users');
        });
    });
});


// Rutas para roles
router.get('/roles', isAuthenticated, (req, res) => {
    conexion.query('SELECT * FROM roles', (error, results) => {
        if (error) throw error;
        res.render('roles.ejs', { roles: results });
    });
});

router.get('/roles/create', isAuthenticated, (req, res) => {
    res.render('createRole');
});

router.post('/roles/save', isAuthenticated, (req, res) => {
    const { role_name } = req.body;
    conexion.query('INSERT INTO roles (role_name) VALUES (?)', [role_name], (error, results) => {
        if (error) throw error;
        res.redirect('/roles');
    });
});

router.get('/roles/edit/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM roles WHERE id = ?', [id], (error, results) => {
        if (error) throw error;
        res.render('editRole', { role: results[0] });
    });
});

router.post('/roles/update', isAuthenticated, (req, res) => {
    const { id, role_name } = req.body;
    const updateRoleQuery = 'UPDATE roles SET role_name = ? WHERE id = ?';
    conexion.query(updateRoleQuery, [role_name, id], (error, results) => {
        if (error) throw error;
        res.redirect('/roles');
    });
});

router.get('/roles/delete/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM roles WHERE id = ?', [id], (error, results) => {
        if (error) throw error;
        res.redirect('/roles');
    });
});

// Rutas para tareas
router.get('/tasks', (req, res) => {
    const query = `
        SELECT tasks.id, tasks.title, tasks.description, tasks.start_date, tasks.start_time, tasks.end_date, tasks.end_time, 
               users.username AS assigned_user, roles.role_name AS user_role
        FROM tasks
        LEFT JOIN users ON tasks.user_id = users.id
        LEFT JOIN user_rol ON users.id = user_rol.user_id
        LEFT JOIN roles ON user_rol.rol_id = roles.id
    `;
    conexion.query(query, (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render('tasks.ejs', { tasks: results });
        }
    });
});



router.get('/tasks/create', isAuthenticated, (req, res) => {
    conexion.query('SELECT users.id, users.username, roles.role_name FROM users JOIN user_rol ON users.id = user_rol.user_id JOIN roles ON user_rol.rol_id = roles.id', (error, results) => {
        if (error) throw error;
        res.render('createTask.ejs', { users: results });
    });
});

router.post('/tasks/save', isAuthenticated, (req, res) => {
    const { title, description, start_date, start_time, end_date, end_time, user_id } = req.body;
    const query = 'INSERT INTO tasks (title, description, start_date, start_time, end_date, end_time, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    conexion.query(query, [title, description, start_date, start_time, end_date, end_time, user_id], (error, results) => {
        if (error) {
            console.log(error);
            req.flash('errorMessage', 'Error al crear la tarea');
        } else {
            req.flash('successMessage', 'Tarea creada exitosamente');
        }
        res.redirect('/tasks');
    });
});

router.get('/tasks/edit/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM tasks WHERE id = ?', [id], (error, taskResults) => {
        if (error) throw error;
        conexion.query('SELECT users.id, users.username, roles.role_name FROM users JOIN user_rol ON users.id = user_rol.user_id JOIN roles ON user_rol.rol_id = roles.id', (error, userResults) => {
            if (error) throw error;
            res.render('editTask.ejs', { task: taskResults[0], users: userResults });
        });
    });
});

router.post('/tasks/update', isAuthenticated, (req, res) => {
    const { id, title, description, start_date, start_time, end_date, end_time, user_id } = req.body;
    const query = 'UPDATE tasks SET title = ?, description = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, user_id = ? WHERE id = ?';
    conexion.query(query, [title, description, start_date, start_time, end_date, end_time, user_id, id], (error, results) => {
        if (error) throw error;
        res.redirect('/tasks');
    });
});

router.get('/tasks/delete/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM tasks WHERE id = ?', [id], (error, results) => {
        if (error) throw error;
        res.redirect('/tasks');
    });
});


module.exports = router;