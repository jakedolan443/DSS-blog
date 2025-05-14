// authController.js
//
// Purpose: controller for login, registration
//
// Authors: Jake Dolan, Charlie Gaskin
// Date: 14/05/2025


const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const db = require('../db');
const { validatePassword } = require('../policies/passwordPolicy');
const { validateUsername } = require('../policies/usernamePolicy');

// Example security questions list
const SECURITY_QUESTIONS = [
    "What was your childhood nickname?",
    "In what city did you meet your spouse?",
    "What is the name of your favorite childhood friend?",
    "What street did you live on in third grade?",
    "What is your oldest sibling’s birthday month and year?",
    "What is the middle name of your youngest child?",
    "What is your oldest cousin’s first and last name?",
    "What was the name of your first stuffed animal?"
];

async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await db('users').where({ username }).first();
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

        const currentIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // check IP differs from last login location (if one exists)
        if (user.last_login_location && user.last_login_location !== currentIp) {
            const questionOptions = [
                { index: user.security_question_1_index },
                { index: user.security_question_2_index },
                { index: user.security_question_3_index }
            ];
            const randomQuestion = questionOptions[Math.floor(Math.random() * questionOptions.length)];
            const questionText = SECURITY_QUESTIONS[randomQuestion.index] || "Security question";

            return res.status(403).json({
                message: 'Security question required',
                security_question_index: randomQuestion.index,
                security_question_text: questionText
            });
        }


        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });

        if (!user.last_login_location) {
            await db('users').where({ id: user.id }).update({ last_login_location: currentIp });
        }

        res.status(200).json({ message: 'Login successful' });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}


async function loginSecureCheck(req, res) {
    const { username, password, security_question_index, security_answer } = req.body;

    if (
        !username || !password || typeof security_question_index !== 'number' || !security_answer
    ) {
        return res.status(400).json({ message: 'Username, password, security question index and answer are required' });
    }

    try {
        const user = await db('users').where({ username }).first();
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

        // Match the submitted question index to the stored one
        let matched = false;
        if (security_question_index === user.security_question_1_index) {
            matched = await bcrypt.compare(security_answer, user.security_answer_1_hash);
        } else if (security_question_index === user.security_question_2_index) {
            matched = await bcrypt.compare(security_answer, user.security_answer_2_hash);
        } else if (security_question_index === user.security_question_3_index) {
            matched = await bcrypt.compare(security_answer, user.security_answer_3_hash);
        }

        if (!matched) {
            return res.status(401).json({ message: 'Incorrect answer to security question' });
        }

        const currentIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });

        if (!user.last_login_location) {
            await db('users').where({ id: user.id }).update({ last_login_location: currentIp });
        }

        res.status(200).json({ message: 'Login successful' });

    } catch (err) {
        console.error('LoginSecureCheck error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}




async function register(req, res) {
  const { username, password, security_questions } = req.body;

  if (
    !username || !password || !Array.isArray(security_questions) || security_questions.length !== 3
  ) {
    return res.status(400).json({ message: 'Username, password, and 3 security questions are required' });
  }

  const questionIndexes = security_questions.map(q => q.index);
  if (new Set(questionIndexes).size !== 3 || questionIndexes.some(i => i < 0 || i > 7)) {
    return res.status(400).json({ message: 'Questions must be unique and valid indexes (0–7)' });
  }

  if (security_questions.some(q => !q.answer || typeof q.answer !== 'string')) {
    return res.status(400).json({ message: 'All questions must have answers' });
  }

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ message: usernameValidation.message });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  try {
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswers = await Promise.all(
      security_questions.map(q => bcrypt.hash(q.answer, 10))
    );

    const [newUser] = await db('users')
      .insert({
        username,
        password: hashedPassword,
        security_question_1_index: security_questions[0].index,
        security_answer_1_hash: hashedAnswers[0],
        security_question_2_index: security_questions[1].index,
        security_answer_2_hash: hashedAnswers[1],
        security_question_3_index: security_questions[2].index,
        security_answer_3_hash: hashedAnswers[2]
      })
      .returning(['id', 'username', 'created_at']);

    res.status(201).json({ user: newUser, message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}




async function logout(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'Strict',
            path: '/',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error during logout' });
    }
}

async function getUsernameById(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await db('users').select('username').where({ id }).first();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error('Error fetching username:', err);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { login, loginSecureCheck, register, logout };
