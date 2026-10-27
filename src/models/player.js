module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Player',
    {
      player_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      nickname: { type: DataTypes.STRING(20), allowNull: false },
      status: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'active' },
      tier_id: { type: DataTypes.INTEGER, allowNull: false },
      final_score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: 'players', timestamps: false }
  );