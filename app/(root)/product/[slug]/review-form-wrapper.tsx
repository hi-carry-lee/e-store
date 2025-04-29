"use client";

import ReviewForm from "./review-form";
import { useRouter } from "next/navigation";

export default function ReviewFormWrapper({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  const router = useRouter();

  // 处理提交回调
  const handleSubmit = () => {
    // 虽然这是一个Client组件，但是它依然可以触发该Client组件所有的server路由组件去重新获取数据
    router.refresh();
  };

  return (
    <ReviewForm
      userId={userId}
      productId={productId}
      // 当前组件是Client组件，可以向另外一个Client组件传递回调函数
      onReviewSubmitted={handleSubmit}
    />
  );
}
