import { Entity } from "electrodb";
import { electroConfig } from "../index";

export const User = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "draff",
    },
    attributes: {
      userId: {
        type: "string",
        required: true,
      },
      auth0Id: {
        type: "string",
        required: true,
      },
      username: {
        type: "string",
        required: true,
      },
      name: {
        type: "string",
        required: false,
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
          composite: ["userId"],
        },
        sk: {
          field: "sk",
          composite: ["userId"],
        },
      },
      byAuth0: {
        index: "gs1",
        pk: {
          field: "gs1pk",
          composite: ["auth0Id"],
        },
        sk: {
          field: "gs1sk",
          composite: ["auth0Id"],
        },
      },
      byUsername: {
        index: "gs2",
        pk: {
          field: "gs2pk",
          composite: ["username"],
        },
        sk: {
          field: "gs2sk",
          composite: ["username"],
        },
      },
    },
  },
  electroConfig
); 