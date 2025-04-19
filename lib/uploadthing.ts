import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// You want a simple, one-click solution, or You need a basic file picker interface
export const UploadButton = generateUploadButton<OurFileRouter>();

// * 包含了文件选择和拖拽上传的两种功能
// You want a drag-and-drop interface, orYou need a more visual upload experience
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// You need complete control over the upload UI, orYou want to build a custom upload interface
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
