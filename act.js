var fs = require('fs');


function pegaValor(valor){
	
	//encontrar coisas entre ${} e substituir elas por variaveis
	return valor;
}
var pointer = 0;
function cabeca(keywords){
	return keywords[pointer++];
}
function getMaxExperience(level){
	return Math.floor(10.0 * Math.pow(1.1, level));
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
	"mensagem" : function (user, userID, channelID, message, evt, bot){
		if(user != "PauloBot"){
			
			try{
				var programacao = JSON.parse(fs.readFileSync('data/programacao'+evt.d.guild_id+'.json', 'utf8'));
				
				for(var key in programacao.funcoes){
					var funcao = programacao.funcoes[key];
					if(funcao.trigger == "mensagem"){
						var canFire = true;
						if(funcao.user != user && funcao.user != userID && funcao.user != "${any}" && funcao.user != undefined){
							canFire = false;
						}
						if(funcao.channelID != channelID && funcao.channelID != "${any}" && funcao.channelID != undefined){
							canFire = false;
						}
						if(funcao.message != undefined){
							if(funcao.message.start != undefined && !message.toLowerCase().startsWith(funcao.message.start.toLowerCase())){
								canFire = false;
							}
							if(funcao.message.ends != undefined && !message.toLowerCase().endsWith(funcao.message.ends.toLowerCase())){
								canFire = false;
							}
							if(funcao.message.contains != undefined ){
								var contem = false;
								for(var c in funcao.message.contains){
									if(message.toLowerCase().includes(funcao.message.contains[c].toLowerCase())){
										contem = true;
									}
								}
								if(!contem){
									canFire = false;
								}
							}
						}

						if(canFire){
							console.log("Função " + key + " chamada!");
							if(funcao.action.message != undefined){
								
								var ttl = funcao.action.message.msg;
								var all_txt = ttl.split(";");
								var texto = all_txt[Math.floor(Math.random() * all_txt.length)];
								
								for(var v in programacao.variaveis){
									texto = texto.replace("${" + v + "}", programacao.variaveis[v]);
								}
								
								texto = texto.replace("${channel}", channelID);
								texto = texto.replace("${user}", user);
								texto = texto.replace("${userID}", userID);

								var channel = funcao.action.message.channel.replace("${channel}", channelID);
							
								if(funcao.chance == undefined){
									bot.sendMessage({
										to: channel,
										message: texto
									});
								}
								else{
									if(Math.random() < funcao.chance){
										bot.sendMessage({
											to: channel,
											message: texto
										});
									}
								}
									
							}
							if(funcao.action.increment != undefined){
								if(programacao.variaveis[funcao.action.increment.variavel] != undefined){
									var teste = Number(programacao.variaveis[funcao.action.increment.variavel]);
									
									if(!isNaN(teste)){
										
										var adicao = funcao.action.increment.valor;
										
										for(var variavel in programacao.variaveis){
											adicao = adicao.replace("${" + variavel + "}", programacao[variavel]);
										}
										
										programacao.variaveis[funcao.action.increment.variavel] = 
										Number(programacao.variaveis[funcao.action.increment.variavel]) + 
										Number(adicao);
										
										fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', JSON.stringify(programacao, null, 4));
									}
									else{
										bot.sendMessage({
											to: channelID,	
											message: "mano, ce tá tentando somar " + funcao.action.increment.valor + " numa variavel q é um TEXTO, ce é burro?"
										});
										return;
									}
								}
								else{
									bot.sendMessage({
											to: channelID,
											message: "cara, ce ta tentando incrementar uma variavel q nem existe kk, cria essa variavel " + funcao.action.increment.variavel + " primeiro ai mermão"
										});
									return;
								}
								
								
							}
							if(funcao.action.set != undefined){
								if(programacao.variaveis[funcao.action.set.variavel] != undefined){
									
									var novalor = funcao.action.set.valor
									
									for(var variavel in programacao.variaveis){
										novalor = novalor.replace("${" + variavel + "}", programacao[variavel]);
									}
									
									programacao.variaveis[funcao.action.set.variavel] = novalor;
									fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', JSON.stringify(programacao, null, 4));
								}
								else{
									bot.sendMessage({
										to: channelID,
										message: "cara, ce ta tentando sobrescrever uma variavel q nem existe kk, cria essa variavel " + funcao.action.increment.variavel + " primeiro ai mermão"
									});
									return;
								}
							}
							if(funcao.action.multiply != undefined){
								if(programacao.variaveis[funcao.action.increment.variavel] != undefined){
									
									var teste = Number(programacao.variaveis[funcao.action.increment.variavel]);
									if(!isNaN(teste)){
										
										var multi = funcao.action.increment.valor;
										
										for(var variavel in programacao.variaveis){
											multi = multi.replace("${" + variavel + "}", programacao[variavel]);
										}
										
										programacao.variaveis[funcao.action.increment.variavel] = 
										Number(programacao.variaveis[funcao.action.increment.variavel]) *
										Number(multi);
										fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', JSON.stringify(programacao, null, 4));
									}
									else{
										bot.sendMessage({
											to: channelID,
											message: "mano, ce tá tentando multiplicar " + funcao.action.increment.valor + " numa variavel q é um TEXTO, ce é burro?"
										});
										return;
									}
								}
								else{
									bot.sendMessage({
										to: channelID,
										message: "cara, ce ta tentando multiplicar uma variavel q nem existe kk, cria essa variavel " + funcao.action.increment.variavel + " primeiro ai mermão"
									});
									return;
								}
							}
						}
					}
				}
			}
			catch(err){
				console.log(err);
				bot.sendMessage({
					to: channelID,
					message: "Eita cusão, deu alguma merda aqui que MATOU o paulo dias"
				});
				
				bot.sendMessage({
					to: channelID,
					message: err
				});
			}
		}
		
	},
	"criar_mensagem" : function(user, userID, channelID, message, evt, bot){
		
		try{
			pointer = 0;
			
			try{
				var programacao = JSON.parse(fs.readFileSync('data/programacao'+evt.d.guild_id+'.json', 'utf8'));
			}
			catch(err){
				return;
			}
			if(user != "PauloBot" && message.startsWith("paulo, ")){
				
				var keywords = message.substr(7).split(" ");
				
				//pointer é a cabeça da agulha, que passa por todos os comandos analizando a sintaxe
				var ini = cabeca(keywords);
				if(ini == "criar"){
					var proxx = cabeca(keywords);
					if(proxx == "comando"){
						//inicializa o comando
						var comando = {
							funcoes : {}
						};
						//define o nome da função
						var funcao_nome = cabeca(keywords);
						
						if(programacao.funcoes[funcao_nome] != undefined){
							bot.sendMessage({
								to: channelID,
								message: "UEPA! uma função já existe com esse nome"
							});
							return true;
						}
						
						comando.funcoes[funcao_nome] = {};

						//procura o trigger
						if(cabeca(keywords) == "quando"){
							//define o trigger
							comando.funcoes[funcao_nome].trigger = cabeca(keywords);
							//procura filtro
							if(cabeca(keywords) == "for"){
								
								var continua = true;
								
								while(continua){
									//filtro de pessoa
									var proximo = cabeca(keywords);
									if(proximo == "do"){
										var nome = cabeca(keywords);
										//checa se tem , no final, significa que tem mais filtros depois
										if(nome.endsWith(',')){
											nome = nome.substr(0, nome.length - 1);
										}
										else{
											continua = false;
										}
										comando.funcoes[funcao_nome].user = nome;
									}
									//filtro de canal
									else if(proximo == "canal"){
										var canal = cabeca(keywords);
										//checa se tem , no final, significa que tem mais filtros depois
										if(canal.endsWith(',')){
											canal = canal.substr(0, canal.length - 1);
										}
										else{
											continua = false;
										}
										comando.funcoes[funcao_nome].channelID = canal;
									}
									else if(proximo == "mensagem"){
										var continua2 = true;
										comando.funcoes[funcao_nome].message = {};
										while(continua2){
											//inicializa as mensagens
											
											var proximo = cabeca(keywords);
											//filtro de inicio
											if(proximo == "comeca"){
												pointer ++; //passa o "com", não serve pra nada a não ser estético
												texto = "\"  ";
												lista = [];
												while(!texto.endsWith("\"") && !texto.endsWith("\",")){
													texto = cabeca(keywords);
													lista.push(texto);
												}
												pointer--;
												lista[0] = lista[0].substr(1);
												if(lista[lista.length-1].endsWith('\,')){
													lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
												}
												else{
													continua2 = false;
												}
												
												lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
												
												texto = lista.join(" ");
												comando.funcoes[funcao_nome].message.start = texto;
											}
											//filtro do fim
											else if(proximo == "termina"){
												pointer ++; //passa o "com", não serve pra nada a não ser estético
												texto = "\"  ";
												lista = [];
												while(!texto.endsWith("\"") && !texto.endsWith("\",")){
													texto = cabeca(keywords);
													lista.push(texto);
												}
												pointer--;
												lista[0] = lista[0].substr(1);
												if(lista[lista.length-1].endsWith('\,')){
													lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
												}
												else{
													continua2 = false;
												}
												
												lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
												
												texto = lista.join(" ");
												comando.funcoes[funcao_nome].message.ends = texto;
											}
											//array de contains
											else if(proximo == "contem"){
												texto = "\"  ";
												lista = [];
												while(!texto.endsWith("\"") && !texto.endsWith("\",")){
													texto = cabeca(keywords);
													lista.push(texto);
												}
												pointer--;
												lista[0] = lista[0].substr(1);
												if(lista[lista.length-1].endsWith('\,')){
													lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
												}
												else{
													continua2 = false;
												}
												
												lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
												
												texto = lista.join(" ");
												comando.funcoes[funcao_nome].message.contains = texto.split(";");
											}
											else{
												continua2 = false;
											}
										}

									}
									else if(proximo == undefined){
										continua = false;
									}
									else{
										console.log("não entendi o filtro de pessoa: " + proximo);
										continua = false;
									}
								}
								
								var acoes = true;
								comando.funcoes[funcao_nome].action = {};
								
								while(acoes){
									pointer--;
									var proximo = cabeca(keywords);
									console.log("Checando ação " + proximo);
									if(proximo == "diga"){
										
										var texto = "\"  ";
										var lista = [];
										while(!texto.endsWith("\"")){
											texto = cabeca(keywords);
											lista.push(texto);
										}
										
										lista[0] = lista[0].substr(1);
										if(lista[lista.length-1].endsWith('\,')){
											lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
										}
												
										lista[lista.length-1] = lista[lista.length-1].substr(0, lista[lista.length-1].length - 1);
										
										texto = lista.join(" ");
										
										pointer++; pointer++; //ignora o "no canal"
										
										var canal = cabeca(keywords);
										if(canal.endsWith(",")){
											canal = canal.substr(0, canal.length - 1);
										}
										else{
											act = false;
										}
										pointer++;
										comando.funcoes[funcao_nome].action.message = {};
										comando.funcoes[funcao_nome].action.message.msg = texto;
										comando.funcoes[funcao_nome].action.message.channel = canal;
			
									}
									else if(proximo == "incremente"){
										var variavel = cabeca(keywords);
										pointer++;
										var valor = cabeca(keywords);
										if(valor.endsWith(",")){
											valor = valor.substr(0, valor.length - 1);
										}
										else{
											act = false;
										}
										comando.funcoes[funcao_nome].action.increment = {}
										comando.funcoes[funcao_nome].action.increment.variavel = variavel;
										comando.funcoes[funcao_nome].action.increment.valor = valor;
									}
									else if(proximo == "sobrescreva"){
										var variavel = cabeca(keywords);
										pointer++;
										var valor = cabeca(keywords);
										if(valor.endsWith(",")){
											valor = valor.substr(0, valor.length - 1);
										}
										else{
											act = false;
										}
										comando.funcoes[funcao_nome].action.set = {};
										comando.funcoes[funcao_nome].action.set.variavel = variavel;
										comando.funcoes[funcao_nome].action.set.valor = valor;

									}
									else if(proximo == "multiplique"){
										var variavel = cabeca(keywords);
										pointer++;
										var valor = cabeca(keywords);
										if(valor.endsWith(",")){
											valor = valor.substr(0, valor.length - 1);
										}
										else{
											act = false;
										}
										comando.funcoes[funcao_nome].action.multiply = {};
										comando.funcoes[funcao_nome].action.multiply.variavel = variavel;
										comando.funcoes[funcao_nome].action.multiply.valor = valor;
									}
									else if(proximo == undefined){
										acoes = false;
									}
									else{
										acoes = false;
										console.log("não entendi ação " + proximo);
									}
								}
								
								
								if(isEmpty(comando.funcoes[funcao_nome].action)){
									bot.sendMessage({
										to: channelID,
										message: "Porra, mas essa função n faz nada"
									});
									return true;
								}
								
							}
							else{
								console.log('não entendi o comando, faltou o filtro');
							}
						}
						else{
							console.log("Não entendi o comando, faltou o filtro 'quando'");
						}
						var porcentagem = cabeca(keywords);
						if(porcentagem != undefined && porcentagem.startsWith("%")){
							porcentagem = Number(porcentagem.replace("%", "")) / 100;
							//comando.funcoes[funcao_nome].
							//= porcentagem;
						}
						
						programacao.funcoes[funcao_nome] = comando.funcoes[funcao_nome];
						var stringified = JSON.stringify(programacao, null, 4);
						if(stringified == undefined){console.log("epa deu erro no stringify"); return;}
						fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', stringified);
						bot.sendMessage({
							to: channelID,
							message: "Enois porra, vc criou uma função maluca chamada " + funcao_nome
						});
						return true;
					}
					else if (proxx == "variavel"){
						var nome = cabeca(keywords);
						if(programacao.variaveis[nome] != undefined){
							bot.sendMessage({
								to: channelID,
								message: "UEPA! uma variavel já existe com esse nome"
							});
							return true;
						}
						
						pointer++; pointer++; //"com valor";
						var valor = cabeca(keywords);
						programacao.variaveis[nome] = valor;
						fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', JSON.stringify(programacao, null, 4));
						bot.sendMessage({
							to: channelID,
							message: "Enois porra, vc criou a variavel " + nome + " com o valor inicial " + valor
						});
						return true;
					}
				}
				else if(message.toLowerCase().includes('nivel?') || message.toLowerCase().includes('nível?')){
					var experience = JSON.parse(fs.readFileSync('data/experience'+evt.d.guild_id+'.json', 'utf8'));
					bot.sendMessage({
						to: channelID,
						message: user + ", você tá no nivel " + experience[userID].level +
						"\n XP: (" + experience[userID].xp + "/" + getMaxExperience(experience[userID].level) + ")"
					});
					return true;
				}
				else if(message.toLowerCase().includes('id desse canal?')){
					bot.sendMessage({
						to: channelID,
						message: "o id desse canal é o " + channelID
					});
					return true;
				}
				else if(message.toLowerCase().includes('qual meu id?')){
					bot.sendMessage({
						to: channelID,
						message: user + ", seu id é " + userID
					});
					return true;
				}
				else if(ini == "deletar"){
					
					var varofunc = cabeca(keywords);
					
					if(varofunc == "funcao"){
						var funcao_del = cabeca(keywords);
					
						if(programacao.funcoes[funcao_del] == undefined){
							bot.sendMessage({
								to: channelID,
								message: "Amigão, essa função n existe não kk"
							});
						}
						else{
							programacao.funcoes[funcao_del] = undefined;
							fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', JSON.stringify(programacao, null, 4));
							bot.sendMessage({
								to: channelID,
								message: "tabom, ja q tu n quer essa MERDA, então eu apaguei a função " + funcao_del
							});
						}
					}
					else if(varofunc == "variavel"){
						var var_del = cabeca(keywords);
					
						if(programacao.variaveis[var_del] == undefined){
							bot.sendMessage({
								to: channelID,
								message: "Amigão, essa variavel n existe não kk"
							});
						}
						else{
							programacao.variaveis[var_del] = undefined;
							fs.writeFileSync('data/programacao'+evt.d.guild_id+'.json', JSON.stringify(programacao, null, 4));
							bot.sendMessage({
								to: channelID,
								message: "tabom, ja q tu n quer essa MERDA, então eu apaguei a variavel " + var_del
							});
						}
					}
					return true;
				}
				else if (ini == "listar"){
					var prx = cabeca(keywords);
					
					if(prx == "comandos"){
						
						var pradizer = "";
						for(var keys in programacao.funcoes){
							pradizer += keys + "\n";
						}
						
						bot.sendMessage({
							to: channelID,
							message: "Ok, essas são as funções q existem: \n" + pradizer
						});
					}
					else if(prx == "variaveis"){
						var pradizer = "";
						for(var keys in programacao.variaveis){
							pradizer += keys + "\n";
						}
						
						bot.sendMessage({
							to: channelID,
							message: "Ok, essas são as variaveis q existem: \n" + pradizer
						});
					}
					else{
						bot.sendMessage({
							to: channelID,
							message: "vc quer q eu liste O QUE caralho"
						});
					}
					return true;
				}
				else if(ini == "mostrar"){
					var variavo = cabeca(keywords);
					
					if(programacao.variaveis[variavo] != undefined){
						bot.sendMessage({
							to: channelID,
							message: "ok, então o valor da variavel " + variavo + " atualmente é " + programacao.variaveis[variavo]
						});
						
					}
					else{
						bot.sendMessage({
							to: channelID,
							message: "consagradíssimo, essa variavel hai de existir :("
						});
					}
					
					return true;
				}
				else if(ini == "descrever"){
					var comando = cabeca(keywords);
					
					if(programacao.funcoes[comando] != undefined){
						bot.sendMessage({
							to: channelID,
							message: "A função " + comando + "funciona dessa forma: \n" + JSON.stringify(programacao.funcoes[comando], null, 2)
						});
					}
					else{
						bot.sendMessage({
							to: channelID,
							message: "que? caralho q função maluca é essa q eu n to sabendo"
						});
					}
					return true;
				}
				else{
					bot.sendMessage({
						to: channelID,
						message: "Eu num intindi o qi o " + user + " falo"
					});
					return true;
				}
			}
		}
		catch(err){
				bot.sendMessage({
					to: channelID,
					message: "Eita cusão, deu alguma merda aqui que MATOU o paulo dias"
				});
				
				bot.sendMessage({
					to: channelID,
					message: err
				});
				return true;
			}
	}
}