const playerRepository = require('../repositories/player.repository');
const vaultTierRepository = require('../repositories/vault-tier.repository');
const sessionService = require('./session.service');
const { constraintOf } = require('../errors/db-errors');
const { conflict } = require('../errors/app-error');

// The sessions table has no max_players column, so the limit is fixed here.
const MAX_PLAYERS = 50;
const START_TIER = 'EASY';

// Join a game, or rejoin it. The order of the checks is part of the design.
async function join(code, nickname, user) {
  // 3. Game with this code exists? (404)
  const session = await sessionService.findOrFail(code);

  // 4. Rejoin: this account already has a seat. Same row, same score.
  const seat = await playerRepository.findSeat(session.session_id, user.user_id);
  if (seat) return { session, player: seat, created: false };

  // 5. Hub Contract v1.2: one game at a time.
  const elsewhere = await playerRepository.findPlayingSeatElsewhere(user.user_id, session.session_id);
  if (elsewhere) {
    throw conflict('ALREADY_IN_GAME', 'You are still playing another game. Finish it first.');
  }

  // 6. A new seat is only possible in the lobby.
  if (session.status === 'ended') throw conflict('SESSION_ENDED', 'This game has ended.');
  if (session.status !== 'waiting') {
    throw conflict('SESSION_NOT_JOINABLE', 'This game has already started.');
  }

  // 7. Room left?
  const seatsTaken = await playerRepository.countBySession(session.session_id);
  if (seatsTaken >= MAX_PLAYERS) throw conflict('SESSION_FULL', 'This game is full.');

  const tier = await vaultTierRepository.findByName(START_TIER);
  if (!tier) throw new Error(`The ${START_TIER} vault tier is missing. Run the seeders.`);

  // 8. Nickname free? The database decides (uq_player_nickname -> constraint map).
  try {
    const player = await playerRepository.create({
      session_id: session.session_id,
      user_id: user.user_id,
      nickname,
      tier_id: tier.tier_id,
    });
    return { session, player, created: true };
  } catch (err) {
    // Two joins from one account in the same instant: the loser gets the winner's seat.
    if (constraintOf(err) === 'uq_one_seat') {
      const existing = await playerRepository.findSeat(session.session_id, user.user_id);
      return { session, player: existing, created: false };
    }
    throw err;
  }
}

async function listByCode(code) {
  const session = await sessionService.findOrFail(code);
  return playerRepository.findAllBySession(session.session_id);
}

module.exports = { join, listByCode };