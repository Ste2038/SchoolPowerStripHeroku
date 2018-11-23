var app = require('express')();
var basicAuth = require('express-basic-auth');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');

//Variabili Entities
let Intent,
    ToDo,
    ToControl;

app.use(bodyParser.json());
app.use(basicAuth({
  users: { 'admin': 'secret'}
}));

http.listen(process.env.PORT || 3000, function(){
    console.log('listening');
});

app.get('/', function(req, res){
    res.send('ciao');
});

app.post('/', function(req, res){
    console.log('POST / ', JSON.stringify(req.body));
    console.log('Parametri: ' + JSON.stringify(req.body.queryResult.parameters));

    Intent = JSON.parse(JSON.stringify(req.body.queryResult.intent.displayName));
    console.log("Intent" + Intent);

    switch (Intent){
        case "Controllo":
            ToDo = JSON.stringify(req.body.queryResult.parameters.ToDo);
            ToControl = JSON.stringify(req.body.queryResult.parameters.ToControl);
            console.log("ToDo" + ToDo);
            console.log("ToControl" + ToControl);
            
            io.emit('ToControl', ToControl);
            io.emit('ToDo', ToDo);

            if (JSON.parse(ToDo) == "Accendi"){
                switch(JSON.parse(ToControl)){
                    case "Lampada":
                        response = `Ho acceso la lampada`;
                    break;
                    
                    case "Ventilatore":
                        response = `Ho acceso il ventilatore`;
                    break;
                }
            }
            else if (JSON.parse(ToDo) == "Spegni"){
                switch(JSON.parse(ToControl)){
                    case "Lampada":
                        response = `Ho spento la lampada`;
                    break;
                    
                    case "Ventilatore":
                        response = `Ho spento il ventilatore`;
                    break;
                }
            }
            res.send(JSON.stringify({"speech": response, "displayText": response}));
        break;
    }
});