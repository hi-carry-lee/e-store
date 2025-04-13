import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <header className="border-b container mx-auto">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="w-22">
            <Image
              src="/images/logo.svg"
              width={48}
              height={48}
              alt={`${APP_NAME} logo`}
            />
          </Link>
          {/* Nav for user orders and user profile */}
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Menu />
          </div>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
        {children}
      </div>
    </div>
  );
}
