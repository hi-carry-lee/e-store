"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "@/lib/constants";

// * TS参数类型解释：这个组件的参数是一个对象解构，作为整体使用HTMLAttributes作为类型；
// 对于...props，可以通过它传递其他的html属性，比如 id
// 就当前组件而言，没有必要使用参数；
const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {ADMIN_NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            // transition-colors：让color, background-color, border-color, text-decoration-color, fill, stroke;这些color产生过渡效果；
            // 在hover，以及pathname.includes(item.href)时，产生过渡效果；
            // 其他过渡的class有：transition：所有可动画属性、transition-transform：变换
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.includes(item.href) ? "" : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
