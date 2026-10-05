import type { Metadata } from "next";

import { AddressesContent } from "./addresses-content";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return <AddressesContent />;
}
