"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [thumbnailOffset, setThumbnailOffset] = useState(0);

  // 可配置的缩略图显示数量
  const THUMBNAIL_DISPLAY_COUNT = 4;

  // 处理缩略图左侧滚动
  const handleThumbnailPrevious = () => {
    if (thumbnailOffset > 0) {
      setThumbnailOffset((prev) => prev - 1);
      setCurrent((prev) => prev - 1);
    }
  };

  // 处理缩略图右侧滚动
  const handleThumbnailNext = () => {
    const maxOffset = Math.max(0, images.length - THUMBNAIL_DISPLAY_COUNT);
    if (thumbnailOffset < maxOffset) {
      setThumbnailOffset((prev) => prev + 1);
      setCurrent((prev) => prev + 1);
    }
  };

  // 计算可见缩略图
  const visibleThumbnails = useMemo(() => {
    return images.slice(
      thumbnailOffset,
      thumbnailOffset + THUMBNAIL_DISPLAY_COUNT
    );
  }, [images, thumbnailOffset]);

  // 处理图片选择
  const handleImageSelect = (index: number) => {
    const actualIndex = thumbnailOffset + index;
    setCurrent(actualIndex);
  };

  return (
    <div className="w-full">
      {/* 主图展示区域 */}
      <Image
        src={images[current]}
        alt="product image"
        width={1000}
        height={1000}
        className="object-cover object-center min-h-[300px] mb-2"
      />

      {/* 缩略图容器 */}
      <div className="flex items-center space-x-4">
        {/* 左侧导航按钮 */}
        <button
          onClick={handleThumbnailPrevious}
          className={cn(
            "bg-white/50 rounded-full p-1 hover:bg-white/70",
            // 当无法继续向左滚动时，禁用并降低不透明度
            thumbnailOffset === 0 && "opacity-50 cursor-not-allowed"
          )}
          disabled={thumbnailOffset === 0}
          aria-label="Previous thumbnails"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 缩略图展示区域 */}
        <div
          // 关键样式：使用 flex-grow 和 min-w-0 确保所有缩略图尺寸一致
          // flex-grow 确保均匀分配可用空间
          // min-w-0 防止内容撑开容器，强制等比缩放
          className="flex-grow flex justify-between space-x-2"
        >
          {visibleThumbnails.map((image, index) => (
            <div
              key={`${image}-${thumbnailOffset + index}`}
              onClick={() => handleImageSelect(index)}
              className={cn(
                // flex-grow 确保每个缩略图占据相等的空间
                "flex-grow cursor-pointer hover:border-orange-600 border min-w-0",
                current === thumbnailOffset + index
                  ? "border-orange-600"
                  : "border-gray-300"
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                width={100}
                height={100}
                // aspect-square 和 w-full 确保图片保持正方形并填满容器
                className="object-cover w-full aspect-square"
              />
            </div>
          ))}
        </div>

        {/* 右侧导航按钮 */}
        <button
          onClick={handleThumbnailNext}
          className={cn(
            "bg-white/50 rounded-full p-1 hover:bg-white/70",
            // 当无法继续向右滚动时，禁用并降低不透明度
            thumbnailOffset + THUMBNAIL_DISPLAY_COUNT >= images.length &&
              "opacity-50 cursor-not-allowed"
          )}
          disabled={thumbnailOffset + THUMBNAIL_DISPLAY_COUNT >= images.length}
          aria-label="Next thumbnails"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProductImages;
