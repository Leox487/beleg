import { auth } from "@clerk/nextjs/server";

import { NavBarClient } from "@/app/components/NavBarClient";

export async function Navbar() {
  const { userId } = await auth();
  return <NavBarClient signedIn={Boolean(userId)} />;
}
