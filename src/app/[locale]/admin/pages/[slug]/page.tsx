import { notFound } from "next/navigation";
import { getPageBySlug, getPageContent } from "@/lib/page-content";
import PageEditor from "@/components/admin/PageEditor";

interface AdminPageEditorPageProps {
  params: { locale: string; slug: string };
}

/**
 * Page editor (deliverable 2B.2): loads both locale content rows for the slug
 * and renders the bilingual editor. Unknown slugs 404 (TD-17).
 */
export default async function AdminPageEditorPage({
  params,
}: AdminPageEditorPageProps) {
  const { slug } = params;

  const page = await getPageBySlug(slug);
  if (!page) {
    notFound();
  }

  const [en, zh] = await Promise.all([
    getPageContent(slug, "en"),
    getPageContent(slug, "zh"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">
        Edit page: {slug}
      </h1>
      <PageEditor slug={slug} initialEn={en} initialZh={zh} />
    </div>
  );
}