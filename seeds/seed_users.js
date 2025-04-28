const db = require('../db');
const bcrypt = require('bcrypt');

async function seedUsers() {
    const users = [
        { username: 'alice', password: 'password123' },
        { username: 'bob', password: 'secret456' },
        { username: 'charlie', password: 'mypassword789' },
    ];

    for (let user of users) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db('users').insert({
            username: user.username,
            password: hashedPassword
        });
    }
}

seedUsers()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
