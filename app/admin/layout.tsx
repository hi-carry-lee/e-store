import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";
import AdminSearch from "@/components/admin/admin-search";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <header className="border-b container mx-auto">
        <div className="flex h-16 items-center px-4">
          {/* Logo */}
          <Link href="/" className="w-22">
            <Image
              src="/images/logo.svg"
              width={48}
              height={48}
              alt={`${APP_NAME} logo`}
            />
          </Link>
          {/* Nav Links for admin*/}
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <AdminSearch />
            <Menu />
          </div>
        </div>
      </header>
      {/* flex-1：该元素自动填充剩余空间，也可以在响应式下自动收缩 */}
      {/* 但是因为父容器没有指定高度，而垂直方向本身就自动伸缩的，所以这个属性没有作用 */}
      <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
        {children}
      </div>
    </div>
  );
}
