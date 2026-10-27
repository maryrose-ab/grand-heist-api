const crypto = require('crypto');
const sessionRepository = require('../repositories/session.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const { notFound, forbidden, conflict } = require('../errors/app-error');

// What each status may become.
const ALLOWED_CHANGES = {
  waiting: ['playing', 'ended'],
  playing: ['ended'],
  ended: [],
};

async function findOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) {
    throw notFound('SESSION_NOT_FOUND', `No game has the code ${code}.`);
  }
  return session;
}

function isOwner(hostId, user) {
  return hostId === user.user_id || user.role === 'admin';
}

// 6 digits, never starting with 0 (matches the DB check constraint)
async function generateUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = String(crypto.randomInt(100000, 1000000));
    // eslint-disable-next-line no-await-in-loop
    if (!(await sessionRepository.findByCode(code))) return code;
  }
  throw conflict('JOIN_CODE_TAKEN', 'Could not make a free join code. Try again.');
}

// Rule: only the owner of the question set may start a game with it.
async function create({ set_id }, user) {
  const questionSet = await questionSetRepository.findById(set_id);
  if (!questionSet) {
    throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${set_id}.`);
  }
  if (!isOwner(questionSet.host_id, user)) {
    throw forbidden('This question set belongs to another host.');
  }
  const joinCode = await generateUniqueCode();
  return sessionRepository.create({ set_id, join_code: joinCode, status: 'waiting' });
}

async function get(code) {
  return findOrFail(code);
}

// Rule: only the owner (or admin) changes status, and only in allowed steps.
async function changeStatus(code, newStatus, user) {
  const session = await findOrFail(code);

  if (!isOwner(session.questionSet.host_id, user)) {
    throw forbidden('This game belongs to another host.');
  }
  if (session.status === 'ended') {
    throw conflict('SESSION_ENDED', 'This game has already ended.');
  }
  if (!ALLOWED_CHANGES[session.status].includes(newStatus)) {
    throw conflict(
      'INVALID_STATUS_CHANGE',
      `A game that is ${session.status} cannot become ${newStatus}.`
    );
  }

  const changes = { status: newStatus };
  const now = new Date();
  if (newStatus === 'playing') changes.started_at = now;
  if (newStatus === 'ended') changes.ended_at = now;

  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, get, changeStatus };