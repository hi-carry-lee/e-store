"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="dark:hover:bg-gray-700"
      onClick={() => router.back()}
    >
      Back to Previous
    </Button>
  );
};

export default BackButton;
