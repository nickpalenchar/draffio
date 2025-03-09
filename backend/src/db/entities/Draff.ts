import { Entity } from "electrodb";
import { electroConfig } from "../index";

export const Draff = new Entity(
  {
    model: {
      entity: "draff",
      version: "1",
      service: "draff",
    },
    attributes: {
      draffId: {
        type: "string",
        required: true,
      },
      authorId: {
        type: "string",
        required: true,
      },
      title: {
        type: "string",
        required: false,
      },
      code: {
        type: "string",
        required: true,
      },
      language: {
        type: "string",
        required: true,
        default: "javascript"
      },
      createdAt: {
        type: "number",
        required: true,
        default: () => Date.now(),
      },
      updatedAt: {
        type: "number",
        required: true,
        watch: "*",
        default: () => Date.now(),
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["draffId"],
        },
        sk: {
          field: "sk",
          composite: ["draffId"],
        },
      },
      byAuthor: {
        index: "gs1",
        pk: {
          field: "gs1pk",
          composite: ["authorId"],
        },
        sk: {
          field: "gs1sk",
          composite: ["createdAt"],
        },
      },
    },
  },
  electroConfig
); 