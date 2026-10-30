const { body, param } = require('express-validator');

const title = () =>
  body('title')
    .exists().withMessage('title is required')
    .bail()
    .isString().withMessage('title must be text')
    .bail()
    .trim()
    .isLength({ min: 3, max: 80 })
    .withMessage('title must be 3 to 80 characters long');

const id = () =>
  param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive whole number')
    .bail()
    .toInt();

const createRules = [title()];
const idParam = [id()];
// title is the only editable field, so a PATCH must send it.
const updateRules = [id(), title()];

module.exports = { createRules, idParam, updateRules };