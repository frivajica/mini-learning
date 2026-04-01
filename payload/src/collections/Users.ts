import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    defaultColumns: ["name", "email", "role"],
    useAsTitle: "name",
    defaultLimit: 20,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
      defaultValue: "user",
      required: true,
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
  ],
  access: {
    admin: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
  },
};
