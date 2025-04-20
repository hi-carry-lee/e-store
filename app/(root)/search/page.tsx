import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllProducts,
  getAllCategories,
} from "@/lib/actions/product.actions";
import Link from "next/link";
import { Product } from "@/types";
// 抽离常量：避免重复创建，也有利于维护 👍
import { PRICE_RANGES, RATINGS, SORT_ORDERS } from "@/lib/constants";
import { Suspense } from "react";
import PaginationPlus from "@/components/shared/pagination-plus";
import { Spinner } from "@/components/shared/spinner";

// 使用服务端组件优化性能和 SEO
// 通过为各个子功能创建独立的组件，可以更好地组织代码，提高可读性和可维护性
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 等待 searchParams Promise 解析
  const params = await searchParams;

  const { q = "all", category = "all", price = "all", rating = "all" } = params;

  // 使用更简洁的条件判断
  const filters = [
    { condition: q !== "all" && q.trim() !== "", text: q },
    {
      condition: category !== "all" && category.trim() !== "",
      text: `Category ${category}`,
    },
    {
      condition: price !== "all" && price.trim() !== "",
      text: `Price ${price}`,
    },
    {
      condition: rating !== "all" && rating.trim() !== "",
      text: `Rating ${rating} stars`,
    },
  ];

  const activeFilters = filters
    .filter((f) => f.condition)
    .map((f) => f.text)
    .join(" ");

  return {
    title: activeFilters || "Search Products",
  };
}

// 抽离 URL 构建逻辑到单独函数，作用如下：
// 合并参数：函数接收当前参数和新的参数更新，并将它们合并成一个新的对象。
// 清理参数：过滤掉无效的参数，确保 URL 中只包含有效的搜索条件。
// 构建 URL：使用 URLSearchParams 对象创建一个查询字符串，并返回完整的 URL，以便用户可以查看过滤后的搜索结果。
// Partial解释：TypeScript 提供的一个内置类型，用于将某个对象类型的所有属性都变为可选的，比如Partial<T> 返回一个类型，其所有属性都是 T 的属性，但这些属性都是可选的；
function buildFilterUrl(
  currentParams: SearchParams,
  updates: Partial<SearchParams>
): string {
  // 创建一个新对象，只包含字符串类型的值
  const newParams = { ...currentParams, ...updates };

  // 过滤并清理对象，确保所有值都是字符串
  const cleanParams: Record<string, string> = {};

  // 只保留有值的参数，并确保所有值都是字符串
  Object.keys(newParams).forEach((key) => {
    // 使用类型钥匙确保类型安全
    const value = newParams[key as keyof SearchParams];
    if (value !== undefined && value !== null) {
      cleanParams[key] = String(value); // 转换为字符串以便于生成 URL
    }
  });
  // 使用 URLSearchParams 生成查询字符串并返回完整的 URL
  return `/search?${new URLSearchParams(cleanParams).toString()}`;
}

