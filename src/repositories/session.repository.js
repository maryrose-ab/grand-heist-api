const { GameSession, QuestionSet } = require('../models');

// Includes the question set so the service can see who owns the game.
function findByCode(code) {
  return GameSession.findOne({
    where: { join_code: code },
    include: [{ model: QuestionSet, as: 'questionSet', attributes: ['set_id', 'host_id'] }],
  });
}

function create(data) {
  return GameSession.create(data);
}

function update(session, changes) {
  return session.update(changes);
}

module.exports = { findByCode, create, update };