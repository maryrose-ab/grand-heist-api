const { VaultTier } = require('../models');

function findByName(name) {
  return VaultTier.findOne({ where: { tier_name: name } });
}

module.exports = { findByName };