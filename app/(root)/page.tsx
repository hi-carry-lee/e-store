import ProductList from "@/components/shared/product/product-list";
// import sampleData from "@/db/sample-data";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import { convertToPlainObject } from "@/lib/utils";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants/index";
import ViewAllProductsButton from "@/components/view-all-products-button";
import ProductCarousel from "@/components/shared/product/product-carousel";
import IconBoxes from "@/components/icon-boxes";
import DealCountdown from "@/components/deal-countdown";

const HomePage = async () => {
  const latestProducts = convertToPlainObject(await getLatestProducts());
  const featuredProducts = await getFeaturedProducts();
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList
        data={latestProducts}
        title="Newest Arrivals"
        limit={LATEST_PRODUCTS_LIMIT}
      />
      <ViewAllProductsButton />
      <DealCountdown />
      <IconBoxes />
    </>
  );
};

export default HomePage;
