'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('special_items', {
      equipment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: 'equipment', key: 'equipment_id' },
        onDelete: 'CASCADE',
      },
      special_kind: { type: Sequelize.STRING(12), allowNull: false },
    });

    await queryInterface.addConstraint('special_items', {
      type: 'check',
      name: 'ck_special_items_kind_valid',
      fields: ['special_kind'],
      where: {
        special_kind: { [Sequelize.Op.in]: ['ANTI_DEBUFF', 'REVERSAL'] },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('special_items');
  },
};