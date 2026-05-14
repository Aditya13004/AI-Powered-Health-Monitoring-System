import https from 'https';

const apiKey = 'AIzaSyBFYKqr2p62RCt9i1oPTSDFSyfQn0Y5ncM';

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const names = json.models.map(m => m.name);
    console.log(names.filter(n => n.includes('flash')));
  });
}).on('error', err => {
  console.log("Error: " + err.message);
});
