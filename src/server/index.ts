import { Server, User } from '@love-and-coffee/mini-game-sdk';
import { debug } from 'webpack';
import { randomIntFromInterval } from './helpers';
import { initMatchmaker, startMatching } from './matchmaking';
import { initPlayerStates, movePlayerToBattle, movePlayerToMainMenu, movePlayerToResults } from './player-states';

let gameServer: Server;

const matchDuration = 10;
type Action = 'rock' | 'paper' | 'scissors' | null;

const playerSelectedAction: { [key: string]: Action } = {}; 

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

	if (playerSelectedAction[players[0].id] == null)    pickAction(players[0], actions[Math.floor(Math.random() * actions.length)]);
	if (playerSelectedAction[players[1].id] == null)    pickAction(players[1], actions[Math.floor(Math.random() * actions.length)]);


	console.log(playerSelectedAction[players[0].id] + "  ///  " + playerSelectedAction[players[1].id]);
	

	let playerWhoWon;
	const result = determineWinner(players, playerSelectedAction[players[0].id], playerSelectedAction[players[1].id]);
	
	if (result === 'tie')
	{
		// reset actions and do another round

		console.log('tie');

		movePlayerToResults(players[0], players[0], 'tie');
		movePlayerToResults(players[1], players[0], 'tie');

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

		gameServer.setScore(playerWhoWon.id, gameServer.getScore(playerWhoWon.id) + 1);

		movePlayerToResults(players[0], players[1], playerWhoWon.id === players[0].id ? 'won' : 'lost');
		movePlayerToResults(players[1], players[0], playerWhoWon.id === players[1].id ? 'won' : 'lost');


		// Short delay to show vistory/loss animation before we reset player states
		setTimeout(() => {
			// Resets selected player action
			for (let i = 0; i < players.length; i += 1) {
				pickAction(players[i], null);
				movePlayerToMainMenu(players[i]);
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
	movePlayerToBattle(players[0], players[1]);
	movePlayerToBattle(players[1], players[0]);
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
			console.log('something went wrong in determineWinner(), defaulting to a tie');
	}
	

	return 'tie';
}


export function initServer(server: Server) 
{
	gameServer = server;

	initPlayerStates(gameServer);

	server.register('start-matchmaking', startMatching);
	server.register('pick-action', pickAction);
	
	// TODO: Register another function that allows player to play against a bot

	initMatchmaker(server, 2, startMatch);
}