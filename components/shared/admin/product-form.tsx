"use client";

import { useToast } from "@/hooks/use-toast";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import {
  UploadButton as UploadThingButton,
  useUploadThing,
} from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback, useState, useRef, useEffect } from "react"; // 更新：导入 useEffect
import { Upload, CloudUpload } from "lucide-react";

interface ProductFormProps {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}

const ProductForm = ({ type, product, productId }: ProductFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]); // 更新：新增状态来存储缩略图 URL

  const schema = type === "Update" ? updateProductSchema : insertProductSchema;
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res) {
        const newImageUrls = res.map((file: { url: string }) => file.url);
        form.setValue("images", [...images, ...newImageUrls]);
        setFiles([]);
        setPreviewImages([]); // 更新：清空缩略图状态
      }
    },
    onUploadError: (error: Error) => {
      toast({
        variant: "destructive",
        description: `ERROR! ${error.message}`,
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 更新：生成缩略图 URL
    const newPreviewImages = acceptedFiles.map(
      (file) => URL.createObjectURL(file) // 创建文件的 URL
    );
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setPreviewImages((prev) => [...prev, ...newPreviewImages]); // 更新：保存缩略图 URLs
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index)); // 更新：同步删除缩略图
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      form.setValue("images", newImages);
    },
    [images, form]
  );

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      if (type === "Create") {
        const res = await createProduct(values);
        if (!res.success) {
          toast({
            variant: "destructive",
            description: res.message,
          });
          return;
        }
        toast({
          description: res.message,
        });
        router.push("/admin/products");
        return;
      }

      if (type === "Update" && productId) {
        const res = await updateProduct({ ...values, id: productId });
        if (!res.success) {
          toast({
            variant: "destructive",
            description: res.message,
          });
          return;
        }
        toast({
          description: res.message,
        });
        router.push("/admin/products");
        return;
      }

      router.push("/admin/products");
    } catch {
      toast({
        variant: "destructive",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // 更新：在组件卸载时释放生成的 URL
  useEffect(() => {
    // 在组件卸载时释放所有生成的 URL
    return () => {
      previewImages.forEach((imageUrl) => URL.revokeObjectURL(imageUrl)); // 释放内存
    };
  }, [previewImages]);

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "name">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "slug">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "category">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "brand">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "price">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "stock">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div
          className="upload-field flex flex-col md:flex-row gap-5"
          // onDragOver 和 onDrop 是 Web API 中 HTML5 的拖放 (Drag and Drop) API 的一部分
          onDragOver={(e) => {
            e.preventDefault(); // 阻止默认行为，以便可以放置
            e.stopPropagation(); // 防止事件传播
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // 获取拖放的文件
            const acceptedFiles = Array.from(e.dataTransfer.files);
            onDrop(acceptedFiles); // 调用你之前定义的 onDrop
          }}
        >
          {/* Images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-4 mt-2 min-h-48">
                    {/* Existing Images */}
                    <div className="flex flex-wrap gap-2">
                      {images.map((image: string, index: number) => (
                        <div key={image} className="relative">
                          <Image
                            src={image}
                            alt="product image"
                            className="w-20 h-20 object-cover object-center rounded-sm"
                            width={100}
                            height={100}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.png"; // You can add a placeholder image
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* File Selection and Upload */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {files.map((file, index) => (
                          <div key={index} className="relative">
                            {/* 显示缩略图 */}
                            <div className="w-20 h-20 relative">
                              <Image
                                src={previewImages[index]} // 更新：使用缩略图 URL
                                alt="Preview"
                                className="object-cover object-center rounded-sm"
                                width={100}
                                height={100}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              onDrop(Array.from(e.target.files)); // 更新：将选中的文件传入 onDrop
                              e.target.value = "";
                            }
                          }}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className={`relative ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Files
                        </Button>
                        {files.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => startUpload(files)}
                            disabled={isUploading}
                          >
                            <CloudUpload className="mr-2 h-4 w-4" />
                            {isUploading ? "Uploading..." : "Upload Files"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* isFeatured */}
          Featured Product
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="space-x-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Is Featured?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="banner image"
                  className="w-full object-cover object-center rounded-sm"
                  width={1920}
                  height={680}
                />
              )}

              {isFeatured && !banner && (
                <UploadThingButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res: { url: string }[]) => {
                    form.setValue("banner", res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      variant: "destructive",
                      description: `ERROR! ${error.message}`,
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "description">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting ? "Submitting" : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
