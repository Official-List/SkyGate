const http = require('http');

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/interactions') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 1 }));
    });
    return;
  }

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
// -------------------------------------------------------------
// PASTE YOUR EXISTING BOT CODE BELOW THIS LINE (discord.js, client.login, etc.)
// --- DISCORD BOT CODE STARTS HERE ---
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const http = require('http');

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/interactions') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 1 }));
    });
    return;
  }

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
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Settings & Configurations
const CONFIG = {
  VERIFY_CHANNEL_NAME: 'verify',
  VERIFIED_ROLE_NAME: 'Verified',
  LOG_CHANNEL_NAME: 'verify-logs'
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('Verification Portal', { type: 3 });
});

// Command Handler for Setup
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content === '!setup-verify') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('You need Administrator permissions to use this command.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Server Verification')
      .setDescription('Click the button below to verify your account and gain access to the server.')
      .setColor('#5865F2')
      .setFooter({ text: 'SkyGate Protection System' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_btn')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅')
    );

    await message.channel.send({ embeds: [embed], components: [row] });
    if (message.deletable) await message.delete();
  }
});

// Interaction Handler for Buttons
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verify_btn') {
    let role = interaction.guild.roles.cache.find(r => r.name === CONFIG.VERIFIED_ROLE_NAME);

    if (!role) {
      try {
        role = await interaction.guild.roles.create({
          name: CONFIG.VERIFIED_ROLE_NAME,
          color: '#2ECC71',
          reason: 'SkyGate auto-created verification role'
        });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: 'Failed to create or assign the Verified role. Check my permissions.', ephemeral: true });
      }
    }

    if (interaction.member.roles.cache.has(role.id)) {
      return interaction.reply({ content: 'You are already verified!', ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: 'You have been successfully verified! Welcome to the server.', ephemeral: true });

      const logChannel = interaction.guild.channels.cache.find(c => c.name === CONFIG.LOG_CHANNEL_NAME);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('User Verified')
          .setDescription(`${interaction.user.tag} (${interaction.user.id}) completed verification.`)
          .setColor('#2ECC71')
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] });
      }
    } catch (err) {
      console.error(err);
      interaction.reply({ content: 'An error occurred while granting your role. Please contact an admin.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
