import { ControllerRenderProps } from "react-hook-form";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ImageUploadFieldProps extends Partial<ControllerRenderProps> {
  value?: string[];
  onChange?: (images: string[]) => void;
  maxFiles?: number;
  onUploadError?: (error: Error) => void;
}

// * 支持拖拽上传，当前并未使用，只是作为示例
export const ImageUploadField = ({
  value: images = [],
  onChange,
  maxFiles = 5,
  onUploadError,
}: ImageUploadFieldProps) => {
  const handleUploadComplete = (res: { url: string }[]) => {
    // 支持多文件同时上传
    const newUrls = res.map((file) => file.url);
    const combinedImages = [...(images || []), ...newUrls].slice(0, maxFiles);

    onChange?.(combinedImages);
    toast({
      description: `成功上传 ${newUrls.length} 张图片 (总数: ${combinedImages.length}/${maxFiles})`,
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = (images || []).filter(
      (_, index) => index !== indexToRemove
    );
    onChange?.(updatedImages);
  };

  return (
    <FormItem className="w-full">
      <FormLabel>Images</FormLabel>
      <Card>
        <CardContent className="space-y-2 mt-2 min-h-48">
          <div className="flex flex-wrap gap-2 mb-4">
            {(images || []).map((image, index) => (
              <div key={image} className="relative w-20 h-20 group">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {(images || []).length < maxFiles && (
            <FormControl>
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error) => {
                  onUploadError?.(error);
                }}
                appearance={{
                  container: "min-h-[100px] border-2 border-dashed rounded-lg",
                  uploadIcon: "text-blue-500 w-12 h-12",
                  label: "text-medium text-gray-600 text-center",
                }}
                content={{
                  label: "拖拽或点击上传多个文件",
                  allowedContent: "最多支持 5 张图片",
                }}
                // 关键修改：配置上传选项
                config={{
                  mode: "manual", // 手动模式
                }}
              />
            </FormControl>
          )}
        </CardContent>
      </Card>
      <FormMessage />
    </FormItem>
  );
};
