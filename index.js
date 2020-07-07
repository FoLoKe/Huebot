const Discord = require('discord.js');
const bot = new Discord.Client();
const token = process.env.TOKEN;

const exampleEmbed = new Discord.MessageEmbed().setImage('https://unvegetariano.com/images/sad-cat-png-3.png');
var logChannel;

bot.on('ready', () => {
	console.log('bot online');
	bot.guilds.cache.forEach(server => {
		server.channels.cache.forEach(channel => {
			if(channel.name == "���") {
				channel.send('� ������');
				logChannel = channel;
			}
			//channel.send('� �����');
		});
	});
	
	
});

bot.on('userUpdate', (oldUser, newUser) => {
	logChannel.send(newUser);
});

bot.on('message', msg=>{
	if(msg.content == "HELLO"){
		msg.reply('SOSI HUI ' + msg.author.username);
	}
});

bot.on('message', msg=>{
	if(msg.content == "���" || msg.content == "���"){
    msg.channel.send(msg.author.username + ' ���� ���');
	}
});

bot.on("guildMemberAdd", member => {
    member.send(exampleEmbed)
        .catch(console.error);
});

bot.on('message', msg=>{
	if(msg.content == "embed") {
    msg.channel.send(exampleEmbed);
	}
});

bot.on('message', msg=> {
  var splitted = msg.content.split(' ');
  if(splitted.length > 1) {
    if((splitted[0] == ("roll")) || (splitted[0] == ("����"))) {
      var number = Math.floor(Math.random() * splitted[1] + 1);
      var response = '' + number;
      if(number == 1) {
        response += ' (����������� �������)';
      } else if (number == splitted[1]) {
        response += ' (Critical damage)';
      }
       msg.reply(response);
    }
  }
});

bot.login(token);