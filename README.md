# Mini Game - Tapper

Game where players tap the screen and total number of taps made by all players is displayed for everyone

## Setup

1. Clone or download this repository
2. Run `npm install` to install all dependencies
3. Run `npm run dev` which will open a browser tab with Mini game development environment to play and test the game

## Development

Game consists of two parts - client and server side which you can find in `src/client` and `src/server` accordingly. Each one of them has to implement a single function to initialize game client and server called `initClient` and `initServer`.

### initClient

You will receive 2 arguments when client connects.

1. **HTMLElement** where that you can use to render your game
2. **Client** object that has useful methods to interact with game Server and information about player that's opened the game

Check all available methods and data available in **Client** object below.

### initServer

You will have access to **Server** object to communicate with game clients, manage game state and register functions/endpoints clients can call.

Check all available methods and data available in **Server** object below.

## Client

Reference of available data, methods and events available through **Client** object.

### user

Gives information about player using this game client.

```
console.log(client.user) // { id: 'mark-123', name: 'Mark'}
```

### getData(key: string): any

Used to get persistent stored data from game server.

If key is set for specific player (Private state) then that value will be used instead of key set for all players (Public state)

```
public 'taps' key value is set to '5'
private 'taps' key value for 'user1' is set to '2'


// When called by user1
client.getData('taps'); // 2

// When called by user2
client.getData('taps'); // 5

// When called by user3
client.getData('taps'); // 5
```

### async call(key: string, data?: any): Promise<any>

Used to execute registered function in game server. This call returns a Promise so we have to wait for it to execute (e.g. using `await`) before we can check its result.

```
const response = await client.call('tap', 10);
```

### getUsers()


### emitter

Instance of event emitter to listen for events happening in the system. For example, listen for specific data being updated and react to that change.

```
// Called every time game server has updated public or private persistant data for this user
client.emitter.on('setData', (key: string, value: any) => {
	// Look for specific key change

	if (key === 'taps') {
		// Do something when 'taps' key has been updated, e.g. render it on screen
	}
});
```

## Server

Returns a list of users that have been connected to game server. You can get all currently connected users by filtering user list by `isConnected` flag.

```
client.getUsers(); // returns all users
client.getUsers().filter(user => user.isConnected); // returns only users that are online right now
```

### setData(key: string, data: any, id?: string): void

Set persistent data that's sent and accessible by one player (private) or all players (public).

```
// Set data available to everyone
server.setData('total-taps', 43); // alias to server.setPublicData(...)

// Set data that's only available to player with `user_id`
server.setData('your-taps', 10, user_id); // alias to server.setPrivateData(...)
```

### getData(key: string, id?: string): any

Used to get previously publically stored data or data for specific user.

If key is set for specific player (Private state) then that value will be used instead of key set for all players (Public state) when user id is specfified.

```
public 'taps' key value is set to '5'
private 'taps' key value for 'user1' is set to '2'

server.getData('taps'); // 5 - alias to server.getPublicState(...)
server.getData('taps', 'user1'); // 2 - alias to server.getPrivateState(...)
server.getData('taps', 'user2'); // 5 - alias to server.getPrivateState(...)
```

### register(key: string, callback: (caller: User, data?: any) => void): void

Registers function that can be called by game clients.

```
server.register('tap', async (caller, data) => {
	console.log(caller, data);
});

client.call('tap', 11); // { id: "user-1", name: "Tom" },  11
```

### setScore(id: string, score: number)

You can publish player scores to scoreboard that will be visible to all users in order of highest score on top.

```
server.setScore('user-1', 14);
```

### getUsers()

Returns a list of users that have been connected to game server. You can get all currently connected users by filtering user list by `isConnected` flag.

```
server.getUsers(); // returns all users
server.getUsers().filter(user => user.isConnected); // returns only users that are online right now
```

### emitter

Instance of event emitter to listen for events happening in the system. For example, listen for specific data being updated and react to that change.

```
// Called every time game server has updated public persistant data for all users
client.emitter.on('setPublicData', (key: string, value: any) => {
	if (key === 'total-taps') {
		// Do something when 'total-taps' key has been updated
	}
});

// Called every time game server has updated private persistant data for a specific user
client.emitter.on('setPrivateData', (id: string, key: string, value: any) => {
	if (id == "specific-user-id") {
		if (key === 'your-taps') {
			// Do something when 'your-taps' key has been updated for user with id "specific-user-id"
		}
	}
});
```
