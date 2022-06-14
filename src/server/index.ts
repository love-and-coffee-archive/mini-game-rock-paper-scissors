import { Server, User } from '@love-and-coffee/mini-game-sdk';
import { randomIntFromInterval } from './helpers';
import { initMatchmaker, startMatching } from './matchmaking';
import { initPlayerStates, movePlayerToBattle,  movePlayerToBotBattle,  movePlayerToMainMenu, movePlayerToResults, playerStates } from './player-states';

let gameServer: Server;

const matchDuration = 5;
type Action = 'rock' | 'paper' | 'scissors' | null;

const playerSelectedAction: { [key: string]: Action } = {};


let botUser = new User('bot', 'bot', null, true);


function setRemainingTime(player: User, seconds: number)
{
	gameServer.setPrivateData(player.id, 'remaining-time', seconds);
}


function pickAction(user: User, action: Action)
{
	playerSelectedAction[user.id] = action;
	gameServer.setPrivateData(user.id, 'selected-action', action);
}


function finalizeResults(players: User[])
{
	// determine who won based on playerSelectedAction and increment their score

	// if a player hasn't picked an action pick a random one for them
	const actions = ['rock', 'paper', 'scissors'] as Action[]

	if (playerSelectedAction[players[0].id] == null)    pickAction(players[0], actions[randomIntFromInterval(0, actions.length - 1)]);	// for bot matches, the bot's selection will
	if (playerSelectedAction[players[1].id] == null)    pickAction(players[1], actions[randomIntFromInterval(0, actions.length - 1)]);  // always be empty here


	console.log(playerSelectedAction[players[0].id] + "  ///  " + playerSelectedAction[players[1].id]);


	let playerWhoWon;
	const result = determineWinner(players, playerSelectedAction[players[0].id], playerSelectedAction[players[1].id]);

	if (result === 'tie')
	{
		// reset actions and do another round

		console.log('tie');

		movePlayerToResults(players[0], players[0], 'tie');
		if (!isBot(players[1]))  movePlayerToResults(players[1], players[0], 'tie');

		setTimeout(() => {

			for (let i = 0; i < players.length; i++)
			{
				pickAction(players[i], null);
			}

			startMatch([players[0], players[1]]);

		}, 2000);
	}


	else
	{
		playerWhoWon = result;
		console.log(playerWhoWon.name + " won");

		if (!isBot(playerWhoWon))  gameServer.setScore(playerWhoWon.id, gameServer.getScore(playerWhoWon.id) + 1);


		movePlayerToResults(players[0], players[1], playerWhoWon.id === players[0].id ? 'won' : 'lost');
		if (!isBot(players[1]))  movePlayerToResults(players[1], players[0], playerWhoWon.id === players[1].id ? 'won' : 'lost');


		// Short delay to show vistory/loss animation before we reset player states
		setTimeout(() => {
			// Resets selected player action
			for (let i = 0; i < players.length; i += 1) {

				pickAction(players[i], null);
				if (!isBot(players[i]))  movePlayerToMainMenu(players[i]);

			}
		}, 2000);
	}
}


function startMatch(players: [User, User])
{
	// Setup match timer

	let remainingTime = matchDuration;

	const remainingTimeInterval = setInterval(() => {
		for (let i = 0; i < players.length; i += 1) {
			setRemainingTime(players[i], remainingTime);
		}

		remainingTime -= 1;

		// Starts battle when timer runs to 0
		if (remainingTime <= 0) {
			clearInterval(remainingTimeInterval);

			finalizeResults(players);
		}
	}, 1000);


	// Start battle

	if (isBot(players[1]))   
	{
		movePlayerToBotBattle(players[0], players[1]);
		// movePlayerToBotBattle(players[1], players[0]);
	}

	else
	{
	 	movePlayerToBattle(players[0], players[1]);
	 	movePlayerToBattle(players[1], players[0]);
	}
}


function startBotMatch(player: User)
{
	console.log("start bot match");

	pickAction(botUser, null);
	startMatch([player, botUser]);
}


function isBot(p: User)    // todo: would be better to check if playerStates[0] is 'bot-battle' but that breaks it (currently, adding a client called 'bot' creates a lot of weirdness)
{
	return p.id == 'bot';
}


function determineWinner(players: User[], action1: Action, action2: Action)
{
	if (action1 === action2) return 'tie';

	else
	{
		if (action1 === 'rock')
		{
			if (action2 === 'scissors') return players[0];

			return players[1];
		}

		else if (action1 === 'paper')
		{
			if (action2 === 'rock') return players[0];

			return players[1];
		}

		else if (action1 === 'scissors')
		{
			if (action2 === 'paper') return players[0];

			return players[1];
		}


		else
		{
			console.log('something went wrong in determineWinner(), defaulting to a tie');
		}
	}


	return 'tie';
}


export function initServer(server: Server)
{
	gameServer = server;

	initPlayerStates(gameServer);

	server.register('start-matchmaking', startMatching);
	server.register('pick-action', pickAction);
	server.register('start-bot-match', startBotMatch)

	initMatchmaker(server, 2, startMatch);
}