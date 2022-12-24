import pusher, { getChannelCache } from '../pusher';
import { PusherChannel } from '@/store/constants';

const messageHistory = 50;

export async function handleChatMessage(roomData, message) {
  // refetch room data
  const room_channel = PusherChannel.room(roomData.code)
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
