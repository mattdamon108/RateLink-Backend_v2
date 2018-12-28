import { Context } from "../types/resolver";

const privateResolver = (resolverFunction: any) => async (
  root: any,
  args: any,
  ctx: Context,
  info: any
) => {
  if (!ctx.user) throw new Error("Log in required");

  const resolved = await resolverFunction(root, args, ctx, info);
  return resolved;
};

export default privateResolver;
