'use strict';

/** Design Change Notice 01: users carry the person's full name. */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'full_name', {
      type: Sequelize.STRING(80),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'full_name');
  },
};