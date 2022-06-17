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

export function initPlayerStates(server: Server) 
{
	gameServer = server;

	gameServer.emitter.on('userConnected', (user: User) => {
		createPlayerStateIfOneDoesntExistYet(user);
	});

	const alreadyConnectedUsers = Object.values(gameServer.getUsers());

	for (let i = 0; i < alreadyConnectedUsers.length; i += 1) 
	{
		createPlayerStateIfOneDoesntExistYet(alreadyConnectedUsers[i]);
	}
}

function createPlayerStateIfOneDoesntExistYet(user: User) 
{
	if (playerStates[user.id] == null) 
	{
		playerStates[user.id] = {
			user: user,
			phase: 'main-menu',
			opponent: null,
			result: null,
		};

		syncPlayerState(user);
	}
}



export function movePlayerToMainMenu(player: User) 
{
	updateState(player, 'main-menu');
}


export function movePlayerToMatchmaking(player: User) 
{
	updateState(player, 'matchmaking')
}


export function movePlayerToBattle(player: User, opponent: User) 
{
	updateState(player, 'battle', opponent.id);
}


export function movePlayerToBotBattle(player: User, bot: User)
{
	updateState(player, 'bot-battle', bot.id)
}


export function movePlayerToResults(player: User, opponent: User, result: Result) 
{
	updateState(player, 'results', opponent.id, result);
}


function syncPlayerState(player: User) {
	gameServer.setPrivateData(player.id, 'state', {
		phase: playerStates[player.id].phase,
		opponent: playerStates[player.id].opponent,
		result: playerStates[player.id].result,
	});
}


function updateState(player: User, phase: Phase, opponent: string = null, result: Result = null)
{
	playerStates[player.id].phase = phase;
	playerStates[player.id].opponent = opponent;
	playerStates[player.id].result = result;

	syncPlayerState(player);
}
