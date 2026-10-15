'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipment', {
      equipment_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(40), allowNull: false },
      equipment_type: { type: Sequelize.STRING(12), allowNull: false },
      price: { type: Sequelize.INTEGER, allowNull: false },
      sell_value: { type: Sequelize.INTEGER, allowNull: false },
    });

    await queryInterface.addConstraint('equipment', {
      type: 'unique',
      name: 'uq_equipment_name',
      fields: ['name'],
    });
    await queryInterface.addConstraint('equipment', {
      type: 'check',
      name: 'ck_equipment_type_valid',
      fields: ['equipment_type'],
      where: {
        equipment_type: {
          [Sequelize.Op.in]: ['beneficial', 'defense', 'buff', 'sabotage', 'special'],
        },
      },
    });
    await queryInterface.addConstraint('equipment', {
      type: 'check',
      name: 'ck_equipment_price_not_negative',
      fields: ['price'],
      where: { price: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint('equipment', {
      type: 'check',
      name: 'ck_equipment_sell_value_not_negative',
      fields: ['sell_value'],
      where: { sell_value: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('equipment');
  },
};