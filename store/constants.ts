import type {
	Connection,
	Player,
	RoomConfiguration,
  RoomData,
  RoomTask,
	RoundConfiguration
} from "types/types"

// pusher channel name generators 
const root_name = 'presence-cache-sb'
export const PusherChannel = {
	rooms: () => [root_name, 'lobby'].join('-'),
	room: (room: string) => [root_name, room].join('-'),
	user: (room: string, user: string) => [root_name, room, user].join('-'),
	shortened: (room: string) => room.split(`${root_name}-`)[1],
}

// room phases:
// -lobby: players can change settings and ready up
// -tasking: game is generating prompts or waiting on replies
// -voting: game is collecting voting results from players
// -results: game is showing results and waiting for next round
export enum RoomPhase {
	Lobby = 'lobby',
	Tasking = 'tasking',
	Voting = 'voting',
	Results = 'results'
}

// device mode: viewers or player
// -viewer: /room/[roomcode]/
// -player: /room/[roomcode]/[playername]
export enum UserMode {
	Viewer = 'viewer',
	Player = 'player',
}

// upstash redis dataset keys
export enum Datasets {
	// connection presence
	Presence = 'sb-presence',
	// room data
	Rooms = 'sb-rooms',
	// room prompts
	Prompts = 'sb-prompts',
	// room responses
	Responses = 'sb-responses',
}

// ~ ~ ~ ~ ~ ~
// type defaults...
const DefaultConnection: Connection = {
	id: null,
	mode: UserMode.Viewer,
	room: null,
	channel: null,
	type: null,
	user: null
}

const DefaultPlayer: Player = {
	name: null,
	ids: []
}

// tasks
const PairQuestionTask: RoomTask = {
	minPlayers: 2,
	maxPlayers: 2,
	data: {
		prompts: 1
	}
}

const AllQuestionTask: RoomTask = {
	minPlayers: 1,
	maxPlayers: null,
	data: {
		prompts: 1
	}
}

// rounds
const DefaultRound: RoundConfiguration = {
	tasks: [],
	timerScale: 1,
	scoreScale: 1
}

const DoublePairRound: RoundConfiguration = {
	...DefaultRound,
	tasks: [
		{ ...PairQuestionTask },
		{ ...PairQuestionTask }
	]
}

const SingleGlobalRound: RoundConfiguration = {
	...DefaultRound,
	tasks: [{
		...AllQuestionTask
	}]
}

// rooms
const DefaultRoomConfig: RoomConfiguration = {
	timerScale: 1,
	scoreScale: 1,
	rounds: [{
		...DoublePairRound
	}, {
		...DoublePairRound,
		scoreScale: 2
	}, {
		...SingleGlobalRound,
		scoreScale: 3
	}]
}

const DefaultRoomData: RoomData = {
	code: null,
	config: {
		rounds: [],
	},
  events: [],
  messages: [],
	connections: {},
	viewers: [],
	users: {},
	players: [],
	phase: RoomPhase.Lobby,
	round: 0,
	task: 0,
	prompt: 0,
	prompts: [],
	responses: [],
}

// defaults
export const Defaults = {
	Connection: DefaultConnection,
	Player: DefaultPlayer,
	RoomData: DefaultRoomData,
	RoomConfig: DefaultRoomConfig,
}
