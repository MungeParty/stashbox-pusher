import Pusher from 'pusher';

const nullSlug = {
	room: null, 
	user: null
}
export function getSlug(path: string) {
	const pathParts = path.split('/')
	if (pathParts[1] === 'room') {
		const [ _, __, room, user] = pathParts;
		if (room) {
			return {
				...nullSlug,
				room, 
				user
			};
		}
	}
	return nullSlug;
}

function getPusherServer() {
	return new Pusher({
		appId: process.env.PUSHER_APP_ID,
		key: process.env.PUSHER_KEY,
		secret: process.env.PUSHER_SECRET,
		cluster: process.env.PUSHER_CLUSTER,
		useTLS: true,
	});
}

const pusherServer = getPusherServer()

export default pusherServer;
