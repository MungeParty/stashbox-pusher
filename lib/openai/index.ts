import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const ChatbotPayload = {
  model: 'text-davinci-003', 
  temperature: 0.7,
  max_tokens: 100,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
}

export async function completeChat(prompt, configuration) {
  const payload = {
    ...ChatbotPayload,  
    prompt: prompt,
    stop: [`${configuration.name}:`]
  }  
  const response = await openai.createCompletion(payload)
  return response.data.choices[0].text.trim()
}

export async function completeMessages(messages, configuration) {
  let prompt = ''
  configuration.messages.forEach(({ message, name }) => {
    prompt += `\n${name}: ${message}`
  })
  messages.forEach(({ message, name }) => {
    prompt += `\n${name}: ${message}`
  })
  prompt += `\n${configuration.name}: `
  return completeChat(prompt, configuration)
}
