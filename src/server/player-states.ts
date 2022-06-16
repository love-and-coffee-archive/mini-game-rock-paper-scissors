import { Server, User } from '@love-and-coffee/mini-game-sdk';

type Phase = 'main-menu' | 'matchmaking' | 'battle' | 'bot-battle' | 'results';
type Result = 'won' | 'lost' | 'tie';

type State = {
	user: User;
	phase: Phase;
	opponent: string | null;
	result: Result | null;
};

let gameServer: Server;

export const playerStates: { [key: string]: State } = {};

export function initPlayerStates(server: Server) {
	gameServer = server;

	gameServer.emitter.on('userConnected', (user: User) => {
		createPlayerStateIfOneDoesntExistYet(user);
	});

	const alreadyConnectedUsers = Object.values(gameServer.getUsers());

	for (let i = 0; i < alreadyConnectedUsers.length; i += 1) {
		createPlayerStateIfOneDoesntExistYet(alreadyConnectedUsers[i]);
	}
}

function createPlayerStateIfOneDoesntExistYet(user: User) {
	if (playerStates[user.id] == null) {
		playerStates[user.id] = {
			user: user,
			phase: 'main-menu',
			opponent: null,
			result: null,
		};

		syncPlayerState(user);
	}
}

export function movePlayerToMainMenu(player: User) {
	playerStates[player.id].phase = 'main-menu';
	playerStates[player.id].opponent = null;
	playerStates[player.id].result = null;
	
	syncPlayerState(player);
}

export function movePlayerToMatchmaking(player: User) {
	playerStates[player.id].phase = 'matchmaking';
	playerStates[player.id].opponent = null;
	playerStates[player.id].result = null;
	
	syncPlayerState(player);
}

export function movePlayerToBattle(player: User, opponent: User) {
	playerStates[player.id].phase = 'battle';
	playerStates[player.id].opponent = opponent.id;
	playerStates[player.id].result = null;
	
	syncPlayerState(player);
}

export function movePlayerToBotBattle(player: User, bot: User)
{
	playerStates[player.id].phase = 'bot-battle';
	playerStates[player.id].opponent = bot.id;
	playerStates[player.id].result = null;

	syncPlayerState(player);
}

export function movePlayerToResults(player: User, opponent: User, result: Result) {
	playerStates[player.id].phase = 'results';
	playerStates[player.id].opponent = opponent.id;
	playerStates[player.id].result = result;
	
	syncPlayerState(player);
}

function syncPlayerState(player: User) {
	gameServer.setPrivateData(player.id, 'state', {
		phase: playerStates[player.id].phase,
		opponent: playerStates[player.id].opponent,
		result: playerStates[player.id].result,
	});
}
