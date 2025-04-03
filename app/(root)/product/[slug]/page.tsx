import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return notFound();
  }

  return (
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
            <p>
              {product.rating as string} of {product.numReviews} reviews
            </p>
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
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex justify-between">
                <div>Price</div>
                <div>
                  <ProductPrice value={Number(product.price)} />
                </div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>Status</div>
                <div>
                  {product.stock > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out Of Stock</Badge>
                  )}
                </div>
              </div>
              {product.stock > 0 && (
                // flex-center is a customized class name
                // but it seems that the div is not required❓❓
                // <div className="flex-center">
                <AddToCart
                  item={{
                    price: Number(product.price),
                    name: product.name,
                    slug: product.slug,
                    image: product.images[0],
                    productId: product.id,
                    qty: 1,
                  }}
                />
                // </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
