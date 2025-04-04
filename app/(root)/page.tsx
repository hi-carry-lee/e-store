import ProductList from "@/components/shared/product/product-list";
// import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product.actions";
import { convertToPlainObject } from "@/lib/utils";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants/index";

const HomePage = async () => {
  const latestProducts = convertToPlainObject(await getLatestProducts());
  return (
    <>
      <ProductList
        data={latestProducts}
        title="Newest Arrivals"
        limit={LATEST_PRODUCTS_LIMIT}
      />
    </>
  );
};

export default HomePage;
