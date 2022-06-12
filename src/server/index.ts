import { Server, User } from '@love-and-coffee/mini-game-sdk';
import { randomIntFromInterval } from './helpers';
import { initMatchmaker, startMatching } from './matchmaking';
import { initPlayerStates, movePlayerToBattle, movePlayerToMainMenu, movePlayerToResults } from './player-states';

let gameServer: Server;

const matchDuration = 10;
type Action = 'rock' | 'paper' | 'scissors' | null;

const playerSelectedAction: { [key: string]: Action } = {}; 

function setRemainingTime(player: User, seconds: number) {
	gameServer.setPrivateData(player.id, 'remaining-time', seconds);
}

function pickAction(user: User, action: Action) {
	playerSelectedAction[user.id] = action;
	gameServer.setPrivateData(user.id, 'selected-action', action);
}

function finalizeResults(players: User[]) {
	// TODO: determine who won based on playerSelectedAction and increment their score
	// TODO: if player hasn't picked an action then pick a random one for them
	const playerWhoWon = players[randomIntFromInterval(0, players.length - 1)];
	gameServer.setScore(playerWhoWon.id, gameServer.getScore(playerWhoWon.id) + 1);

	movePlayerToResults(players[0], players[1], playerWhoWon.id === players[0].id ? 'won' : 'lost');
	movePlayerToResults(players[1], players[0], playerWhoWon.id === players[1].id ? 'won' : 'lost');

	// TODO: Do another round if players had a tie

	// Short delay to show vistory/loss animation before we reset player states
	setTimeout(() => {
		// Resets selected player action
		for (let i = 0; i < players.length; i += 1) {
			pickAction(players[i], null);
			movePlayerToMainMenu(players[i]);
		}
	}, 2000);
}

function startMatch(players: [User, User]) {
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

export function initServer(server: Server) {
	gameServer = server;

	initPlayerStates(gameServer);

	server.register('start-matchmaking', startMatching);
	server.register('pick-action', pickAction);
	
	// TODO: Register another function that allows player to play against a bot

	initMatchmaker(server, 2, startMatch);
}
