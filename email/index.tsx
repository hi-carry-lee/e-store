import { Resend } from "resend";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import { Order } from "@/types";

import PurchaseReceiptEmail from "./purchase-receipt";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};

/*
什么场景下需要使用 dotenv 来配置环境变量？不通过Next.js运行时运行的代码：
  直接通过Node.js命令执行的脚本
  独立运行的工具或实用程序，比如命令行工具、脚本等
  非Next.js应用导入并使用的模块
  在Next.js应用启动之前执行的代码

下列环境可以直接使用环境变量：
1. 对于Server Components：
✅ 可以直接访问所有环境变量（包括那些没有NEXT_PUBLIC_前缀的）
不需要手动使用dotenv.config()
2. 对于Server Actions：
✅ 同样可以直接访问所有环境变量
Server Actions本质上是在服务器端执行的函数，与Server Components有相同的环境变量访问权限
不需要手动使用dotenv.config()
3. 对于API Routes：
✅ 可以直接访问所有环境变量
不需要手动使用dotenv.config()
4. 对于Client Components：
✅ 只能访问以NEXT_PUBLIC_开头的环境变量
不需要手动使用dotenv.config()
*/
