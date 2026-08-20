const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const { verifyKeyMiddleware } = require('discord-interactions');

// --- 1. WEB SERVER & ENDPOINTS SETUP ---
const app = express();
const PORT = process.env.PORT || 3000;

// Handles Discord Interaction Pings
app.post('/api/interactions', verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY), (req, res) => {
  const { type } = req.body;
  if (type === 1) {
    return res.send({ type: 1 });
  }
});

// Information & Linked Roles Routes
app.get('/verify-user', (req, res) => {
  res.send('<h1>Linked Roles Verification Active</h1>');
});

app.get('/linked-roles', (req, res) => {
  res.send('<h1>SkyGate Linked Roles</h1>');
});

app.get('/terms', (req, res) => {
  res.send('<h1>SkyGate Terms of Service</h1>');
});

app.get('/privacy', (req, res) => {
  res.send('<h1>SkyGate Privacy Policy</h1>');
});

app.get('/', (req, res) => {
  res.send('<h1>SkyGate Discord Bot is Online!</h1>');
});

// Start Server
app.listen(PORT, function() {
  console.log("Web server listening on port " + PORT);
});

// --- 2. DISCORD BOT CLIENT SETUP ---
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
  console.log("SkyGate Discord Bot successfully logged in as " + client.user.tag + "!");
  client.user.setActivity('SkyGate Network', { type: 0 });
});

// Ping Command Listener
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!ping') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('SkyGate Status')
      .setDescription("Pong! Latency is " + (Date.now() - message.createdTimestamp) + "ms.")
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

// --- 4. BOT LOGIN ---
client.login(process.env.DISCORD_TOKEN);
