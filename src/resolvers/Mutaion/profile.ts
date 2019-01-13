import { Context, UserResponse, ContextWithUser } from "../../types/resolver";
import privateResolver from "../../util/privateResolver";
import { uploadToS3, deletePrevProfileImage } from "../../util/handleS3";

const checkVaildJob_boolean = (inputJob: string): boolean => {
  const ENUM = ["1", "2", "3"]; // 1: 선사, 2: 포워더, 3: 기타
  return ENUM.filter(job => job === inputJob).length === 1;
};

export const profile = {
  updateProfile: async (
    root: any,
    args: any,
    ctx: Context
  ): Promise<UserResponse> => {
    const { company, image, job_boolean, profile_name } = args;
    if (!checkVaildJob_boolean(job_boolean))
      return { ok: false, data: null, error: "Invalid job selected" };

    if (!ctx.user) return { ok: false, data: null, error: "Log in required!" };

    const profile = await ctx.prisma.account_myuserprofilesConnection({
      where: { owner: { id: ctx.user.id } }
    });

    await ctx.prisma.updateAccount_myuserprofile({
      where: { id: profile.edges[0].node.id },
      data: { company, image, job_boolean, profile_name }
    });

    return { ok: true, data: ctx.user, error: null };
  },
  updateProfileImage: privateResolver(
    async (
      root: any,
      args: any,
      ctx: ContextWithUser
    ): Promise<UserResponse> => {
      const { stream, filename } = await args.file;

      const reImageFile = /^([a-zA-Z0-9\s_\\.\-\(\):])+(.jpg|.jpeg|.gif|.png)$/;
      if (!reImageFile.test(filename)) {
        await stream.read();
        return { ok: false, data: null, error: "Image file only" };
      }

      const profile = await ctx.prisma.account_myuserprofilesConnection({
        where: { owner: { id: ctx.user.id } }
      });

      if (profile.edges[0].node.image !== "")
        await deletePrevProfileImage(profile.edges[0].node.image);

      const url = await uploadToS3({ stream, filename });

      await ctx.prisma.updateAccount_myuserprofile({
        where: { id: profile.edges[0].node.id },
        data: { image: url }
      });

      return { ok: true, data: ctx.user, error: null };
    }
  )
};
