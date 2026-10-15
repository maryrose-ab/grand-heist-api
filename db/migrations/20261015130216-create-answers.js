'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      answer_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
        onDelete: 'CASCADE',
      },
      choice_index: { type: Sequelize.SMALLINT, allowNull: false },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false },
      submitted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    // Composite foreign key: the chosen option must exist for THIS question
    await queryInterface.sequelize.query(`
      ALTER TABLE answers
      ADD CONSTRAINT fk_answers_question_choice
      FOREIGN KEY (question_id, choice_index)
      REFERENCES question_choices (question_id, choice_index)
      ON DELETE CASCADE
    `);

    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_answer_once', // one answer per player per question
      fields: ['player_id', 'question_id'],
    });
    await queryInterface.addConstraint('answers', {
      type: 'check',
      name: 'ck_answers_choice_index_not_negative',
      fields: ['choice_index'],
      where: { choice_index: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('answers');
  },
};