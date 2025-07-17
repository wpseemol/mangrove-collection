import { redirect } from "next/navigation";

export default async function EditProduct({
     params,
}: {
     params: Promise<{ productSlug: string }>;
}) {
     const slug = (await params).productSlug;

     redirect(`/dashboard/products/${slug}/edit`);
     return;
}
