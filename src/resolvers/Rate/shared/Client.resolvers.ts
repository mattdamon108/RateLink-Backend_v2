import { Account_myuser } from "../../../../generated/prisma-client";
import { Context } from "../../../types/resolver";

export default {
  Client: {
    salesman: async (root: any, args: any, ctx: Context): Promise<Account_myuser> => {
      const salesman = await ctx.prisma.account_myusers({
        where: { rate_clients_some: { id: root.id } }
      });
      return salesman[0];
    }
  }
};
