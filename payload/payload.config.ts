import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./src/collections/Users";
import { Posts } from "./src/collections/Posts";
import { Categories } from "./src/collections/Categories";
import { Tags } from "./src/collections/Tags";
import { Media } from "./src/collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: "- Mini Payload CMS",
    },
  },
  collections: [Users, Posts, Categories, Tags, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET_KEY,
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
