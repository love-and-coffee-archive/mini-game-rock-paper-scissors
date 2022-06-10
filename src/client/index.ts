import { Client } from '@smiletime/mini-game-sdk';
import './index.scss';
import html from './index.html';

export async function initClient(gameContainer: HTMLElement, client: Client) {
	let totalTaps = 0;
	let yourTaps = 0;

	let totalTapContainer: HTMLElement;
	let yourTapContainer: HTMLElement;
	let tapArea: HTMLElement;

	// Render game state from server together with local changes that haven't been delivered to server yet
	function renderTaps() {
		totalTapContainer.innerText = totalTaps.toLocaleString();
		yourTapContainer.innerText = yourTaps.toLocaleString();
	}

	// Add game html and acquire references to key game elements
	gameContainer.innerHTML += html;

	totalTapContainer = gameContainer.querySelector('.total-taps');
	yourTapContainer = gameContainer.querySelector('.your-taps');
	tapArea = gameContainer.querySelector('.game');

	tapArea.onclick = async (e) => {
		yourTaps += 1;
		totalTaps += 1;

		client.call('tap');

		renderTaps();
	};

	// Update total tap value when server game state updates
	const clearSetDataListener = client.emitter.on('setData', (key: string, value: any) => {
		if (key === 'total-taps') {
			totalTaps = value;

			renderTaps();
		}
	});

	// Get current game state from server
	totalTaps = client.getData('total-taps') ?? 0;
	yourTaps = client.getData('your-taps') ?? 0;

	renderTaps();

	// Minigame destroy function
	return () => {
		clearSetDataListener();
	}
}
