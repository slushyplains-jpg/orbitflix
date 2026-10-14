import { createServerFn } from "@tanstack/react-start";

export const adminLogin = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { password: string } }) => {
    const { checkPassword } = await import("./adminAuth.server");
    return checkPassword(data.password);
  },
);

export const adminSessionCheck = createServerFn({ method: "GET" }).handler(async () => {
  const { checkSession } = await import("./adminAuth.server");
  return { valid: await checkSession() };
});
