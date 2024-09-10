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



// Kết nối với MongoDB
//mongoose.connect('mongodb://127.0.0.1:27017/club', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://phamtheants:MjJg26IjuyUft9pu@webcscdb.tlk67.mongodb.net/CSC_db?retryWrites=true&w=majority', 
    { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;