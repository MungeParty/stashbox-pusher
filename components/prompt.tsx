import React, { useState, useEffect, useMemo, useRef } from 'react';

const maxInputLength = 50;

// strip forbidden characters from string
const stripForbidden = (str) => str.replace(/[^a-zA-Z0-9\s,.!?]/g, '');

// limit string length
const limitLength = (str, limit) => str.slice(0, limit);

// replace consecutive whitespace with single space
const flattenWhitespace = (str) => str.replace(/\s+/g, ' ');

// trim whitespace from ends of string
const trimAnswer = (str) => str.replace(/^[\s,.!?]+|[\s,.!?]+$/g, '');

// trim whitespace from start only
const trimAnswerLeading = (str) => str.replace(/^[\s,.!?]+/g, '');

// format response
const formatAnswer = (str, trimForSubmit = true) => {
  let filtered = stripForbidden(str)
  filtered = limitLength(
    flattenWhitespace(filtered), 
    maxInputLength
  );
  if (trimForSubmit) filtered = trimAnswer(filtered);
  else filtered = trimAnswerLeading(filtered);
  return filtered;
};

// slow string hash
const hashes = {};
const stringHash = (str) => {
  if (!str) return 0;
  if (hashes[str]) return hashes[str];
  let hash = 0;
  // generate hash for string
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  hashes[str]= hash;
  return hash;
};

// get key for prompt form part
const keyGen = (prompt, index, type) => 
  `${stringHash(prompt)}-${type}-${index}`;

// prompt component
function QuizPrompt({ promptText, onComplete }) {
  const [blanks, setBlanks] = useState(0);
  const [inputValues, setInputValues] = useState([]);
  const [promptParts, setPromptParts] = useState([]);
  const inputRefs = useRef([]);

  useEffect(() => {
    const newBlanks = (promptText.match(/_/g) || []).length;
    setBlanks(newBlanks);
    setInputValues(Array(newBlanks).fill(''));
    setPromptParts(promptText.split(/_/g));
  }, [promptText]);

  const { inputs, prompt } = useMemo(() => {
    let prompt = [];
    for (let i = 0; i < blanks; i++) {
      prompt.push(promptParts[i]);
      const inputText = inputValues[i];
      const key = keyGen(promptText, 'prompt', i);
      const blankIndex = (<sup className='superscript'>#{i+1}</sup>)
      if (inputText) {
        prompt.push(<span key={key} className='blank'>{inputText}</span>);
      } else {
        prompt.push(<span key={key} className='blank'>{blankIndex}&nbsp;&nbsp;&nbsp;&nbsp;</span>);
      }
    }
    prompt.push(promptParts[promptParts.length - 1]);
    let inputs = inputValues.map((value, i) => {
      const key = keyGen(promptText, 'input', i);
      const onChange = e => {
        const newInputValues = [...inputValues];
        newInputValues[i] = formatAnswer(e.target.value, false);
        setInputValues(newInputValues);
      };
      const onBlur = e => {
        const newInputValues = [...inputValues];
        newInputValues[i] = formatAnswer(e.target.value, true);
        setInputValues(newInputValues);
      };
      const onSubmit = e => {
        e.preventDefault();
        const newValue = formatAnswer(e.target.value, true);
        const newInputValues = [...inputValues];
        newInputValues[i] = newValue;
        setInputValues(newInputValues);
        if (newValue.length < 1)
          return;
        if (newInputValues.every(value => value)) {
          inputRefs.current[i].blur();
          onComplete && onComplete(newInputValues);
        } else {
          // seek next empty input value, wrapping around
          for (let j = 0; j < newInputValues.length; j++) {
            const modIndex = (i + j) % newInputValues.length;
            if (!newInputValues[modIndex]) {
              inputRefs.current[modIndex].focus();
              break;
            }
          }
        }
      };
      const onKeyDown = e => {
        if (e.key === 'Enter') {
          onSubmit(e);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          inputRefs.current[i].blur();
        }
      }
      return (
        <input
          key={key}
          ref={el => inputRefs.current[i] = el}
          placeholder={`#${i + 1}`}
          autoCapitalize='off'
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          enterKeyHint='next'
          maxLength={maxInputLength}
          type="text"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          className='input shade prompt-input'
        />
      )
    });
    return {
      inputs,
      prompt: <p key='prompt' className='prompt'>{prompt}</p> 
    }
  }, [inputValues]);

  return (
    <div className='vbox shade prompt-container'>
      <div className='hbox'>
        {prompt}
      </div>
      <div className='vbox'>
        {inputs}
      </div>
    </div>
  );
}

export default QuizPrompt;
