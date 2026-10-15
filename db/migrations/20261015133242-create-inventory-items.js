'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_items', {
      item_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onDelete: 'CASCADE',
      },
      equipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'equipment', key: 'equipment_id' },
        onDelete: 'RESTRICT',
      },
      slot_no: { type: Sequelize.SMALLINT, allowNull: false },
      acquired_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      armed_at: { type: Sequelize.DATE, allowNull: true },
      charges_left: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 1 },
    });

    await queryInterface.addConstraint('inventory_items', {
      type: 'unique',
      name: 'uq_inventory_one_item_per_slot',
      fields: ['player_id', 'slot_no'],
    });

    await queryInterface.addConstraint('inventory_items', {
      type: 'check',
      name: 'ck_inventory_items_slot_no_1_to_3',
      fields: ['slot_no'],
      where: { slot_no: { [Sequelize.Op.between]: [1, 3] } },
    });
    await queryInterface.addConstraint('inventory_items', {
      type: 'check',
      name: 'ck_inventory_items_charges_left_not_negative',
      fields: ['charges_left'],
      where: { charges_left: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventory_items');
  },
};