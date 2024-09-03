const http = require('http')
const add = require('./math')


const server = http.createServer((req, res) =>{
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello world\n')
})


server.listen(3000, '127.0.0.1', ()=>{
    console.log('Server running at http://127.0.0.1:3000/');
    console.log(add(2, 3));
})