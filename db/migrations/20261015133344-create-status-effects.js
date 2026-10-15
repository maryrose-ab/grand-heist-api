'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('status_effects', {
      effect_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onDelete: 'CASCADE',
      },
      effect_type: { type: Sequelize.STRING(20), allowNull: false },
      magnitude: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      questions_left: { type: Sequelize.SMALLINT, allowNull: false },
    });

    await queryInterface.addConstraint('status_effects', {
      type: 'check',
      name: 'ck_status_effects_type_coin_multiplier_or_cursed',
      fields: ['effect_type'],
      where: { effect_type: { [Sequelize.Op.in]: ['COIN_MULTIPLIER', 'CURSED'] } },
    });
    await queryInterface.addConstraint('status_effects', {
      type: 'check',
      name: 'ck_status_effects_questions_left_not_negative',
      fields: ['questions_left'],
      where: { questions_left: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('status_effects');
  },
};