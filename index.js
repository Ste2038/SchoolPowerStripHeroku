var app = require('express')();
var basicAuth = require('express-basic-auth');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

//Variabili Entities
let Intent,
    ToDo,
    ToControlName,
    ToControlNum,
    ReleConfig;

let ReleStat = [8];
for (let i = 0; i < 8; i++){
    ReleStat[i] = false;
}

app.use(bodyParser.json());
app.use(basicAuth({
  users: { 'admin': 'secret'}
}));

http.listen(port, function(){
    console.log('listening on port ' + port);

    io.on('connection', function(socket){
        console.log('User Connected!');
        for (let i = 0; i < 8; i++){
            ReleStat[i] = false;
        }

        let stringStati = '| ';
        for(let i = 0; i < 8; i++){
          stringStati += ReleStat[i];
          if (ReleStat[i]){
            stringStati += ' ';
          }
          stringStati += ' | '
        }
        //disegno dell'array di stato
        console.log('_________________________________________________________________');
        console.log('|   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |');
        console.log(stringStati);
        console.log('|_______________________________________________________________|');

        socket.on('start', function(msgObj){
            ReleConfig = JSON.parse(msgObj);
            console.log("ReleConfig: " + ReleConfig);
        });

        socket.on('changeReleNum', function(msgObj){
            _ChangeReleNum = msgObj;
            console.log("changeReleNum: " + _ChangeReleNum);
        });

        socket.on('changeRelStatus', function(msgObj){
            _ChangeReleStatus = msgObj
            console.log("changeRelStatus: " + _ChangeReleStatus);

            if (_ChangeReleStatus == 1){
                ReleStat[_ChangeReleNum] = true;
            }
            else{
                ReleStat[_ChangeReleNum] = false;
            }

            let stringStati = '| ';
            for(let i = 0; i < 8; i++){
              stringStati += ReleStat[i];
              if (ReleStat[i]){
                stringStati += ' ';
              }
              stringStati += ' | '
            }
            //disegno dell'array di stato
            console.log('_________________________________________________________________');
            console.log('|   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |');
            console.log(stringStati);
            console.log('|_______________________________________________________________|');

        });
    })
});

app.get('/', function(req, res){
    res.send('ciao');
});

app.post('/', function(req, res){
    console.log('POST / ', JSON.stringify(req.body));
    console.log('Parametri: ' + JSON.stringify(req.body.queryResult.parameters));
    //console.log('Parametri: ' + JSON.stringify(req.body.result.parameters));

    //Intent = JSON.parse(JSON.stringify(req.body.queryResult.intent.displayName));
    //console.log("Intent" + Intent);

    //switch (Intent){
        //case "Controllo":
            ToDo = JSON.stringify(req.body.queryResult.parameters.ToDo);
            ToConto = JSON.stringify(req.body.queryResult.parameters.ToControl);

            //ToDo = JSON.stringify(req.body.result.parameters.ToDo);
            //ToControlName = JSON.stringify(req.body.result.parameters.ToControl);

            for (let i = 0; i < 2; i++){
                ReleData = ReleConfig[i];
                console.log("prova");
                if(JSON.parse(ToControlName) == ReleData[0]){
                    ToControlNum = ReleData[1];
                    //ModToControl = ReleData[2];
                }
            }

            console.log("ToDo:" + ToDo);
            console.log("ToControlName: " + ToControlName);
            console.log("ToControlNum: " + ToControlNum);

            io.emit('ToControl', ToControlName);
            io.emit('ToDo', ToDo);

            if (JSON.parse(ToDo) == "Accendi"){
              if (ReleStat[ToControlNum] == true){
                switch(JSON.parse(ToControlName)){
                    case "Lampada":
                        response = `Lampada già accesa`;
                    break;

                    case "Ventilatore":
                        response = `Ventilatore già acceso`;
                    break;
                }
              }
              else{
                switch(JSON.parse(ToControlName)){
                    case "Lampada":
                        response = `Ho acceso la lampada`;
                    break;

                    case "Ventilatore":
                        response = `Ho acceso il ventilatore`;
                    break;
                }
              }
            }
            else if (JSON.parse(ToDo) == "Spegni"){
                if (ReleStat[ToControlNum] == true){
                  switch(JSON.parse(ToControlName)){
                      case "Lampada":
                          response = `Ho spento la lampada`;
                      break;

                      case "Ventilatore":
                          response = `Ho spento il ventilatore`;
                      break;
                  }
                }
                else{
                    switch(JSON.parse(ToControlName)){
                        case "Lampada":
                            response = `Lampada già spenta`;
                        break;

                        case "Ventilatore":
                            response = `Ventilatore già spento`;
                        break;
                    }
                }
            }
            console.log("responce: "+ response);
            res.send(JSON.stringify({"speech": response, "displayText": response}));
        //break;
    //}
});
