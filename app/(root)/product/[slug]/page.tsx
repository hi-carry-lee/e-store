import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/cart/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import ReviewList from "./review-list";
import Rating from "@/components/shared/product/rating";
import { auth } from "@/auth";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await getMyCart();

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* image column */}
          <div className="col-span-2">
            {/* Image component */}
            <ProductImages images={product.images} />
          </div>

          {/* detaile column */}
          <div className="col-span-2 p-5">
            <div className="flex flex-col gap-6">
              <p>
                {product.brand} {product.category}
              </p>
              <h2 className="h3-bold">{product.name}</h2>
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} reviews</p>
              {/* it seems this div is not necessary❓❓ */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <ProductPrice
                  value={Number(product.price)}
                  // w-24 is a important class, it shrink the ProductPrice🚩
                  className="rounded-full bg-green-100 text-green-800 text-center px-5 py-2 w-24"
                />
              </div>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Description</p>
              <p>{product.description}</p>
            </div>
          </div>

          {/* action column */}
          {/* 为什么这里不需要col-span-1? 因为css grid的自动分配机制: 当没有为某个子元素指定 grid-column 或 grid-row 的数量时，它会默认占据剩余的空间 */}
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-2 flex justify-between items-center min-w-0">
                  <div>Status</div>
                  <div className="flex-grow flex justify-end">
                    {product.stock > 0 ? (
                      <Badge className="px-2 py-1" variant="outline">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge className="px-2 py-1" variant="destructive">
                        Out Of Stock
                      </Badge>
                    )}
                  </div>
                </div>
                {product.stock > 0 && (
                  <AddToCart
                    cart={cart}
                    item={{
                      price: Number(product.price),
                      name: product.name,
                      slug: product.slug,
                      image: product.images[0],
                      productId: product.id,
                      qty: 1,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="h2-bold  mb-5">Customer Reviews</h2>
        <ReviewList
          productId={product.id}
          productSlug={product.slug}
          userId={userId || ""}
        />
      </section>
    </>
  );
};

export default ProductDetailsPage;
