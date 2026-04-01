import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    defaultColumns: ["name", "slug", "parent"],
    description: "Organize posts into categories",
    defaultLimit: 20,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: 50,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      admin: {
        description: "Optional parent category for hierarchical structure",
      },
    },
    {
      name: "description",
      type: "textarea",
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
};
