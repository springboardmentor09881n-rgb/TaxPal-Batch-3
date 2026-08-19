const faqData = [
  { question: 'How do I create a budget?', answer: 'Answer 1' },
  { question: 'How do I add a transaction?', answer: 'Answer 2' }
];

let messages = [{ sender: 'bot', text: 'Hi' }];
let userInput = '';

function findAnswer(question) {
    const lowerQ = question.toLowerCase();
    
    let match = faqData.find(f => f.question.toLowerCase() === lowerQ);
    
    if (!match) {
      match = faqData.find(f => {
         const keywords = f.question.toLowerCase().split(' ').filter(w => w.length > 3);
         return keywords.some(kw => lowerQ.includes(kw));
      });
    }

    return match ? match.answer : "Fallback";
}

function sendMessage(text) {
    const question = (text || userInput).trim();
    if (!question) return;

    messages.push({ sender: 'user', text: question });
    userInput = '';

    const answer = findAnswer(question);
    messages.push({ sender: 'bot', text: answer });
}

sendMessage('How do I create a budget?');
console.log(messages);
userInput = 'How do I add a transaction?';
sendMessage();
console.log(messages);
