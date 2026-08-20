// --- 1. RENDER PORT BINDING & HTTP SERVER ---
const http = require('http');
const express = require('express');
const { verifyKeyMiddleware } = require('discord-interactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Discord interaction ping handler
app.post('/api/interactions', verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY), (req, res) => {
  const { type } = req.body;
  if (type === 1) {
    return res.send({ type: 1 });
  }
});

// Linked roles handler
app.get('/verify-user', (req, res) => {
  res.send("Linked Roles active!");
});

app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));
http.createServer((req, res) => {
  // Handle Discord Interactions Endpoint Ping
  if (req.method === 'POST' && req.url === '/interactions') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 1 }));
    });
    return;
  }

  // Handle Web Page Routes
  res.writeHead(200, { 'Content-Type': 'text/html' });
  if (req.url === '/linked-roles') {
    res.end('<h1>SkyGate Linked Roles</h1>');
  } else if (req.url === '/terms') {
    res.end('<h1>SkyGate Terms of Service</h1>');
  } else if (req.url === '/privacy') {
    res.end('<h1>SkyGate Privacy Policy</h1>');
  } else {
    res.end('<h1>SkyGate Discord Bot is Online!</h1>');
  }
}).listen(process.env.PORT || 8080);


// --- 2. DISCORD BOT CLIENT SETUP ---
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// --- 3. EVENT HANDLERS & BOT LOGIC ---
client.once('ready', () => {
  console.log(`SkyGate Discord Bot successfully logged in as ${client.user.tag}!`);
  client.user.setActivity('SkyGate Network', { type: 0 }); // Playing SkyGate Network
});

// Ping Command Listener
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!ping') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('SkyGate Status')
      .setDescription(`Pong! Latency is ${Date.now() - message.createdTimestamp}ms.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

// --- 4. BOT LOGIN ---
client.login(process.env.DISCORD_TOKEN);
