"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import {
  createUserByAdmin,
  setUserRole,
  deleteUserByAdmin,
} from "@/app/admin/actions";
import type { AdminUserInput } from "@/app/admin/actions";

type User = {
  id: string;
  ad: string;
  email: string;
  telefon: string | null;
  rol: "USER" | "ADMIN";
  createdAt: string;
  siparisSayisi: number;
};

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const emptyForm: AdminUserInput = {
  ad: "",
  email: "",
  telefon: "",
  sifre: "",
  rol: "USER",
};

export function UserManager({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AdminUserInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createUserByAdmin(form);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Kullanıcı oluşturulamadı.");
      }
    });
  }

  function changeRole(u: User) {
    setRowError(null);
    const yeniRol = u.rol === "ADMIN" ? "USER" : "ADMIN";
    startTransition(async () => {
      const res = await setUserRole(u.id, yeniRol);
      if (!res.ok) {
        setRowError(res.error ?? "Rol değiştirilemedi.");
      } else {
        router.refresh();
      }
    });
  }

  function remove(u: User) {
    setRowError(null);
    startTransition(async () => {
      const res = await deleteUserByAdmin(u.id);
      if (!res.ok) {
        setRowError(res.error ?? "Kullanıcı silinemedi.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>+ Yeni Kullanıcı</Button>
      </div>

      {rowError && (
        <p className="mb-5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {rowError}
        </p>
      )}

      {users.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center text-cream/50">
          Henüz kullanıcı yok.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border hairline">
          <table className="w-full text-sm">
            <thead className="bg-ink-2/60 text-left text-cream/50">
              <tr>
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">E-posta</th>
                <th className="px-5 py-3 font-medium">Telefon</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Sipariş</th>
                <th className="px-5 py-3 font-medium">Kayıt Tarihi</th>
                <th className="px-5 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className="border-t hairline transition hover:bg-cream/[0.03]"
                  >
                    <td className="px-5 py-3 text-cream/85">{u.ad}</td>
                    <td className="px-5 py-3 text-cream/65">{u.email}</td>
                    <td className="px-5 py-3 text-cream/65">
                      {u.telefon ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge rol={u.rol} />
                    </td>
                    <td className="px-5 py-3 text-cream/75">
                      {u.siparisSayisi}
                    </td>
                    <td className="px-5 py-3 text-cream/55">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      {isSelf ? (
                        <p className="text-right text-xs text-cream/40">
                          Bu sizsiniz
                        </p>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => changeRole(u)}
                            disabled={pending}
                            className="text-sm text-gold/80 transition hover:text-gold disabled:opacity-50"
                          >
                            {u.rol === "ADMIN" ? "Üyeliğe al" : "Yönetici yap"}
                          </button>
                          <button
                            onClick={() => remove(u)}
                            disabled={pending}
                            className="text-sm text-rose-600/80 transition hover:text-rose-700 disabled:opacity-50"
                          >
                            Sil
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <div className="glass relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius)] p-7">
            <h2 className="font-display text-2xl text-cream">Yeni Kullanıcı</h2>
            <p className="mt-2 text-sm text-cream/55">
              Yönetici rolü verirseniz bu hesap panele giriş yapabilir.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-cream/60">Ad</label>
                <input
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  E-posta
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  Telefon
                </label>
                <input
                  value={form.telefon ?? ""}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">Şifre</label>
                <input
                  type="password"
                  value={form.sifre}
                  onChange={(e) => setForm({ ...form, sifre: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">Rol</label>
                <select
                  value={form.rol}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rol: e.target.value as "USER" | "ADMIN",
                    })
                  }
                  className={inputCls}
                >
                  <option value="USER">Üye</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

            <div className="mt-7 flex justify-end gap-3">
              <Button variant="ghost" onClick={close} disabled={pending}>
                İptal
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RoleBadge({ rol }: { rol: "USER" | "ADMIN" }) {
  return rol === "ADMIN" ? (
    <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-xs font-medium text-gold-2">
      Yönetici
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border hairline bg-cream/5 px-3 py-1 text-xs font-medium text-cream/60">
      Üye
    </span>
  );
}
