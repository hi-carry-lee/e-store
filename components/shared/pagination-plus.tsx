"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

type PaginationPlusProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
  siblingCount?: number;
};

const PaginationPlus = ({
  page: currentPage,
  totalPages,
  urlParamName = "page",
  siblingCount = 1,
}: PaginationPlusProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentPageNumber = Number(currentPage);

  // 使用Next.js内置工具创建URL
  const createPageURL = (pageNumber: number) => {
    // 创建当前查询参数的可修改副本
    const params = new URLSearchParams(searchParams.toString());

    // 设置页码参数
    params.set(urlParamName, pageNumber.toString());

    // 返回完整URL
    return `${pathname}?${params.toString()}`;
  };

  // 生成要显示的页码数组
  const generatePagination = () => {
    // 如果总页数少于7，显示所有页码
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 计算显示范围
    const leftSiblingIndex = Math.max(currentPageNumber - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPageNumber + siblingCount,
      totalPages
    );

    // 是否显示省略号
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // 始终显示第一页和最后一页
    if (shouldShowLeftDots && shouldShowRightDots) {
      // 显示当前页附近的页码、第一页和最后一页
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "...", ...middleRange, "...", totalPages];
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // 显示当前页附近靠右的页码
      const rightRange = Array.from(
        { length: totalPages - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "...", ...rightRange];
    } else if (!shouldShowLeftDots && shouldShowRightDots) {
      // 显示当前页附近靠左的页码
      const leftRange = Array.from(
        { length: rightSiblingIndex },
        (_, i) => i + 1
      );
      return [...leftRange, "...", totalPages];
    }

    // 不应该到达这里，但为了安全起见
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const paginationItems = generatePagination();

  // 上一页是否禁用
  const isPreviousDisabled = currentPageNumber <= 1;
  // 下一页是否禁用
  const isNextDisabled = currentPageNumber >= totalPages;

  return (
    <Pagination>
      <PaginationContent>
        {/* 上一页按钮 */}
        <PaginationItem>
          <PaginationPrevious
            href={
              isPreviousDisabled ? "#" : createPageURL(currentPageNumber - 1)
            }
            onClick={(e) => {
              if (isPreviousDisabled) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              router.push(createPageURL(currentPageNumber - 1), {
                scroll: false,
              });
            }}
            className={
              isPreviousDisabled
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {/* 页码按钮 */}
        {paginationItems.map((item, index) => {
          if (item === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const pageNumber = Number(item);
          const isActive = pageNumber === currentPageNumber;

          return (
            <PaginationItem key={`page-${pageNumber}-${index}`}>
              <PaginationLink
                href={createPageURL(pageNumber)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(createPageURL(pageNumber), { scroll: false });
                }}
                isActive={isActive}
                className="cursor-pointer"
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* 下一页按钮 */}
        <PaginationItem>
          <PaginationNext
            href={isNextDisabled ? "#" : createPageURL(currentPageNumber + 1)}
            onClick={(e) => {
              if (isNextDisabled) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              router.push(createPageURL(currentPageNumber + 1), {
                scroll: false,
              });
            }}
            className={
              isNextDisabled
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationPlus;
