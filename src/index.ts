import { initTestEnvironment } from '@smiletime/mini-game-sdk';
import { initClient } from './client';
import { initServer } from './server';

const pjson = require('../package.json');

initTestEnvironment(
	initServer, 
	initClient, 
	{
		gameTag: pjson.name,
		clientSizes: [
			"s",
			"m",
			"l",
			"400x400"
		],
	}
);
