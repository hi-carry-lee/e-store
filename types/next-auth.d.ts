import { DefaultSession } from "next-auth";

/*
Authjs的官方文档-Getting Started-Typescript中提到了：Module Augmentation:
  1. Authjs默认提供了所需的类型；
  2. 我们可以通过 TypeScript’s Module Augmentation 去扩展已有的类型；
  3. DefaultJWT是Authjs定义的 基础结构的接口，对它进行扩展也可以
*/

// Module Augmentation:
// 当前还是beta版本，扩展的是"next-auth"，未来稳定版可能会使用:"@auth/core"
declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

// 由于你在代码中使用了 jwt 回调传递 role，还需要扩展 JWT 类型：
/*
  如果扩展JWT类型，那么ESlint会告警：JWT定义但未被使用，这个告警不影响使用，解决方案：
  1. 引入 import { DefaultJWT } from "next-auth/jwt"; 然后定义JWT类型继承它，扩展它；
  2. 使用ESLint注释禁用该行的规则: // eslint-disable-next-line @typescript-eslint/no-unused-vars 
*/
import { DefaultJWT } from "next-auth/jwt";
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
  }
}
