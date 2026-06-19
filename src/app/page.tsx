import Landing from "@/components/landing";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getSettings();
  return <Landing settings={settings} />;
}
