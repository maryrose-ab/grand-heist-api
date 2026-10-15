'use strict';

/** One play session of a question set. Players join it with a 6-digit code. */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      session_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      join_code: { type: Sequelize.CHAR(6), allowNull: false, unique: true },
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'set_id' },
        onDelete: 'RESTRICT',
      },
      status: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'waiting' },
      started_at: { type: Sequelize.DATE, allowNull: true },
      ended_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addConstraint('sessions', {
      type: 'check',
      name: 'ck_sessions_status_valid',
      fields: ['status'],
      where: { status: { [Sequelize.Op.in]: ['waiting', 'playing', 'ended'] } },
    });

    // 6 digits, not starting with 0
    await queryInterface.sequelize.query(
      "ALTER TABLE sessions ADD CONSTRAINT ck_sessions_join_code_six_digits CHECK (join_code ~ '^[1-9][0-9]{5}$')"
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sessions');
  },
};