// 异步组件：获取并显示产品列表
async function ProductList({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = params;

  // 获取产品数据
  const { data: products, totalPages } = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  return (
    <>
      {/* 产品展示区 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            Products Not Found
          </div>
        ) : (
          products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* 使用项目已有的分页组件 */}
      <div className="mt-6">
        <PaginationPlus page={page} totalPages={totalPages} />
      </div>
    </>
  );
}

// 产品列表加载状态组件
function ProductListFallback() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-md bg-gray-200 animate-pulse"
            // TODO:使用Spinner组件，作用不是很大
          >
            <Spinner size="sm" className="border-gray-400" />
            <span className="sr-only">Loading...</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 异步组件：类别侧边栏
async function CategorySidebar({
  currentParams,
}: {
  currentParams: Promise<SearchParams>;
}) {
  // 等待 Promise 解析
  const params = await currentParams;

  // 获取所有类别
  const categories = await getAllCategories();

  return <FilterSidebar categories={categories} currentParams={params} />;
}

// 类别侧边栏加载状态
function CategorySidebarFallback() {
  return (
    <div className="filter-links space-y-8">
      <div className="space-y-2">
        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-32 h-4 bg-gray-200 rounded animate-pulse"
              // TODO:使用Spinner组件，作用不是很大
            >
              <Spinner size="sm" className="border-gray-400" />
              <span className="sr-only">Loading...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 主搜索页面组件
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 在主组件中等待 searchParams 解析，然后传递给子组件
  const params = await searchParams;

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      {/* 左侧筛选区 - 使用 Suspense 包裹 */}
      <Suspense fallback={<CategorySidebarFallback />}>
        <CategorySidebar currentParams={searchParams} />
      </Suspense>

      {/* 右侧搜索结果区 */}
      <div className="md:col-span-4 space-y-4">
        {/* 搜索结果头部 */}
        <SearchHeader currentParams={params} />

        {/* 产品列表 - 使用 Suspense 包裹 */}
        <Suspense fallback={<ProductListFallback />}>
          <ProductList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// 筛选侧边栏组件（具体的筛选区块）
function FilterSidebar({
  categories,
  currentParams,
}: {
  categories: { category: string }[];
  currentParams: SearchParams;
}) {
  return (
    <div className="filter-links">
      {/* 类目筛选 */}
      <FilterSection
        title="Department"
        items={[
          { label: "Any", value: "all" },
          ...categories.map((c) => ({ label: c.category, value: c.category })),
        ]}
        type="category"
        currentParams={currentParams}
      />

      {/* 价格筛选 */}
      <FilterSection
        title="Price"
        items={[
          { label: "Any", value: "all" },
          ...PRICE_RANGES.map((p) => ({ label: p.name, value: p.value })),
        ]}
        type="price"
        currentParams={currentParams}
      />

      {/* 评分筛选 */}
      <FilterSection
        title="Customer Ratings"
        items={[
          { label: "Any", value: "all" },
          ...RATINGS.map((r) => ({
            label: `${r} stars & up`,
            value: r.toString(),
          })),
        ]}
        type="rating"
        currentParams={currentParams}
      />
    </div>
  );
}

// 通用筛选区块（作为其他筛选区块的模板、父容器）
function FilterSection({
  title,
  items,
  type,
  currentParams,
}: {
  title: string;
  items: { label: string; value: string }[];
  type: keyof SearchParams;
  currentParams: SearchParams;
}) {
  return (
    <div>
      <div className="text-xl mb-2 mt-8">{title}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.value}>
            <Link
              className={currentParams[type] === item.value ? "font-bold" : ""}
              href={buildFilterUrl(currentParams, { [type]: item.value })}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 搜索结果头部
// 用来展示当前的筛选条件，以及清除筛选按钮
function SearchHeader({ currentParams }: { currentParams: SearchParams }) {
  // keyof 是 TypeScript 的一个关键字，用于提取某个类型的所有键，并返回一个字符串字面量联合类型，表示该类型能够被访问的所有属性名，目的是：确保类型安全，防止被其他开发者修改或扩展，以及增强可维护性，如果 SearchParams 接口的结构发生变化或增加了新属性，那么会在这里自动提示需要更新
  // activeFilters 等同于："q" | "category" | "price" | "rating" | "sort" | "page"
  // key as keyof SearchParams 是一个类型断言，表示 key 变量一定是 SearchParams 接口中的某一个键
  const activeFilters = [
    { key: "q" as keyof SearchParams, label: "Query" },
    { key: "category" as keyof SearchParams, label: "Category" },
    { key: "price" as keyof SearchParams, label: "Price" },
    { key: "rating" as keyof SearchParams, label: "Rating" },
  ];

  return (
    <div className="flex-between flex-col md:flex-row my-4">
      {/* 当前筛选条件 */}
      <div className="flex items-center">
        {activeFilters
          .filter((f) => currentParams[f.key] && currentParams[f.key] !== "all")
          .map((f) => `${f.label}: ${currentParams[f.key]}`)
          .join(" ")}

        {/* 清除筛选按钮 */}
        {activeFilters.some(
          (f) => currentParams[f.key] && currentParams[f.key] !== "all"
        ) && (
          <Button variant="link" asChild>
            <Link href="/search">Clear</Link>
          </Button>
        )}
      </div>

      {/* 排序选项 */}
      <div>
        Sort by{" "}
        {SORT_ORDERS.map((s) => (
          <Link
            key={s}
            className={`mx-2 ${currentParams.sort === s ? "font-bold" : ""}`}
            href={buildFilterUrl(currentParams, { sort: s })}
          >
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}

// 类型定义
interface SearchParams {
  q?: string;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
}
