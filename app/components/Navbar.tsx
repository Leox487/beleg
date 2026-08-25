import { auth } from "@clerk/nextjs/server";

import { NavBarClient } from "@/app/components/NavBarClient";
import { useCasesByCategory } from "@/lib/use-cases";

export async function Navbar() {
  const { userId } = await auth();
  const groups = Array.from(useCasesByCategory().entries()).map(
    ([category, items]) => ({
      category,
      items: items.map((item) => ({ id: item.id, label: item.label })),
    }),
  );

  return <NavBarClient signedIn={Boolean(userId)} groups={groups} />;
}
