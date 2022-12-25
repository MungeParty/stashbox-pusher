import Game from './game'
import Schitty from './schitty'
import Bot from './bot'

export default [
  Game,
  Schitty,
  Bot,
].reduce((acc, personality) => ({
  ...acc,
  [personality.name]: personality
}), {})
