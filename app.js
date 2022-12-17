const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const {spawn} = require('child_process');
const path = require('path');
const config = require('./config.json')
const { parseArgsStringToArgv } = require('string-argv');

class States {
  static get OFFLINE() { return 0; }
  static get INITIALIZING() { return 1; }
  static get ONLINE() { return 2; }
}

class G {
  static currentState = States.OFFLINE;
  static mcprocess = null;

  static setState(state) {
    G.currentState = state;
    io.emit('state', G.currentState);
  }
}

async function startMC() {
    let args = parseArgsStringToArgv(config.minecraft.start_command);
    let cmd = args.shift();
    G.mcprocess = spawn(cmd, args,
        {
          cwd: config.minecraft.server_location,
          stdio: 'pipe',
        },
      );
    G.mcprocess.stdout.setEncoding('utf-8');
    G.mcprocess.stdout.on('data', function(output) {
        console.log(output);
        if (output.search(/Done \(.*s\)! For help/) !== -1) {
            G.setState(States.ONLINE);
        }
    })

    G.mcprocess.on('close', function(code) {
        console.log('SERVER PROCESS STOPPED!');
        G.setState(States.OFFLINE);
    });

    G.setState(States.INITIALIZING);
  
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/:path', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', req.params.path));
});

io.on('connection', (socket) => {
    socket.emit('state', G.currentState);
    socket.emit('title', config.title);
    socket.emit("hi", {state: G.currentState, title: config.title, background: config.background_url})

    socket.on('toggle', () => {
    if (G.currentState !== States.OFFLINE) {
      // Stop the Minecraft server
      G.mcprocess.kill();
    } else {
      // Start the Minecraft server
        startMC();
    }
  });
});

server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});
