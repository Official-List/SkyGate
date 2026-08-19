const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is online!");
  res.end();
}).listen(process.env.PORT || 8080);
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID;

// Define Slash Commands
const commands = [
    // /info Command
    new SlashCommandBuilder()
        .setName('info')
        .setDescription('Displays SkyGate network links and server information'),

    // /kick Command
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option => 
            option.setName('target')
                  .setDescription('The member to kick')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                  .setDescription('Reason for kicking')
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    // /ban Command
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option => 
            option.setName('target')
                  .setDescription('The member to ban')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                  .setDescription('Reason for banning')
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
].map(command => command.toJSON());

// Register Slash Commands
client.once('ready', async () => {
    console.log(`SkyGate Bot successfully logged in as ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Registered SkyGate slash commands globally.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

// Welcome Message & Auto-Role
client.on('guildMemberAdd', async (member) => {
    if (AUTO_ROLE_ID) {
        const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
        if (role) member.roles.add(role).catch(console.error);
    }

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setTitle(`Welcome to ${member.guild.name}!`)
        .setDescription(`Hello <@${member.id}>, welcome to the community!\n\nCheck out our website and make sure to read the rules channel.`)
        .setColor('#00FF7F')
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: 'Skygate Network • skygate.gt.tc' });

    channel.send({ embeds: [welcomeEmbed] });
});

// Command Handler & Moderation Logic
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Helper Function: Protect Owner & High Roles
    const isProtected = (targetMember) => {
        // 1. Protect Server Owner
        if (targetMember.id === interaction.guild.ownerId) return 'owner';
        // 2. Protect the Bot itself
        if (targetMember.id === client.user.id) return 'bot';
        // 3. Protect highest role hierarchy (cannot kick/ban someone higher than or equal to the bot/executor)
        if (!targetMember.bannable && !targetMember.kickable) return 'hierarchy';
        return false;
    };

    // /info
    if (interaction.commandName === 'info') {
        const infoEmbed = new EmbedBuilder()
            .setTitle('SkyGate Network Info')
            .setColor('#0099FF')
            .addFields(
                { name: 'Website', value: 'skygate.gt.tc', inline: true },
                { name: 'Server IP', value: 'play.skygate.gt.tc', inline: true }
            )
            .setFooter({ text: 'SkyGate Main Utility Bot' });

        return interaction.reply({ embeds: [infoEmbed] });
    }

    // /kick
    if (interaction.commandName === 'kick') {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        if (!target) return interaction.reply({ content: 'Member not found in this server.', ephemeral: true });

        const protectionStatus = isProtected(target);
        if (protectionStatus === 'owner') {
            return interaction.reply({ content: '❌ **Action Denied:** You cannot kick the server owner!', ephemeral: true });
        }
        if (protectionStatus === 'bot') {
            return interaction.reply({ content: '❌ **Action Denied:** The bot cannot kick itself!', ephemeral: true });
        }
        if (protectionStatus === 'hierarchy') {
            return interaction.reply({ content: '❌ **Action Denied:** This user has a role equal to or higher than my permission level.', ephemeral: true });
        }

        try {
            await target.kick(reason);
            await interaction.reply(`✅ Kicked **${target.user.tag}** | **Reason:** ${reason}`);
        } catch (err) {
            await interaction.reply({ content: 'Failed to kick member. Check role hierarchy.', ephemeral: true });
        }
    }

    // /ban
    if (interaction.commandName === 'ban') {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        if (!target) return interaction.reply({ content: 'Member not found in this server.', ephemeral: true });

        const protectionStatus = isProtected(target);
        if (protectionStatus === 'owner') {
            return interaction.reply({ content: '❌ **Action Denied:** You cannot ban the server owner!', ephemeral: true });
        }
        if (protectionStatus === 'bot') {
            return interaction.reply({ content: '❌ **Action Denied:** The bot cannot ban itself!', ephemeral: true });
        }
        if (protectionStatus === 'hierarchy') {
            return interaction.reply({ content: '❌ **Action Denied:** This user has a role equal to or higher than my permission level.', ephemeral: true });
        }

        try {
            await target.ban({ reason });
            await interaction.reply(`⛔ Banned **${target.user.tag}** | **Reason:** ${reason}`);
        } catch (err) {
            await interaction.reply({ content: 'Failed to ban member. Check role hierarchy.', ephemeral: true });
        }
    }
});

client.login(TOKEN);
