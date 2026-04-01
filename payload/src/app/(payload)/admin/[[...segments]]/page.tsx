import { Metadata } from "next";
import { RootPage, generateKernel } from "@payloadcms/next";
import { getPayload } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Admin - Mini Payload CMS",
};

const payload = await getPayload();

export default RootPage(payload, {
  generateKernel,
  importPath: "@/app/(payload)/admin/[[...segments]]/page#Kernel",
});
