const { Router } = require('express');
const requireUser = require('../middlewares/require-user');
const validate = require('../middlewares/validate');
const rules = require('../validators/session.validator');
const controller = require('../controllers/session.controller');
const playerRules = require('../validators/player.validator');
const playerController = require('../controllers/player.controller');
const router = Router();

// Players are a part of a session, so their URLs sit under it.
router.post('/:code/players', requireUser(), playerRules.joinRules, validate, playerController.join);
router.get('/:code/players', rules.codeParam, validate, playerController.list);

router.post('/', requireUser('host', 'admin'), rules.createRules, validate, controller.create);
router.get('/:code', rules.codeParam, validate, controller.get);
router.patch('/:code', requireUser('host', 'admin'), rules.statusRules, validate, controller.changeStatus);

module.exports = router;