"use client";

import Autoplay from "embla-carousel-autoplay"; // 自动播放插件
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // 导入 shadcn/ui 的轮播图组件
import { Product } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

// 定义组件：接收产品数据作为参数
export function ProductCarousel({ data }: { data: Product[] }) {
  // 创建 autoplay 插件的引用，避免每次重新渲染时重新创建插件实例
  const autoplayRef = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );
  return (
    // 配置轮播图组件
    <Carousel
      className="w-full mb-12" // 全宽，底部边距
      opts={{
        loop: true, // 启用循环轮播
      }}
      // 配置自动播放插件
      plugins={[autoplayRef.current]}
      // 使用插件实例（Autoplay）的方法，用来解决鼠标悬停时停止自动播放的问题
      onMouseEnter={() => autoplayRef.current.stop()}
      onMouseLeave={() => autoplayRef.current.play()}
    >
      {/* 轮播内容容器 */}
      <CarouselContent>
        {/* 遍历产品数据，用产品数据来吃渲染每个轮播项 */}
        {data.map((product: Product) => (
          // 每个轮播项是一个可点击的产品链接
          <CarouselItem key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className="relative mx-auto">
                {/* 使用 Next.js Image 组件优化图片 */}
                <Image
                  alt={product.name} // 图片替代文本
                  src={product.banner!} // 产品横幅图片（!表示非空断言）
                  width="0" // 宽度和高度设置为0，配合 sizes 使用
                  height="0"
                  sizes="100%" // 响应式图片大小，占据视口宽度的 100%
                  className="w-full h-auto" // 图片全宽，高度自适应
                />
                {/* 图片上的文字叠加层 */}
                <div className="absolute inset-0 flex items-end justify-center">
                  <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                    {product.name} {/* 显示产品名称 */}
                  </h2>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* 轮播图导航按钮 */}
      <CarouselPrevious /> {/* 上一张 */}
      <CarouselNext /> {/* 下一张 */}
    </Carousel>
  );
}

export default ProductCarousel;
