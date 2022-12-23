import pusher from '../pusher';
import { PusherChannel } from '@/store/constants';

const messageHistory = 100;

export async function handleChatMessage(roomData, message) {
  // retain the most recent X messaegs
  const retained = (roomData?.messages ?? []).slice(-(messageHistory));
  // add message to room data
  const update = {
    ...roomData,
    messages: [...retained, message],
    modified: Date.now(),
  };
  // update room data
  await pusher.trigger(
    PusherChannel.room(roomData.code), 
    'message',
    update
  );
  // return updated room roomData
  return update;
}
