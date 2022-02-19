import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton } from 'discord.js';

var activePolls = new Map();

var messages = new Map();

export const data = new SlashCommandBuilder()
    .setName('si')
    .setDescription('voice-channel strawpoll');

export async function execute(interaction) {
    if (!checkInChannel(interaction)) {
        await interaction.reply({ content: 'You should be in the channel!' });
        return;
    }

    let voiceChannel = interaction.member.voice.channel;
    let row = new MessageActionRow();
    let pollButton = new MessageButton();
    let resetButton = new MessageButton();
    let closeButton = new MessageButton();

    pollButton.setCustomId('poll')
        .setLabel('Select')
        .setStyle('PRIMARY');

    resetButton.setCustomId('restart')
        .setLabel('Restart')
        .setStyle('PRIMARY');

    closeButton.setCustomId('closePoll')
        .setStyle('DANGER')
        .setEmoji('✖️');

    let participants = "Participants: ";
    let users = new Array();

    voiceChannel.members.forEach((value) => {
        participants += ` ${value.user.username}#${value.user.discriminator} `;
        users.push(value.user);
    });

    let guildPolls = null;

    if (activePolls.has(interaction.guild.id)) {
        guildPolls = activePolls.get(interaction.guild.id);
    } else {
        guildPolls = new Map();
        activePolls.set(interaction.guild.id, guildPolls);
    }

    guildPolls.set(voiceChannel.id, users);

    row.addComponents(pollButton, resetButton, closeButton);
    await interaction.reply({ content: `Strawpoll in the channel ${voiceChannel.name}\n${participants}`, components: [row], fetchReply: true })
        .then((message) => messages.set(message.id, interaction.user.id));
}
export async function poll(interaction) {
    if (!checkPerms(interaction) || !checkInChannel(interaction)) {
        return;
    }

    let voiceChannel = interaction.member.voice.channel;
    let guildPolls = activePolls.get(interaction.guild.id);

    if (guildPolls == null || guildPolls == undefined) {
        guildPolls = new Map();
        activePolls.set(interaction.guild.id, guildPolls);
        return;
    }

    let participants = "Participants: ";
    let users = guildPolls.get(voiceChannel.id);

    if (users == null || users == undefined) {
        users = new Array();

        voiceChannel.members.forEach((value) => {
            users.push(value.user);
        });
    }

    let winnerIndex = Math.floor(Math.random() * users.length);
    let winner = users[winnerIndex];

    users.splice(winnerIndex, 1);

    if (users.length <= 0) {
        users = new Array();

        voiceChannel.members.forEach((value) => {
            users.push(value.user);
        });
    }

    guildPolls.set(voiceChannel.id, users);

    users.forEach((user) => {
        participants += ` ${user.username}#${user.discriminator} `;
    });

    await interaction.update({
        content: `Strawpoll in the channel ${voiceChannel.name}\nWinner: ${winner.username}#${winner.discriminator}\n${participants}`
    });
}
export async function restart(interaction) {
    if (!checkPerms(interaction) || !checkInChannel(interaction)) {
        return;
    }

    let voiceChannel = interaction.member.voice.channel;
    let guildPolls = activePolls.get(interaction.guild.id);

    if (guildPolls == null || guildPolls == undefined) {
        guildPolls = new Map();
        activePolls.set(interaction.guild.id, guildPolls);
        return;
    }

    let users = new Array();
    let participants = "Participants: ";

    voiceChannel.members.forEach((value) => {
        participants += ` ${value.user.username}#${value.user.discriminator} `;
        users.push(value.user);
    });

    await interaction.update({
        content: `Strawpoll in the channel ${voiceChannel.name}\n${participants}`
    });

    guildPolls.set(voiceChannel.id, users);
}
export async function close(interaction) {
    if (!checkPerms(interaction, false)) {
        return;
    }

    deletePoll(interaction);
}

async function deletePoll(interaction) {
    try {
        messages.delete(interaction.message.id);
        await interaction.deferUpdate();
        await interaction.deleteReply();
    } catch (e) {
        console.log(e);
        interaction.channel.send(`<@${interaction.user.id}> + ${e}`);
    }
}

function checkPerms(interaction, respond = true) {
    let permission = messages.get(interaction.message.id);

    if (permission == null || permission == undefined) {
        if (respond) {
            interaction.channel.send(`<@${interaction.user.id}> old poll!`)
                .then(message => {setTimeout(() => message.delete(), 5000)});
        }

        deletePoll(interaction);
        return false;
    }

    if (permission != interaction.user.id && !interaction.member.permissions.has('ADMINISTRATOR')) {
        interaction.channel.send(`<@${interaction.user.id}> don't interrupt!`)
            .then(message => {setTimeout(() => message.delete(), 5000)});
        return false;
    }

    return true;
}

function checkInChannel(interaction) {
    voiceChannel = interaction.member.voice.channel;

    if (voiceChannel == null || voiceChannel == undefined) {
        interaction.channel.send(`<@${interaction.user.id}> seems like you are not in the channel!`)
            .then(message => {setTimeout(() => message.delete(), 5000)});
        return false;
    }

    return true;
}