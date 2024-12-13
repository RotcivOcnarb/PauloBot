// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Intents } = require('discord.js');
const { token } = require('./auth.json');
var fs = require('fs');
var act = require('./act.js');

console.log(token);

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.Guilds
] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('messageCreate', (message) => {
	
	let data = JSON.parse(JSON.stringify(message));
	let authorID = data.authorId;
	const user = client.users.cache.find((user) => user.id === authorID);

	mensagem(user.displayName, authorID, data.channelId, data.content, {d:{guild_id: data.guildId}});
});

// Log in to Discord with your client's token
client.login(token);

let bot = {
	sendMessage: (obj) => {
		client.channels.cache.get(obj.to).send(obj.message);
	}
};

function mensagem(user, userID, channelID, message, evt){
	crianovo(evt.d.guild_id, channelID);
	
	var experience = JSON.parse(fs.readFileSync('data/experience'+evt.d.guild_id+'.json', 'utf8'));
	if(!act.criar_mensagem(user, userID, channelID, message, evt, bot)){
		act.mensagem(user, userID, channelID, message, evt, bot)
	}
	
	
	if(user != "PauloBot"){
		if(experience[userID] == undefined){
			bot.sendMessage({
					to: channelID,
					message: "Opa, encontrei gente nova, adicionando " + user + " pra minha lista de pessoas"
				});
			experience[userID] = {
				xp: 0,
				level: 1
			};
		}
		
		experience[userID].xp ++;
		if(experience[userID].xp > getMaxExperience(experience[userID].level)){
			experience[userID].xp -= getMaxExperience(experience[userID].level);
			experience[userID].level ++;
			
			var restante = getMaxExperience(experience[userID].level) - experience[userID].xp;
			
			bot.sendMessage({
					to: channelID,
					message: user + " UPOU PRO LEVEL " + experience[userID].level + " PORRAAAAAAAA\nfalta mais " + restante + 
					" xp pra upar pro proximo nivel"
				});
			console.log(user + " upou pro nivel " + experience[userID].level);
		}
		if(JSON.stringify(experience, null, 4).length > 2){
			fs.writeFileSync('data/experience'+evt.d.guild_id+'.json', JSON.stringify(experience, null, 4));
		}
		
	}
}

function crianovo(server, channelID){
	if(!fs.existsSync('data/experience'+server+'.json')){
			fs.writeFileSync('data/experience'+server+'.json', "{}");
		}
		
		var padrao = {
			"funcoes" : {},
			"variaveis": {}
		}
		
		if(!fs.existsSync('data/programacao'+server+'.json')){
			fs.writeFileSync('data/programacao'+server+'.json', JSON.stringify(padrao, null, 4));
			
			bot.sendMessage({
				to: channelID,
				message: "EITA, CHEGUEI NESSA PORRA, pra ver os comandos q eu manjo, só entrar nesse site aqui http://discordpaulobot.openode.io/"
			});
		}
}

function getMaxExperience(level){
	return Math.floor(10.0 * Math.pow(1.1, level));
}
