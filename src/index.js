const mineflayer = require('mineflayer');
const { status } = require('minecraft-server-util');

const config = {
  host: (process.env.MC_HOST || 'focusmc.aternos.me').trim(),
  port: Number(process.env.MC_PORT || 25565),
  username: (process.env.MC_USERNAME || `KeepAlive_${Math.floor(Math.random() * 10000)}`).trim(),
  version: (process.env.MC_VERSION || '1.21.1').trim(),
  loginCommand: (process.env.MC_LOGIN_COMMAND || '/login Haslo123!').trim(),
  reconnectDelayMs: Number(process.env.RECONNECT_DELAY_MS || 15000),
  offlineDelayMs: Number(process.env.OFFLINE_DELAY_MS || 60000),
  moveIntervalMs: Number(process.env.MOVE_INTERVAL_MS || 10000)
};

let bot = null;
let reconnectTimer = null;
let movementTimer = null;
let reconnectAttempts = 0;

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function validateConfig() {
  if (!/^[A-Za-z0-9_]{3,16}$/.test(config.username)) {
    throw new Error(
      `Invalid MC_USERNAME "${config.username}". Use 3-16 characters: letters, numbers, underscore. No spaces.`
    );
  }
}

function clearMovement() {
  if (movementTimer) {
    clearInterval(movementTimer);
    movementTimer = null;
  }

  if (bot) {
    bot.clearControlStates();
  }
}

function scheduleReconnect(reason, delayOverrideMs = null) {
  clearMovement();

  if (reconnectTimer) {
    return;
  }

  reconnectAttempts += 1;
  const delay = delayOverrideMs || Math.min(config.reconnectDelayMs * reconnectAttempts, 120000);
  log(`Reconnect in ${Math.round(delay / 1000)}s. Reason: ${reason}`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startBot().catch((error) => {
      log(`Start failed: ${error.message}`);
      scheduleReconnect('start failed');
    });
  }, delay);
}

function startMovement() {
  clearMovement();

  movementTimer = setInterval(() => {
    if (!bot || !bot.entity) {
      return;
    }

    const actions = [
      () => bot.setControlState('forward', true),
      () => bot.setControlState('back', true),
      () => bot.setControlState('left', true),
      () => bot.setControlState('right', true),
      () => bot.setControlState('jump', true)
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
    bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.5, true).catch(() => {});

    setTimeout(() => {
      if (bot) {
        bot.clearControlStates();
      }
    }, 1200);
  }, config.moveIntervalMs);
}

async function waitForOnlineServer() {
  try {
    const response = await status(config.host, config.port, { timeout: 8000 });
    log(`Server online: ${response.players.online}/${response.players.max} players.`);
    return true;
  } catch (error) {
    log(`Server is offline or not accepting pings yet: ${error.message}`);
    scheduleReconnect('server offline', config.offlineDelayMs);
    return false;
  }
}

async function startBot() {
  if (!(await waitForOnlineServer())) {
    return;
  }

  log(`Connecting to ${config.host}:${config.port} as ${config.username} on ${config.version}`);

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: 'offline',
    hideErrors: true
  });

  bot.once('spawn', () => {
    reconnectAttempts = 0;
    log('Joined server. Sending login command.');

    setTimeout(() => {
      bot.chat(config.loginCommand);
      startMovement();
    }, 2500);
  });

  bot.on('kicked', (reason) => {
    log(`Kicked: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}`);
  });

  bot.on('end', (reason) => {
    scheduleReconnect(reason || 'connection ended');
  });

  bot.on('error', (error) => {
    log(`Error: ${error.message}`);
  });
}

process.on('SIGINT', () => {
  log('Stopping bot.');
  clearMovement();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  if (bot) {
    bot.end();
  }
  process.exit(0);
});

validateConfig();

startBot().catch((error) => {
  log(`Start failed: ${error.message}`);
  scheduleReconnect('start failed');
});
