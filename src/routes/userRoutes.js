const { Router } = require("express");
const { check } = require("express-validator");

const UserControllers = require("../controllers/userController");
const { fieldsValidate } = require("../middlewares/fieldsValidate");
const { emailExiste } = require("../helpers/db-validators");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

router.get("/", validarJWT, UserControllers.getUsers);

router.post(
  "/",
  [
    validarJWT,
    check("password", "El password tiene que tener de 6 a 25 caracteres").isLength({
      min: 6,
      max: 25,
    }),
    check("email", "El email es invalido").isEmail(),
    check("email").custom(emailExiste),
    check("rol", "No es un rol valido").isIn(["ADMIN_ROLE", "USER_ROLE"]),
    fieldsValidate,
  ],
  UserControllers.newUser
);

module.exports = router;
