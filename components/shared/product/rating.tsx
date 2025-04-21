import { Star, StarHalf } from "lucide-react";

const Rating = ({ value, caption }: { value: number; caption?: string }) => {
  return (
    <div className="flex gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          if (value >= star) {
            // 全星
            return (
              <Star
                key={star}
                className="w-5 h-5 fill-yellow-500 text-yellow-500"
              />
            );
          } else if (value >= star - 0.5) {
            // 半星
            return (
              <StarHalf
                key={star}
                className="w-5 h-5 fill-yellow-500 text-yellow-500"
              />
            );
          } else {
            // 空星
            return (
              <Star
                key={star}
                className="w-5 h-5 text-yellow-500"
                fill="none"
              />
            );
          }
        })}
      </div>

      {caption && <span className="text-sm">{caption}</span>}
    </div>
  );
};

export default Rating;
