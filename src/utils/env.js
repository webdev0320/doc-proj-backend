const fs = require('fs');
const path = require('path');

function updateEnv(updates) {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  let content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');

  for (const [key, value] of Object.entries(updates)) {
    const index = lines.findIndex(line => line.startsWith(`${key}=`));
    if (index !== -1) {
      lines[index] = `${key}="${value}"`;
    } else {
      lines.push(`${key}="${value}"`);
    }
  }

  fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
}

module.exports = { updateEnv };
