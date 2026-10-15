'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('beneficial_items', {
      equipment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: 'equipment', key: 'equipment_id' },
        onDelete: 'CASCADE',
      },
      benefit_kind: { type: Sequelize.STRING(12), allowNull: false },
      amount: { type: Sequelize.INTEGER, allowNull: false },
    });

    await queryInterface.addConstraint('beneficial_items', {
      type: 'check',
      name: 'ck_beneficial_items_kind_valid',
      fields: ['benefit_kind'],
      where: {
        benefit_kind: { [Sequelize.Op.in]: ['COINS', 'STEALTH', 'LOOT_BOX'] },
      },
    });
    await queryInterface.addConstraint('beneficial_items', {
      type: 'check',
      name: 'ck_beneficial_items_amount_not_negative',
      fields: ['amount'],
      where: { amount: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('beneficial_items');
  },
};