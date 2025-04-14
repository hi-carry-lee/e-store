"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { signOutUser } from "@/lib/actions/user.actions";

const UserButton = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 获取当前完整路径（包括查询参数）
  const currentPath =
    searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname;

  if (!session) {
    return (
      <Button asChild>
        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`}>
          <UserIcon /> Sign In
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? "";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-300"
            >
              {firstInitial ? firstInitial : <UserIcon />}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          {session.user.role === "admin" && (
            <DropdownMenuItem>
              <Link className="w-full" href="/admin/overview">
                Admin
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Link className="w-full" href="/user/profile">
              User Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/user/orders">
              Order History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 mb-1">
            <Button
              onClick={signOutUser}
              className="w-full py-4 px-2 h-4 justify-start"
              variant="ghost"
            >
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
