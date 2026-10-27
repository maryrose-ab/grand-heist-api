const { QuestionSet } = require('../models');

function findById(id) {
  return QuestionSet.findByPk(id);
}

module.exports = { findById };