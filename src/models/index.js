// ONE Sequelize instance (one connection pool) for the whole API.
// Every other file imports it from here - nobody opens a second one.
const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');
const dbConfig = require('../config/database')[env.nodeEnv];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const User = require('./user')(sequelize, DataTypes);          // from the kit
const QuestionSet = require('./question-set')(sequelize, DataTypes);
const GameSession = require('./game-session')(sequelize, DataTypes);

QuestionSet.hasMany(GameSession, { foreignKey: 'set_id' });
GameSession.belongsTo(QuestionSet, { foreignKey: 'set_id', as: 'questionSet' });

const Player = require('./player')(sequelize, DataTypes);
const VaultTier = require('./vault-tier')(sequelize, DataTypes);

GameSession.hasMany(Player, { foreignKey: 'session_id' });
Player.belongsTo(GameSession, { foreignKey: 'session_id', as: 'session' });
// Week 11: load your models here, one line each, then add their associations.
// Example:
//   const User = require('./user')(sequelize, DataTypes);
//   const Player = require('./player')(sequelize, DataTypes);
//   User.hasMany(Player, { foreignKey: 'user_id' });
//   Player.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize, Sequelize, DataTypes,
  User, QuestionSet, GameSession, Player, VaultTier,
};