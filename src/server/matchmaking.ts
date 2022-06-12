import { Server, User } from '@love-and-coffee/mini-game-sdk';
import { movePlayerToMatchmaking, playerStates } from './player-states';

let gameServer: Server;
let numberOfPlayersToMatch = 2;
let usersReadyToMatch: User[] = [];
let startMatch: (players: User[]) => void;

// If enough players are ready to be matched then start a match
function tryToStartMatch() {
	if (usersReadyToMatch.length < numberOfPlayersToMatch) {
		return;
	}

	const players: User[] = [];

	for (let i = 0; i < numberOfPlayersToMatch; i += 1) {
		players.push(usersReadyToMatch.shift());
	}

	startMatch(players);
}

export function startMatching(user: User) {
	if (playerStates[user.id].phase !== 'main-menu') {
		return;
	}

	movePlayerToMatchmaking(user);

	usersReadyToMatch.push(user);

	tryToStartMatch();
}

export function initMatchmaker(server: Server, minPlayers: number, startMatchCallback: (players: User[]) => void) {
	gameServer = server;
	numberOfPlayersToMatch = minPlayers;
	startMatch = startMatchCallback;

	gameServer.emitter.on('userConnected', (user: User) => {
		if (playerStates[user.id].phase === 'matchmaking') {
			usersReadyToMatch.push(user);

			tryToStartMatch();
		}
	});

	const playersInMatchmakingState = Object.values(playerStates).filter(state => state.phase === 'matchmaking');

	for (let i = 0; i < playersInMatchmakingState.length; i += 1) {
		const playerState = playersInMatchmakingState[i]

		usersReadyToMatch.push(playerState.user);

		tryToStartMatch();
	}
	
	gameServer.emitter.on('userDisconnected', (user: User) => {
		usersReadyToMatch = usersReadyToMatch.filter(readyUser => readyUser.id !== user.id);
	});

	tryToStartMatch();
}
