const Discord = require('discord.js');
const CronJob = require('cron').CronJob;
require('dotenv').config();
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const job = new CronJob('0 0 12 * * 3', function() {
    const channel = client.channels.cache.get('766423834915897387');
    channel.send('Happy hump day! :camel:');
  });
  job.start();
});

client.on('message', msg => {
  if (msg.content.toLocaleLowerCase() === 'ping') {
    msg.reply('pong!');
  }
});

client.on('messageReactionAdd', (reaction, user) => {
  console.log('a reaction has been added to rules message');
  if (reaction.message.channel.name == "marvin-rules" &&
    reaction.message.content.includes("NEW SERVER MEMBERS")) {
    const marvinRole = reaction.message.guild.roles.cache.find(role => role.name === "Marvin");
    const memberToAssign = reaction.message.guild.members.cache.get(user.id);
    if (memberToAssign.roles.cache.has(marvinRole.id)) {
      return;
    } else {
      memberToAssign.roles.add(marvinRole).catch(console.error);
    }
  }
});

client.on('raw', packet => {
  if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return;
  const channel = client.channels.cache.get(packet.d.channel_id);
  if (channel.messages.cache.has(packet.d.message_id)) return;
  channel.messages.fetch(packet.d.message_id).then(message => {
    const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
    const reaction = message.reactions.cache.get(emoji);
    // Adds the currently reacting user to the reaction's users collection.
    if (reaction) reaction.users.cache.set(packet.d.user_id, client.users.cache.get(packet.d.user_id));
    // Check which type of event it is before emitting
    if (packet.t === 'MESSAGE_REACTION_ADD') {
      client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
    }
  });
});

client.login(process.env.TOKEN);