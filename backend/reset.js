const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/team-task-manager-v2').then(async () => {
  const db = mongoose.connection.db;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  await db.collection('users').updateOne({email: 'user@gmail.com'}, {$set: {password: hashedPassword}});
  console.log('Password reset to 123456');
  process.exit(0);
});
