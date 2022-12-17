const {spawn} = require('child_process');
const { parseArgsStringToArgv } = require('string-argv');

let args = parseArgsStringToArgv("'E:\\Minecraft\\jdk\\bin\\java.exe' -Xms4G -Xmx4G -jar -DIReallyKnowWhatIAmDoingISwear=true E:\\Minecraft\\mcServer\\spigot.jar --nogui");
let cmd = args.shift();
mcprocess = spawn(cmd, args,
    {
      cwd: 'E:\\Minecraft\\mcServer',
      stdio: 'pipe',
    },
  );