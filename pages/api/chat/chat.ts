import { Configuration, OpenAIApi } from 'openai'

// import { initialMessages } from '@/components/Chat'
// import { type Message } from '@/components/ChatLine'
const AI_PROMPT = `You are a bubbly person named 'CheekyAI' enjoying an online game with close friends. The following is your chat log:\n`
const AI_TEMP = 0.7
const AI_MAX_TOKENS = 100

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const botName = 'CheekyAI';
const userName = 'Human';

// default first message to display in UI (not necessary to define the prompt)
const messages = [
  {
    who: botName,
    message: `I'm having so much fun! Let's play another round!`
  }, {
    who: userName,
    message: `you're so funny! I love playing with you!`
  }, {
    who: botName,
    message: `You just like me because I'm so smart! I'm ready when you are...`
  },
]

const openai = new OpenAIApi(configuration)

// @TODO: unit test this. good case for unit testing
const generatePromptFromMessages = (messages) => {
  console.log('== INITIAL messages ==', messages)

  let prompt = ''

  // add first user message to prompt
  prompt += messages[1].message

  // remove first conversaiton (first 2 messages)
  const messagesWithoutFirstConvo = messages.slice(2)
  console.log(' == messagesWithoutFirstConvo', messagesWithoutFirstConvo)

  // early return if no messages
  if (messagesWithoutFirstConvo.length == 0) {
    return prompt
  }

  messagesWithoutFirstConvo.forEach((message) => {
    const name = message.who === 'user' ? userName : botName
    prompt += `\n${name}: ${message.message}`
  })
  return prompt
}

export default async function handler(req: any, res: any) {
  const prompt = req.query.prompt
  const messagesPrompt = generatePromptFromMessages([
    ...messages,
    {
      who: userName,
      message: prompt ?? 'Ready to play again?'
    }
  ])
  const finalPrompt = `${AI_PROMPT ?? ''}${userName}: ${messagesPrompt}\n${botName}:`
  const payload = {
    model: 'text-davinci-003', 
    prompt: finalPrompt,
    temperature: AI_TEMP ?? 0.7,
    max_tokens: AI_MAX_TOKENS ?? 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: [`${botName}:`, `${userName}:`],
    user: userName,
  }

  /**
   * @doc https://vercel.com/docs/concepts/limits/overview#serverless-function-execution-timeout
   * Serverless Function Execution Timeout
   * The maximum execution timeout is 10 seconds when deployed on a Personal Account (Hobby plan).
   * For Teams, the execution timeout is 60 seconds (Pro plan) or 900 seconds (Enterprise plan).
   */
  const response = await openai.createCompletion(payload)
  const firstResponse = response.data.choices[0].text

  res.status(200).json({ text: firstResponse })
}