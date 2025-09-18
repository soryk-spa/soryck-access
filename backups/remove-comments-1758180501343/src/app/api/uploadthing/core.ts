import { createUploadthing, type FileRouter } from "uploadthing/next";
import { requireAuth } from "@/lib/auth";

// Ensure uploadthing middleware runs dynamically so auth() can access request
export const dynamic = 'force-dynamic'

const f = createUploadthing();

export const ourFileRouter = {
  eventImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await requireAuth();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;