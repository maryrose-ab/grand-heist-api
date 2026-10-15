'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shop_listings', {
      listing_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sessions', key: 'session_id' },
        onDelete: 'CASCADE',
      },
      equipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'equipment', key: 'equipment_id' },
        onDelete: 'RESTRICT',
      },
      stock: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
    });

    await queryInterface.addConstraint('shop_listings', {
      type: 'unique',
      name: 'uq_shop_one_listing_per_item',
      fields: ['session_id', 'equipment_id'],
    });

    await queryInterface.addConstraint('shop_listings', {
      type: 'check',
      name: 'ck_shop_listings_stock_not_negative',
      fields: ['stock'],
      where: { stock: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shop_listings');
  },
};