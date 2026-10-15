'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reward_offers', {
      offer_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      answer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'answers', key: 'answer_id' },
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      is_chosen: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });

    await queryInterface.addConstraint('reward_offers', {
      type: 'unique',
      name: 'uq_reward_offer_answer', // one offer per correct answer (the ERD marks answer_id as UK)
      fields: ['answer_id'],
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reward_offers');
  },
};