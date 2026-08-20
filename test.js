const endpoints = [
  { name: 'Test API', url: 'http://localhost:3000/api/test' },
  { name: 'Thumbnail API (no params)', url: 'http://localhost:3000/api/thumbnail' },
  // add more if needed
];

async function testAll() {
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      const text = await res.text();
      console.log(`✅ ${ep.name}: status ${res.status}${res.status === 200 ? ' - ' + text.substring(0, 60) : ''}`);
    } catch (err) {
      console.error(`❌ ${ep.name}: failed - ${err.message}`);
    }
  }
}

testAll();