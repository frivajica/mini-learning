import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: "- Mini Payload CMS",
    },
  },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: {
        defaultColumns: ["name", "email", "role"],
        useAsTitle: "name",
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
    },
    {
      slug: "posts",
      admin: {
        defaultColumns: ["title", "author", "status", "createdAt"],
        description: "Blog posts with draft/publish workflow",
      },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === "create" && data._status === "published") {
              data.publishedAt = new Date().toISOString();
            }
            return data;
          },
        ],
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
        read: ({ req: { user } }) => {
          if (user?.role === "admin") return true;
          return true;
        },
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      slug: "categories",
      admin: {
        defaultColumns: ["name", "slug", "parent"],
        description: "Organize posts into categories",
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
    },
    {
      slug: "tags",
      admin: {
        defaultColumns: ["name", "slug"],
        description: "Flat tags for cross-categorization",
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
    },
    {
      slug: "media",
      admin: {
        defaultColumns: ["filename", "mimeType", "filesize"],
        description: "File uploads and images",
      },
      upload: {
        staticDir: "uploads",
        imageSizes: [
          {
            name: "thumbnail",
            width: 400,
            height: 300,
            position: "centre",
          },
          {
            name: "card",
            width: 768,
            height: 512,
            position: "centre",
          },
        ],
        adminThumbnail: "thumbnail",
        mimeTypes: ["image/*", "application/pdf"],
      },
      fields: [
        {
          name: "alt",
          type: "text",
          required: true,
          label: "Alt Text",
        },
        {
          name: "caption",
          type: "text",
        },
      ],
      access: {
        read: () => true,
        create: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => user?.role === "admin",
      },
    },
  ],
  editor: lexicalEditor(),
  secret:
    process.env.PAYLOAD_SECRET_KEY || "dev-secret-key-change-in-production",
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
