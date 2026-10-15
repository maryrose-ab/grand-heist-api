'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // players: tier_id must match vault_tiers.tier_id (INTEGER)
    await q('ALTER TABLE players ALTER COLUMN tier_id TYPE INTEGER');

    // equipment: uppercase type values
    await queryInterface.removeConstraint('equipment', 'ck_equipment_type_valid');
    await queryInterface.addConstraint('equipment', {
      type: 'check',
      name: 'ck_equipment_type_valid',
      fields: ['equipment_type'],
      where: {
        equipment_type: {
          [Sequelize.Op.in]: ['BENEFICIAL', 'DEFENSE', 'BUFF', 'SABOTAGE', 'SPECIAL'],
        },
      },
    });

    // answers: names and RESTRICT rules from the dictionary
    await queryInterface.removeConstraint('answers', 'uq_answer_once');
    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_one_answer_per_question',
      fields: ['player_id', 'question_id'],
    });
    await queryInterface.removeConstraint('answers', 'ck_answers_choice_index_not_negative');

    await q('ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_question_id_fkey');
    await q(`
      ALTER TABLE answers
      ADD CONSTRAINT fk_answers_question
      FOREIGN KEY (question_id) REFERENCES questions (question_id)
      ON DELETE RESTRICT
    `);

    await q('ALTER TABLE answers DROP CONSTRAINT fk_answers_question_choice');
    await q(`
      ALTER TABLE answers
      ADD CONSTRAINT fk_answers_choice
      FOREIGN KEY (question_id, choice_index)
      REFERENCES question_choices (question_id, choice_index)
      ON DELETE RESTRICT
    `);
  },

  async down(queryInterface, Sequelize) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q('ALTER TABLE answers DROP CONSTRAINT fk_answers_choice');
    await q(`
      ALTER TABLE answers
      ADD CONSTRAINT fk_answers_question_choice
      FOREIGN KEY (question_id, choice_index)
      REFERENCES question_choices (question_id, choice_index)
      ON DELETE CASCADE
    `);

    await q('ALTER TABLE answers DROP CONSTRAINT fk_answers_question');
    await q(`
      ALTER TABLE answers
      ADD CONSTRAINT answers_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES questions (question_id)
      ON DELETE CASCADE
    `);

    await queryInterface.addConstraint('answers', {
      type: 'check',
      name: 'ck_answers_choice_index_not_negative',
      fields: ['choice_index'],
      where: { choice_index: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.removeConstraint('answers', 'uq_one_answer_per_question');
    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_answer_once',
      fields: ['player_id', 'question_id'],
    });

    await queryInterface.removeConstraint('equipment', 'ck_equipment_type_valid');
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

    await q('ALTER TABLE players ALTER COLUMN tier_id TYPE SMALLINT');
  },
};