import { Titulo } from "@/components/epic/admin/ui";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { getMetaCapiTokenConfigurado, getSettings, getTracking } from "@/lib/settings";
import { getServiceClient } from "@/lib/supabase";
import Ajustes from "./Ajustes";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  await exigirAdmin();
  const [settings, tracking, capi] = await Promise.all([getSettings(), getTracking(), getMetaCapiTokenConfigurado()]);
  const pronto = Boolean(getServiceClient());
  return (
    <>
      <Titulo sub="Tags de rastreamento, Conversions API e foto da Ju. O que salvar aqui entra no site sem deploy.">
        Marketing e site
      </Titulo>
      {!pronto && (
        <p className="mb-6 rounded border border-[#8a3f30]/40 bg-papel-claro p-3 text-sm text-[#8a3f30]">
          Supabase não está configurado no servidor. Nada pode ser salvo aqui.
        </p>
      )}
      <Ajustes tracking={tracking} capiTokenConfigurado={capi} juPhotoUrl={settings.juPhotoUrl} pronto={pronto} />
    </>
  );
}
