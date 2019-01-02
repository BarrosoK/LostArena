import * as MonsterController from "../controllers/monster.controller";
import * as SkillsController from "../controllers/skill.controller";

const express 			= require('express');
const router 			= express.Router();

const CharacterController = require('../controllers/character.controller');
const ItemController = require('../controllers/item.controller');
const CharactersController = require('../controllers/characters.controller');
const UserController 	= require('../controllers/user.controller');

const passport      	= require('passport');
const path              = require('path');


require('./../middleware/passport')(passport);

/* COMBAT PVP */
router.post(    '/combat',          passport.authenticate('jwt', {session:false}), CharactersController.fight);

/* COMBAT PVE */
router.post(    '/pve',             passport.authenticate('jwt', {session:false}),  CharactersController.pve);

/* MONSTERS */
router.get(     '/monsters',        passport.authenticate('jwt', {session:false}),  MonsterController.get);

/* CHARACTERS */
router.get(     '/characters',      passport.authenticate('jwt', {session:false}), CharactersController.get);   // C

/* SKILLS */
router.get(     '/skills',          passport.authenticate('jwt', {session: false}), SkillsController.get);
router.post(     '/character/skills',          passport.authenticate('jwt', {session: false}), SkillsController.add);

/* CHARACTER */
router.post(    '/character',       passport.authenticate('jwt', {session:false}), CharacterController.create); // C
router.get(     '/character',       passport.authenticate('jwt', {session:false}), CharacterController.get);    // R
router.put(     '/character',       passport.authenticate('jwt', {session:false}), CharacterController.update); // U
router.delete(  '/character',       passport.authenticate('jwt', {session:false}), CharacterController.remove); // D

/* ITEMS */
router.get(     '/items',           passport.authenticate('jwt', {session:false}), ItemController.get);
router.post(    '/character/equip', passport.authenticate('jwt', {session:false}), CharacterController.equipItem);
router.post(    '/character/item',  passport.authenticate('jwt', {session:false}), CharacterController.addItem);
router.get(     '/character/:id/item',  passport.authenticate('jwt', {session:false}), CharacterController.getItem);
router.delete(  '/items',       passport.authenticate('jwt', {session:false}), ItemController.deleteItem);

/* USER */
router.post(    '/users',           UserController.create);                                                    // C
router.get(     '/users',           passport.authenticate('jwt', {session:false}), UserController.get);        // R
router.put(     '/users',           passport.authenticate('jwt', {session:false}), UserController.update);     // U
router.delete(  '/users',           passport.authenticate('jwt', {session:false}), UserController.remove);     // D

router.post(    '/users/login',     UserController.login);

//********* API DOCUMENTATION **********
router.use('/docs/api.json',            express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs',                     express.static(path.join(__dirname, '/../public/v1/documentation/dist')));

module.exports = router;

