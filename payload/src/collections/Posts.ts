import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";

const setPublishedAt = ({
  data,
  operation,
}: {
  data: Record<string, unknown>;
  operation: string;
}) => {
  if (operation === "create" && data._status === "published") {
    data.publishedAt = new Date().toISOString();
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    defaultColumns: ["title", "author", "status", "createdAt"],
    description: "Blog posts with draft/publish workflow",
    defaultLimit: 10,
  },
  hooks: {
    beforeChange: [setPublishedAt],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      maxLength: 100,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "URL-friendly identifier (auto-generated from title if empty)",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 200,
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor(),
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      defaultValue: "draft",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
  access: {
    read: ({ req: { user }, doc }) => {
      if (user?.role === "admin") return true;
      if (doc?.status === "published") return true;
      if (user && doc?.author === user.id) return true;
      return false;
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user }, doc }) => {
      if (user?.role === "admin") return true;
      return doc?.author === user?.id;
    },
    delete: ({ req: { user }, doc }) => {
      if (user?.role === "admin") return true;
      return doc?.author === user?.id;
    },
  },
};
