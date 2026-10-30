const questionSetRepository = require('../repositories/question-set.repository');
const { notFound, forbidden } = require('../errors/app-error');

async function findOrFail(id) {
  const questionSet = await questionSetRepository.findById(id);
  if (!questionSet) {
    throw notFound(
      'QUESTION_SET_NOT_FOUND',
      `No question set has the id ${id}.`
    );
  }
  return questionSet;
}

// Rule: only the owner may read, change or delete a set.
async function findOwnedOrFail(id, user) {
  const questionSet = await findOrFail(id);
  if (questionSet.host_id !== user.user_id) {
    throw forbidden('This question set belongs to another host.');
  }
  return questionSet;
}

function list(user) {
  return questionSetRepository.findAllByHost(user.user_id);
}

function get(id, user) {
  return findOwnedOrFail(id, user);
}

// Rule: the owner is the caller. A client never chooses it.
function create(data, user) {
  return questionSetRepository.create({ ...data, host_id: user.user_id });
}

async function update(id, changes, user) {
  const questionSet = await findOwnedOrFail(id, user);
  return questionSetRepository.update(questionSet, changes);
}

// A set used in a game is refused by the database (409, from constraint-map).
async function remove(id, user) {
  const questionSet = await findOwnedOrFail(id, user);
  await questionSetRepository.remove(questionSet);
}

module.exports = { findOrFail, list, get, create, update, remove };