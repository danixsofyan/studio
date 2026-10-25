import { notFound } from "next/navigation";
import { getEditorData, getProfile } from "@/lib/data";
import { Editor } from "@/components/editor/editor";

export const dynamic = "force-dynamic";

export default async function VideoEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, profile] = await Promise.all([getEditorData(id), getProfile()]);

  if (!data) notFound();

  return <Editor initial={data} voiceConfigured={Boolean(profile?.voice_id)} />;
}
