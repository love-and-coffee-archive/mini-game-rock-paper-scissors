import { Client, Server } from '@love-and-coffee/mini-game-sdk';
import './index.scss';
import mainMenuHTML from './main-menu.html';
import matchmakingHTML from './matchmaking.html';
import battleHTML from './battle.html';
import resultsHTML from './results.html';
import { devServer } from '../../webpack.config';

export async function initClient(gameContainer: HTMLElement, client: Client) {
	let phase: string | null = null;
	let timerElement: HTMLElement;

	// TODO: Split logic in smaller functions
	function renderState(state: any) {
		phase = state.phase;

		if (state.phase === 'main-menu') {
			// TODO: Make this screen look nice
			gameContainer.innerHTML = mainMenuHTML;

			const playVsHumanButton = gameContainer.querySelector('.play-vs-human') as HTMLButtonElement;
			const playVsBotButton = gameContainer.querySelector('.play-vs-bot') as HTMLButtonElement; 

			playVsHumanButton.onclick = () => {
				client.call('start-matchmaking');
			}


			playVsBotButton.onclick = () => {
				client.call('start-bot-match');
			}



		} else if (state.phase === 'matchmaking') {
			// TODO: Make this screen look nice
			gameContainer.innerHTML = matchmakingHTML;


			// allow the player to cancel matchmaking
			const cancelButton = gameContainer.querySelector('.cancel-matchmaking') as HTMLButtonElement;

			cancelButton.onclick = () => {
				client.call('stop-matchmaking');
			}


		} else if (state.phase === 'battle' || state.phase === 'bot-battle') {
			// TODO: Make this screen look nice
			gameContainer.innerHTML = battleHTML;

			const opponent = client.getUsers()[state.opponent];
			const opponentElement = gameContainer.querySelector('.opponent');

			if (state.phase === 'bot-battle') opponentElement.textContent = 'bot';  
			else opponentElement.textContent = opponent.name;
			
			const opponentAvatarElement = gameContainer.querySelector('.opponent-avatar') as HTMLImageElement;

			if (state.phase !== 'bot-battle')  opponentAvatarElement.src = opponent.getAvatarUrl(32);
			else opponentAvatarElement.src = "https://avatars.dicebear.com/api/bottts/hhhhhhhhhhhhh.svg?size=40";

			const yourAvatarElement = gameContainer.querySelector('.your-avatar') as HTMLImageElement;
			yourAvatarElement.src = client.user.getAvatarUrl(32);



			// select user action and display its state

			const rockElement = gameContainer.querySelector('.action-rock');
			const paperElement = gameContainer.querySelector('.action-paper');
			const scissorsElement = gameContainer.querySelector('.action-scissors');

			const actionElements = [rockElement, paperElement, scissorsElement];

			for (let i = 0; i < actionElements.length; i++)
			{
				actionElements[i].addEventListener('click', function()
				{
					for (let i = 0; i < actionElements.length; i++)
						actionElements[i].classList.toggle('selected', false);	// reset all buttons first so multiple don't get visually selected

					
					// there is probably a much nicer way of doing this
					switch (i)
					{
						case 0:
							// rock
							console.log("selected rock");
							client.call('pick-action', 'rock');
							rockElement.classList.toggle('selected', true);

							return;
						
						case 1:
							// paper
							console.log("selected paper");
							client.call('pick-action', 'paper');
							paperElement.classList.toggle('selected', true);

							return;

						case 2:
							// scissors
							console.log("selected scissors");
							client.call('pick-action', 'scissors');
							scissorsElement.classList.toggle('selected', true);

							return;
					}
				});
			}			

			//

			timerElement = gameContainer.querySelector('.timer');
		} else if (state.phase === 'results') {
			// TODO: Make this screen look nice
			gameContainer.innerHTML = resultsHTML;
			
			const resultElement = gameContainer.querySelector('.result');
			resultElement.textContent = state.result;

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

	// Minigame destroy function
	return () => {
		clearSetDataListener();
	}
}
