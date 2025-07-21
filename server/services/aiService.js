// // Mock AI service - revert to original mock questions and evaluation
// const mockInterviewQuestions = {
//   'frontend developer': {
//     easy: [
//       "What is the difference between HTML and XHTML?",
//       "Explain the box model in CSS.",
//       "What are the different data types in JavaScript?",
//       "How do you center a div horizontally and vertically?",
//       "What is the difference between == and === in JavaScript?"
//     ],
//     medium: [
//       "Explain event delegation in JavaScript.",
//       "What are closures and how do they work?",
//       "How does the virtual DOM work in React?",
//       "What is the difference between flexbox and grid?",
//       "Explain the concept of hoisting in JavaScript."
//     ],
//     hard: [
//       "How would you implement a debounce function?",
//       "Explain the React reconciliation process.",
//       "What are Web Workers and when would you use them?",
//       "How do you handle memory leaks in JavaScript?",
//       "Explain the difference between server-side and client-side rendering."
//     ]
//   },
//   'backend developer': {
//     easy: [
//       "What is RESTful API?",
//       "Explain the difference between SQL and NoSQL databases.",
//       "What is middleware in Express.js?",
//       "How do you handle errors in Node.js?",
//       "What is the purpose of package.json?"
//     ],
//     medium: [
//       "Explain database indexing and its benefits.",
//       "What is JWT and how does it work?",
//       "How do you prevent SQL injection attacks?",
//       "What is the difference between authentication and authorization?",
//       "Explain the concept of microservices."
//     ],
//     hard: [
//       "How would you design a scalable chat application?",
//       "Explain database sharding and when to use it.",
//       "What are the CAP theorem principles?",
//       "How do you handle race conditions in concurrent systems?",
//       "Explain the differences between various caching strategies."
//     ]
//   }
// };

// export const generateInterviewQuestions = async (position, difficulty, count) => {
//   const questions = mockInterviewQuestions[position]?.[difficulty] || mockInterviewQuestions['frontend developer']['easy'];
//   // Shuffle and return requested number of questions
//   const shuffled = questions.sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, count);
// };

// export const evaluateAnswer = async (question, answer) => {
//   // Mock evaluation - revert to original logic
//   const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
//   const feedback = {
//     score,
//     summary: score >= 80 ? 'Excellent answer!' : score >= 70 ? 'Good answer with room for improvement.' : 'Consider reviewing this topic.',
//     strengths: ['Clear explanation', 'Good examples'],
//     improvements: score < 80 ? ['Add more technical details', 'Provide code examples'] : [],
//     detailedFeedback: `Your answer demonstrates ${score >= 80 ? 'strong' : 'basic'} understanding of the topic. ${score >= 80 ? 'Well done!' : 'Consider studying this area further.'}`
//   };
//   return feedback;
// };
// services/aiService.js
import axios from 'axios';

const API_KEY = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY; // Use env variable for API key
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const generateInterviewQuestions = async (role = 'software developer', difficulty = '', count = 5) => {
  try {
    const response = await axios.post(API_URL, {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Generate exactly ${count} unique technical interview questions for a ${role} role${difficulty ? ' at ' + difficulty + ' difficulty' : ''}. Number each question. Do not include any explanations or extra text. Only output the questions, one per line.`,
        },
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const text = response.data.choices[0].message.content;
    const questions = text.split('\n').filter(q => q.trim().length > 0);
    return questions;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized: Check your OpenRouter API key in your .env file.');
    }
    console.error('Error generating questions:', error.message);
    throw error;
  }
};

export const evaluateAnswer = async (question, answer) => {
  try {
    const response = await axios.post(API_URL, {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert interviewer. Analyze the following answer to the interview question. Return a JSON object with the following fields: score (number, 0-100), summary (string), strengths (array of strings), improvements (array of strings), detailedFeedback (string). Example: { "score": 85, "summary": "Good answer with some room for improvement.", "strengths": ["Clear explanation", "Relevant example"], "improvements": ["Add more technical details"], "detailedFeedback": "You demonstrated a solid understanding, but could elaborate more on X." }`,
        },
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${answer}`,
        },
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const aiContent = response.data.choices[0].message.content;
    let feedback;
    try {
      feedback = JSON.parse(aiContent);
    } catch (e) {
      // fallback: wrap as summary if parsing fails
      feedback = {
        score: 70,
        summary: aiContent,
        strengths: [],
        improvements: [],
        detailedFeedback: aiContent
      };
    }
    return feedback;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized: Check your OpenRouter API key in your .env file.');
    }
    console.error('Error evaluating answer:', error.message);
    throw error;
  }
};
