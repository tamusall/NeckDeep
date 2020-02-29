/* eslint-disable no-tabs */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const queue = new Map();
const cancer = ['!play https://www.youtube.com/watch?v=-uynAoB9B4Y',
  '!play https://www.youtube.com/watch?v=83gnPZP45kA&list=PLCh1FZ00v9uDTvloj01cfvfvoj-gsxQsA&index=4',
  '!play https://www.youtube.com/watch?v=gRsW4cvZiBM&list=PLCh1FZ00v9uDTvloj01cfvfvoj-gsxQsA&index=3',
  '!play https://www.youtube.com/watch?v=UMafbMlmA5s&list=PLCh1FZ00v9uDTvloj01cfvfvoj-gsxQsA&index=12',
  '!play https://www.youtube.com/watch?v=AFkxA5Ae8KQ&list=PLCh1FZ00v9uDTvloj01cfvfvoj-gsxQsA&index=16',
  '!play https://www.youtube.com/watch?v=h0urA0GZZjI&list=PLCh1FZ00v9uDTvloj01cfvfvoj-gsxQsA&index=24'];

client.once('ready', () => {
  console.log('ready');
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('message', (message) => {
  if (message.author.id === '191544331058806784') {
    if (message.content === 'lifes not out to get you') {
      message.delete()
        .catch(console.error);
    }
  }
});

client.on('message', (message) => {
  if (message.content === 'lifes not out to get you') {
    const channels = client.channels;

    const serverQueue = queue.get(message.guild.id);

    for (const [channelKey, channelValue] of channels.entries()) {
      if (channelValue.type === 'voice') {
        if (channelValue.members.size >= 1) {
          let random = Math.random() * 1000000;
          console.log(random);
          setInterval(() => {
            let randomIndex = getRandomInt(4);
            message.content = cancer[randomIndex];
            console.log(randomIndex);
            channelValue.join()
              .catch(console.error);
            setTimeout(() => {
              execute(message, serverQueue);
            }, 1000);
            random = Math.random() * 1000000;
            console.log(random);
          }, random);
        }
      }
    }
  }
});

async function execute(message, serverQueue) {
  const args = await message.content.split(' ');

  const voiceChannel = message.member.voiceChannel;
  if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send('I need the permissions to join and speak in your voice channel!');
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url,
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 2,
      playing: true,
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      const connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', () => {
      console.log('Music ended!');
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', (error) => {
      console.error(error);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

client.login(process.env.BOT_TOKEN);
