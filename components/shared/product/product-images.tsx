"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  return (
    <div>
      <Image
        src={images[current]}
        alt="product image"
        width={1000}
        height={1000}
        className="object-cover object-center min-h-[300px]"
      />
      <div className="flex gap-2">
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(
              "border cursor-pointer hover:border-orange-600",
              index === current ? " border-orange-600" : ""
            )}
          >
            <Image src={image} alt={image} width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
