// jackbox style game - multiplayer chat room.
// players go multiple rounds answering questions
// and then voting on the best answer.
import { UserMode, RoomPhase } from '../store/constants';

// viewer is a device connection to a room that has 
// no name set [i.e. 'jumbotron'/TV shared view mode]
export interface Connection {
	id: string;
	room: string;
	channel: string;
	type: string;
	mode: UserMode;
	user: string;
	data?: any;
}

// player is a device connection to a room that has 
// a name set. they aren't necessarily an active player
// in that they're receiving tasksed prompts but they can
// also participate as audience etc.
export interface Player {
	name: string;
	ids: string[];
	data?: any;
}

// a task is a prompt style with rules about how to answer
// and how many players are required to answer
export interface RoomTask {
	minPlayers?: number;
	maxPlayers?: number;
	data?: any;
}

// a prompt is an instance of a task
// with a list of responses
export interface RoomPrompt {
	// array index of this prompt
	id: number;
	// task that generated this prompt
	round: number;
	// task that generated this prompt
	task: number;
	// everyone who got this prompt
	players: string[];
}

// a response is a player's response to a prompt
// NOTE: storing the ID of the prompt is necessary
// because the responses may be shuffled within the 
// room prior to voting. the votes however will be
// stored by response ID, so we need to be able to
// map the response ID to the prompt ID.
export interface PlayerResponse {
  // prompt id
  prompt: number;
  // player name
  player: string;
  // arbitrary response data
  data: any;
}

// room vote is a single player's vote intake
// for a given response to a prompt
export interface RoomVote {
	// prompt id for the responses
	prompt: number;
	// responses indexed to players
	responses: PlayerResponse[];
	// vote results for each repsponse
	votes: [{
		// voters for this response
    voters: string[]
    // score outcome for this user
    score: number;
  }];
}

// round is a list of player tasks
// and a score modifier
export interface RoundConfiguration {
	timerScale?: number;
	scoreScale?: number;
	tasks: RoomTask[];
}

// room configuration is a list of rounds
export interface RoomConfiguration {
	timerScale?: number;
	scoreScale?: number;
	rounds: RoundConfiguration[];
}

// room state tracks the overall state
// of the game room, including the current
// phase, active players, and current round.
export interface RoomData {
	// roomcode for this room
	code: string;
	// configuration for this room
	config: RoomConfiguration;
	// lookup of all device connections
	connections: Dictionary<Connection>,
	// list of viewer connection ids
	viewers: string[]
	// lookup of all user data
	users: Dictionary<Player>;
	// list of player player ids
	players: string[];
	// current phase of game
	phase: RoomPhase;
	// list of active player IDs
	players: string[]
	// curreent round index into configuration
	round: number;
	// current task index into round
	task: number;
	// current prompt index in flat array
	prompt: number;
	// flat array of all prompts in the game
	// in order of selection (may not be in 
	// order of appearance or voting because
	// of shuffling and asymmetry)
	prompts: RoomPrompt[];
	// flat array of all responses
	responses: PlayerResponse[];
}
