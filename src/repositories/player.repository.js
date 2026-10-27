const { Op } = require('sequelize');
const { Player, GameSession } = require('../models');

// This account's seat in this game, or null.
function findSeat(sessionId, userId) {
  return Player.findOne({ where: { session_id: sessionId, user_id: userId } });
}

// A seat of this account in ANOTHER game that is playing, or null.
function findPlayingSeatElsewhere(userId, sessionId) {
  return Player.findOne({
    where: { user_id: userId, session_id: { [Op.ne]: sessionId } },
    include: [{ model: GameSession, as: 'session', where: { status: 'playing' }, attributes: ['join_code'] }],
  });
}

function countBySession(sessionId) {
  return Player.count({ where: { session_id: sessionId } });
}

function findAllBySession(sessionId) {
  return Player.findAll({
    where: { session_id: sessionId },
    order: [['final_score', 'DESC'], ['player_id', 'ASC']],
  });
}

function create(data) {
  return Player.create(data);
}

module.exports = { findSeat, findPlayingSeatElsewhere, countBySession, findAllBySession, create };