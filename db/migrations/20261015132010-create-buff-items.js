'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('buff_items', {
      equipment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: 'equipment', key: 'equipment_id' },
        onDelete: 'CASCADE',
      },
      effect_type: { type: Sequelize.STRING(20), allowNull: false },
      modifier: { type: Sequelize.DECIMAL(4, 2), allowNull: false },
      duration_questions: { type: Sequelize.SMALLINT, allowNull: false },
    });

    await queryInterface.addConstraint('buff_items', {
      type: 'check',
      name: 'ck_buff_items_effect_type_valid',
      fields: ['effect_type'],
      where: {
        effect_type: { [Sequelize.Op.in]: ['COIN_MULTIPLIER'] },
      },
    });
    await queryInterface.addConstraint('buff_items', {
      type: 'check',
      name: 'ck_buff_items_modifier_positive',
      fields: ['modifier'],
      where: { modifier: { [Sequelize.Op.gt]: 0 } },
    });
    await queryInterface.addConstraint('buff_items', {
      type: 'check',
      name: 'ck_buff_items_duration_positive',
      fields: ['duration_questions'],
      where: { duration_questions: { [Sequelize.Op.gt]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('buff_items');
  },
};