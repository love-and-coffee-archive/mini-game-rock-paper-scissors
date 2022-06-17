import { Client, Server } from '@love-and-coffee/mini-game-sdk';
import './index.scss';
import mainMenuHTML from './main-menu.html';
import matchmakingHTML from './matchmaking.html';
import battleHTML from './battle.html';
import resultsHTML from './results.html';
import { devServer } from '../../webpack.config';
import { randomIntFromInterval } from '../server/helpers';

export async function initClient(gameContainer: HTMLElement, client: Client) {
	let phase: string | null = null;
	let timerElement: HTMLElement;

	// TODO: Split logic in smaller functions
	function renderState(state: any) {
		phase = state.phase;

		if (state.phase === 'main-menu') {
			StartMenuPhase();

		} else if (state.phase === 'matchmaking') {
			StartMatchmakingPhase();


		} else if (state.phase === 'battle' || state.phase === 'bot-battle') {
			StartBattlePhase(state);


		} else if (state.phase === 'results') {
			StartResultsPhase(state);
			

		} else {
			gameContainer.innerHTML = JSON.stringify(state);
		}
	}
	
	
	const clearSetDataListener = client.emitter.on('setData', (key: string, value: any) => {
		if (key === 'state') {
			renderState(value);
		}

		if (key === 'remaining-time' && (phase === 'battle' || phase === 'bot-battle') && timerElement) {
			timerElement.textContent = value;
		}
	});

	renderState(client.getData('state'));

	// TODO: return statement should be the last thing in the function
	// because some might not be aware that code below it won't execute
	// but function declarations would still work.

	// Minigame destroy function
	return () => {
		clearSetDataListener();
	}




	//---PHASE-FUNCTIONS---//

	function StartMenuPhase()
	{
		gameContainer.innerHTML = mainMenuHTML;

		const playVsHumanButton = gameContainer.querySelector('.play-vs-human') as HTMLButtonElement;
		const playVsBotButton = gameContainer.querySelector('.play-vs-bot') as HTMLButtonElement; 

		playVsHumanButton.onclick = () => {
			client.call('start-matchmaking');
		}

		playVsBotButton.onclick = () => {
			client.call('start-bot-match');
		}
	}



	function StartMatchmakingPhase()
	{
		gameContainer.innerHTML = matchmakingHTML;

		// allow the player to cancel matchmaking
		const cancelButton = gameContainer.querySelector('.cancel-matchmaking') as HTMLButtonElement;

		cancelButton.onclick = () => {
			client.call('stop-matchmaking');
		}
	}



	function StartBattlePhase(state: any)
	{
		gameContainer.innerHTML = battleHTML;

		const opponent = client.getUsers()[state.opponent];
		const opponentElement = gameContainer.querySelector('.opponent');

		if (state.phase === 'bot-battle') opponentElement.textContent = 'bot';  
		else opponentElement.textContent = opponent.name;
		
		const opponentAvatarElement = gameContainer.querySelector('.opponent-avatar') as HTMLImageElement;

		if (state.phase !== 'bot-battle')  opponentAvatarElement.src = opponent.getAvatarUrl(32);
		else opponentAvatarElement.src = "https://avatars.dicebear.com/api/pixel-art-neutral/" + randomIntFromInterval(0, 1000) + ".svg?size=150&scale=70";

		const yourAvatarElement = gameContainer.querySelector('.your-avatar') as HTMLImageElement;
		yourAvatarElement.src = client.user.getAvatarUrl(32);



		// select user action and display its state

		const actions = [
			{
				element: gameContainer.querySelector('.action-rock'),
				action: 'rock',
			},
			{
				element: gameContainer.querySelector('.action-paper'),
				action: 'paper',
			},
			{
				element: gameContainer.querySelector('.action-scissors'),
				action: 'scissors',
			},
		];

		for (let i = 0; i < actions.length; i++)
		{
			const element = actions[i].element;
			const selectedAction = actions[i].action;

			element.addEventListener('click', () => {
				for (let j = 0; j < actions.length; j++) {
					const singleAction = actions[j];
					singleAction.element.classList.toggle('selected', singleAction.action === selectedAction);
				}

				console.log("selected " + selectedAction);
				client.call('pick-action', selectedAction);
			});
		}			

		//

		timerElement = gameContainer.querySelector('.timer');
	}



	function StartResultsPhase(state: any)
	{
		gameContainer.innerHTML = resultsHTML;
			
		const resultElement = gameContainer.querySelector('.result');
		const pointsElement = gameContainer.querySelector('.points');

		resultElement.textContent = state.result;


		if (state.result === 'won') {
			pointsElement.textContent = '+5';
		}

		else if (state.result === 'tie')
		{
			pointsElement.textContent = "+1";
		}
	}
}
