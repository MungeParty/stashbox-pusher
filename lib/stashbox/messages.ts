import pusher, { getChannelCache } from '../pusher';

const messageHistory = 50;

export async function handleChatMessage(channel_name, data) {
  // get room data from cache
  const roomData = await getChannelCache(channel_name);
  // retain the most recent X messaegs
  const retained = roomData.messages.slice(-messageHistory);
  // add message to room data
  const update = {
    ...roomData,
    messages: [...retained, data],
    modified: Date.now(),
  };
  // update room data
  pusher.trigger(channel_name, 'update', update);
  // return updated room cache
  return update;;
}
