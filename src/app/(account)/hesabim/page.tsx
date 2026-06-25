import { auth } from "@/auth";
import { SignOutButton } from "./SignOutButton";

export default async function HesabimPage() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-neutral-950 p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Hesabım</h1>
        <p className="text-neutral-300">Merhaba, {session?.user?.name}</p>
        <p className="text-neutral-500 text-sm">Rol: {session?.user?.role}</p>
        <SignOutButton />
      </div>
    </main>
  );
}
