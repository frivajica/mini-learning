import type { CollectionConfig } from "payload";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    defaultColumns: ["name", "slug"],
    description: "Flat tags for cross-categorization",
    defaultLimit: 30,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: 30,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
};
