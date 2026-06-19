import { query } from "express-validator";
import mongoose from "mongoose";

export const getPhotosValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Pagina trebuie să fie un număr pozitiv.")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limita trebuie să fie între 1 și 50.")
    .toInt(),

  query("q")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Textul de căutare este prea lung."),

  query("tagIds")
    .optional()
    .customSanitizer((value) =>
      String(value)
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
    .custom((tagIds: string[]) => {
      return tagIds.every((id) => mongoose.Types.ObjectId.isValid(id));
    })
    .withMessage("Tag IDs invalide."),

  query("matchAllTags")
    .optional()
    .isBoolean()
    .withMessage("matchAllTags trebuie să fie true sau false.")
    .toBoolean(),
  
  query("latestFirst")
    .optional()
    .isBoolean()
    .withMessage("latestFirst trebuie să fie true sau false.")
    .toBoolean(),
    
    query("includeIsMine")
    .optional()
    .isBoolean()
    .withMessage("includeIsMine trebuie să fie true sau false.")
    .toBoolean(),
  
  query("mine")
    .optional()
    .isBoolean()
    .withMessage("mine trebuie să fie true sau false.")
    .toBoolean(),
];
