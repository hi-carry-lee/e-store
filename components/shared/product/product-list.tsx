import ProductCard from "./product-card";
import { Product } from "@/types";

const ProductList = ({
  data,
  title,
  limit,
}: {
  data: Product[];
  title?: string;
  limit?: number;
}) => {
  const limitedData = limit ? data.slice(0, limit) : data;
  return (
    <div>
      <h2 className="h2-bold text-center sm:text-left">{title}</h2>
      <div>
        {data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center mt-3">
            {limitedData.map((product: Product) => (
              <ProductCard product={product} key={product.slug} />
            ))}
          </div>
        ) : (
          <div>
            <p>No Product Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
