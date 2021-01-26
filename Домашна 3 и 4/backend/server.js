const db = require('./models/index.js');
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    path = require('path');
fs = require('fs');

app.listen(process.env.PORT || 5000, () => console.log('Server listening on port ' + (process.env.PORT || 5000)));

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../src")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../src/index.html"));
});

app.get('/apteki', (req, res) => {
    res.send(JSON.parse(fs.readFileSync(path.join(__dirname, "apteki.json"))));
});

app.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body;

    db.User.findOne({
            where: {
                user: email
            }
        })
        .then(user => {
            if (user) {
                if (user.dataValues.password == password) {
                    res.send("Успешно логирање");
                } else {
                    res.send("Погрешен password!");
                }
            } else res.send("Корисникот не е пронајден!");
        });

});

app.post('/register', (req, res) => {
    const {
        email,
        password
    } = req.body;
    db.User.findOrCreate({
            where: {
                user: email,
                password: password
            }
        })
        .then(([userObj, created]) => {
            console.log(userObj, created);
            if (!created) {
                res.send("Корисникот веќе постои");
            } else res.send("Успешно се регистриравте!");
        });
});

app.post('/saveroute', async (req, res) => {
    const { user, id: routeid, prevoz, startlon, startlat } = req.body;

    db.UserRoute.findOrCreate({
        where: {
            user,
            routeid,
            prevoz,
            startlon,
            startlat
        }
    })
    .then(([userRoute, created]) => {
        console.log(userRoute, created);
        if (!created) {
            res.send("Рутата е веќе додадена од корисникот!");
        } else res.send("Рутата е успешно додадена!");
    });
    console.log(req.body);
});

app.get('/routes/:user', (req, res) => {
    const { user } = req.body;
    db.UserRoute.findAll({
        where: {
            user: req.params.user
        } 
    })
    .then(routes => res.send(routes));
});