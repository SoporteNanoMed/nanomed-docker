const bcrypt = require('bcrypt');

async function testHash() {
  const password = 'test123';
  const hash = '$2b$12$bzqCpYA1sqPWwHkEI2bG7.yIK4LeHZEs21TC8nKBJ6k5va3oX4qSq';
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Hash length:', hash.length);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash is valid:', isValid);
  
  // Generar nuevo hash
  const newHash = await bcrypt.hash(password, 12);
  console.log('New hash:', newHash);
  console.log('New hash length:', newHash.length);
  
  const isNewValid = await bcrypt.compare(password, newHash);
  console.log('New hash is valid:', isNewValid);
}

testHash().catch(console.error);
