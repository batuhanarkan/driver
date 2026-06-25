import { LoginForm } from "./LoginForm";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ kayit?: string; sifirlandi?: string }>;
}) {
  const sp = await searchParams;
  return (
    <LoginForm
      kayitBasarili={sp.kayit === "basarili"}
      sifirlandi={sp.sifirlandi === "1"}
    />
  );
}
