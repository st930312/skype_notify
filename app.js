const { BotFrameworkAdapter, FileStorage, ConversationState ,TurnContext } = require('botbuilder');
const restify = require('restify');
const testFolder = './con/';
const fs = require('fs');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Add conversation state middleware
const conversationState = new ConversationState(new FileStorage(testFolder));
adapter.use(conversationState);

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => {
        if (context.activity.type === 'message') {
            const state = conversationState.get(context);
            const count = state.count === undefined ? state.count = 0 : ++state.count;
            state.activity = context.activity;
            console.log("context activity=");
            console.log(context.activity);
            let se = context.sendActivity(`${count}: You said "${context.activity.text}"`);
            return se;
        } else {
            return context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});

server.get('/api/test',(req, res) => {
  fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      fs.readFile(testFolder+file, function(err, data) {
        let act = JSON.parse(data.toString()).activity
        console.log(act);
        let con = new TurnContext(adapter,act)
        con.sendActivity(`腰桿打直好不`);
      });
    });
  })
  res.send(200,{status:"success"})
});

server.on('uncaughtException', (req, res, route, err) => {
   console.log(err); // Logs the error
});
