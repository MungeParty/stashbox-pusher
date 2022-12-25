import pusher, { getChannelCache } from '../pusher';
import { PusherChannel } from '@/store/constants';

const messageHistory = 40;

export async function handleChatMessage(room, message) {
  // refetch room data
  const room_channel = PusherChannel.room(room)
  let cache = await getChannelCache(room_channel);
  // retain the most recent X messaegs
  const retained = (cache?.messages ?? []).slice(-(messageHistory));
  // add message to room data
  const update = {
    ...cache,
    messages: [...retained, message],
    modified: Date.now(),
  };
  // update room data
  await pusher.trigger(room_channel, 'update', update);
  // return updated room data
  return update;
}
