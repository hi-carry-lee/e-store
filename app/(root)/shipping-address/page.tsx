import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Cart, ShippingAddress } from "@/types";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";
import CheckoutSteps from "@/components/shared/checkout-steps";

const ShippingAddressPage = async () => {
  const cart = (await getMyCart()) as Cart;
  if (!cart || cart.items.length === 0) {
    // compare to useRouter, it only been used in
    // !Server Side
    redirect("/cart");
  }

  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    throw new Error("No user id");
  }
  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={1} />
      {/* user.address在数据库中以JSON字符串形式存储，Prisma查询后自动转为JavaScript对象 */}
      {/* 由于ShippingAddressForm组件的address属性需要ShippingAddress类型，此处使用TypeScript类型断言 */}
      {/* 相当于告诉TS编译器，这个值符合 ShippingAddress 类型 */}
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
