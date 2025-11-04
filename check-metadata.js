const https = require('https');

const url = 'https://aerolab-challenge-m783p7wrl-maria-jose-s-projects-4d5aca07.vercel.app/';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const ogTitle = data.match(/<meta property="og:title" content="([^"]*)"/);
        const ogDescription = data.match(/<meta property="og:description" content="([^"]*)"/);
        const ogImage = data.match(/<meta property="og:image" content="([^"]*)"/);

        console.log('METADATA ACTUAL:');
        console.log('Title:', data.match(/<title>([^<]*)<\/title>/)?.[1]);
        console.log('OG Title:', ogTitle ? ogTitle[1] : 'NO TIENE');
        console.log('OG Description:', ogDescription ? ogDescription[1] : 'NO TIENE');
        console.log('OG Image:', ogImage ? ogImage[1] : 'NO TIENE');
    });
});