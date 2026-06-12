import { body } from "express-validator";

export const uploadPhotoSpotValidator = [
  body("title")
    .exists()
    .withMessage("Titlul este necesar.")
    .bail()
    .isString()
    .isLength({ min: 1, max: 80 })
    .withMessage("Titlul trebuie să aibă între 1 și 80 de caractere.")
    .trim()
    .escape(),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("Descrierea trebuie să fie text.")
    .isLength({ max: 500 })
    .withMessage("Lungimea maximă a descrierii este de 500 de caractere.")
    .trim()
    .escape(),

  body("city")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 80 })
    .withMessage("Orașul trebuie să aibă maxim 80 de caractere.")
    .trim()
    .escape(),

  body("county")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 80 })
    .withMessage("Județul trebuie să aibă maxim 80 de caractere.")
    .trim()
    .escape(),

  body("country")
    .exists()
    .withMessage("Țara este necesară.")
    .bail()
    .isString()
    .isLength({ min: 1, max: 80 })
    .withMessage("Țara trebuie să aibă între 1 și 80 de caractere.")
    .trim()
    .escape(),

  body("latitude")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitudinea este invalidă."),

  body("longitude")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitudinea este invalidă."),

  body("mapsUrl")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage("URL-ul Google Maps este prea lung.")
    .trim(),

  body("tagIds")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value.length) return [value];
      return [];
    })
    .isArray()
    .withMessage("tagIds trebuie să fie un array.")
    .bail(),

  body("tagIds.*")
    .isMongoId()
    .withMessage("Fiecare tag trebuie să fie un ID valid."),
];
