import { Configuration, OpenAIApi } from 'openai'

// https://beta.openai.com/tokenizer?view=bpe
const Tokens = {
  newline: '198',
  Qui: '4507',
  ipl: '24705',
  ash: '1077'
}

// bias quiplash tokens to a specific value
export const biasQuiplash = value => ({
  [Tokens.Qui]: value,
  [Tokens.ipl]: value,
  [Tokens.ash]: value
})

// bias newlines to a specific value
export const biasNewline = value => ({
  [Tokens.newline]: value
})

// create openAI instance
const openAI = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

// chatbot payload defaults
export const ChatbotPayload = {
  // AI model name
  model: 'text-davinci-003',
  // number of results returned 
  n: 1,
  // number of choices generated 
  // to pick results from
  best_of: 1,
  // return size (token is 3-4 characters
  max_tokens: 100,
  // temp: 0.0 to 1.0
  // higher is more creative
  temperature: 0.75,
  // top_p: 0.0 to 1.0
  // top_p: 0.1,
  // penalties: -2.0 to 2.0
  frequency_penalty: 0.25,
  presence_penalty: 0.25,
  // bias: -100 to 100
  // bias against certain tokens
  // logit_bias: {
  //   // dont say quiplash
  //   ...biasQuiplash(-100),
  // }
}

// complete a chat prompt
export async function completeChat(prompt) {
  // console.log('completeChat', prompt)
  const response = await openAI.createCompletion({
    ...ChatbotPayload,  
    prompt: prompt,
    stop: ['\n']
  })
  return response.data.choices[0].text.trim()
}

// use a personality to continue a conversation
export async function completeMessages(
  messages,
  personality,
  text = ''
) {
  let script = [
    ...personality.messages,
    ...messages
  ].reduce((script, { message, name }) => {
    return `${script}\n${name}: ${message}`
  }, '')
  script = `${script}\n${personality.name}: ${text}`
  return completeChat(script)
}
