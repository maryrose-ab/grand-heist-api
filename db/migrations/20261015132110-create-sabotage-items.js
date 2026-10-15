'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sabotage_items', {
      equipment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: 'equipment', key: 'equipment_id' },
        onDelete: 'CASCADE',
      },
      sabotage_kind: { type: Sequelize.STRING(12), allowNull: false },
      percent: { type: Sequelize.SMALLINT, allowNull: false },
    });

    await queryInterface.addConstraint('sabotage_items', {
      type: 'check',
      name: 'ck_sabotage_items_kind_valid',
      fields: ['sabotage_kind'],
      where: {
        sabotage_kind: { [Sequelize.Op.in]: ['PICKPOCKET'] },
      },
    });
    await queryInterface.addConstraint('sabotage_items', {
      type: 'check',
      name: 'ck_sabotage_items_percent_1_to_100',
      fields: ['percent'],
      where: { percent: { [Sequelize.Op.between]: [1, 100] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sabotage_items');
  },
};