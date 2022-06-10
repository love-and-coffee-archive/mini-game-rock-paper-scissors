import { Server } from '@smiletime/mini-game-sdk';

let totalTaps = 0;
let callerTaps: { [key: string]: number } = {};

export function initServer(server: Server) {
	// Register function 'tap' that can be called by clients
	server.register('tap', (caller) => {
		// Locally update total amount of taps taken place
		totalTaps += 1;
		server.setData('total-taps', totalTaps);

		if (callerTaps[caller.id] == null) {
			callerTaps[caller.id] = 0;
		}

		// Update caller private tap state and store it in storage available to that client only
		callerTaps[caller.id] += 1;
		server.setData('your-taps', callerTaps[caller.id], caller.id);

		// Update user score in leaderboard
		server.setScore(caller.id, callerTaps[caller.id]);

		return true;
	});
}
