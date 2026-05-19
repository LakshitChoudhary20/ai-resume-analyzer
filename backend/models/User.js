// Simple in-memory user store — no database needed to run locally.
// For production, swap this with a real DB (PostgreSQL/MongoDB).

const users = [];

const User = {
  findByEmail: (email) => users.find(u => u.email === email),
  findById: (id) => users.find(u => u.id === id),
  create: (userData) => {
    const user = { id: Date.now().toString(), ...userData, createdAt: new Date() };
    users.push(user);
    return user;
  },
};

module.exports = User;
