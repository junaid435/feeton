let  cron = require( 'node-cron')
let https =require('https')

function pingServer() {
    console.log('Pinging server to keep it alive...');
    
    const options = {
        hostname: 'https://feeton.onrender.com',
        method: 'GET',
        timeout: 60000 
    };

    const req = https.request(options, (res) => {
        console.log('...');
    });

    req.on('timeout', () => {
        req.destroy();
        console.error('Request timed out');
    });

    req.on('error', (err) => {
        console.error('Ping error:', err.message);
    });

    req.end();
}

const  job = cron.schedule('*/14 * * * *', pingServer);

module.exports=job



 