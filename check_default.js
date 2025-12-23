const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', '202512shift.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const defaultGroup = data.tag_arrangement.find(g => g.full_name.includes('Default'));
if (defaultGroup) {
    console.log(`Found group: "${defaultGroup.full_name}"`);
    console.log('Char codes:', defaultGroup.full_name.split('').map(c => c.charCodeAt(0)));
} else {
    console.log('No group with "Default" found');
}

data.tag_arrangement.forEach(g => {
    console.log(`Group: "${g.full_name}"`);
});
