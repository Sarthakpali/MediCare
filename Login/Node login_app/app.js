const express = require ('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const {
    PORT = 3000,
    SESS_NAME = 'sid',
    SESS_SECRET = 'it\'sasecret',
    
} = process.env

const app = express();

const users = [
    { id: 1, name: 'samar', email: 'samar@gmail.com',password: '123456'},
    { id: 2, name: 'amar', email: 'amar@gmail.com', password: '123456'},
    { id: 3, name: 'mar', email: 'mar@gmail.com', password: '123456'},
]

app.use(bodyParser.urlencoded({
    extended: true,
}))

app.use(session({
    name : SESS_NAME,
    resave : false,
    saveUninitialized : false,
    secret : SESS_SECRET,
    cookie :{
        maxAge : 1000*60*60,
        sameSite : true,
    }
}))

const redirectLogin = (req,res,next) => {
    if (!req.session.userId){
        res.redirect('/login')
    }else{
        next()
    }
}

const redirectHome = (req,res,next) => {
    if (req.session.userId){
        res.redirect('/home')
    }else{
        next()
    }
}

app.get('/', function(req,res){
    const { userId } = req.session;
    res.send(`<h1>Welcome</h1>
    
    ${
        userId ? `<form method='POST' action='/logout'><button>Logout</button><a href='/home'>Home</a> </form>` : `<a href='/register'>Register</a><a href='/login'>Login</a>`
    }`)
});

app.get('/register',redirectHome, (req,res)=>{
     res.send(`
    <h1>Register</h1>
        <form method='post' action='/register'>
            <input name='name' placeholder='Name' required />
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>
    <a href='/login'>Login</a>
    `)
})

app.get('/home',redirectLogin, (req,res)=>{
    
    const user = users.find(user => user.id === req.session.userId)
    
    res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
        <li> Name : ${user.name}</li>
        <li> Email : ${user.email}</li>
        ${console.log(users)}
    </ul>
    `)
})

app.get('/login',redirectHome, (req,res)=>{
    res.send(`
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>
        <a href='/register'>Register</a>
    `)
})

app.post('/register', (req,res)=>{
   const { name, email , password } = req.body;
   if(name && email && password){
       const exists = users.some(
           user => user.email === email
           )
       if(!exists){
           const user = {
               id : users.length + 1,
               name,
               email,
               password
           }
           users.push(user);
           
           req.session.userId = user.id;
 console.log(req.session);
           return res.redirect('/home');
       }
       
   }
   res.redirect('/register');
})

app.post('/login', (req,res)=>{
    const { email , password } = req.body;
    
    if(email && password ) {
        const user = users.find(user => user.email === email && user.password === password)
        if (user) {
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }res.redirect('/login');
})

app.post('/logout',redirectLogin, (req,res)=>{
    req.session.destroy(err => {
        if(err){
            res.redirect('/home');
        }
        res.clearCookie(SESS_NAME)
        res.redirect('/login')
    })
})


app.listen(PORT, ()=> console.log('http://localhost:3000'));