import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import logo from "@/public/images/logo.svg";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-6 pt-10 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.15)] dark:bg-gray-900 w-1/3 text-center relative mt-6">
        {/* 半浮动的Logo效果，两种模式下都有阴影 */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 p-4 rounded-full shadow-md dark:shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
          <Image
            priority={true}
            src={logo}
            width={48}
            height={48}
            alt={`${APP_NAME} logo`}
          />
        </div>

        <h1 className="text-3xl font-bold mb-4 dark:text-white">Not Found</h1>
        <p className="text-destructive dark:text-red-400">
          Could not find requested resource
        </p>
        <Button variant="outline" className="mt-4 ml-2 dark:hover:bg-gray-700">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
