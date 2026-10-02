"use client";

import { useRouter } from "next/navigation";
import { MarketingView, UploadCard } from "@/components/admin-dashboard";
import { SETTING_KEYS, type TrackingSettings } from "@/lib/settings";

/**
 * Marketing e mídia do site, agora no admin 2.0: tags de rastreamento,
 * Conversions API do Meta e foto da Ju. Salva na mesma configuração que o
 * site lê (aba Marketing do admin antigo usava a mesma).
 */
export default function Ajustes({
  tracking,
  capiTokenConfigurado,
  juPhotoUrl,
  pronto,
}: {
  tracking: TrackingSettings;
  capiTokenConfigurado: boolean;
  juPhotoUrl: string | null;
  pronto: boolean;
}) {
  const router = useRouter();
  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-[1.5rem] text-grafite">Foto da Ju</h2>
        <p className="mt-1 max-w-2xl text-sm text-mineral-escuro">
          Aparece na Home e na página da Ju. JPG ou PNG, de preferência vertical (4:5).
        </p>
        <div className="mt-4 max-w-md">
          <UploadCard
            titulo="Foto da Ju Ferreira"
            descricao="Substitui a foto atual no site em até um minuto."
            kind="ju"
            accept="image/*"
            settingKey={SETTING_KEYS.juPhotoUrl}
            atual={juPhotoUrl}
            tipo="imagem"
            disabled={!pronto}
            onDone={() => router.refresh()}
          />
        </div>
      </section>
      <MarketingView tracking={tracking} capiTokenConfigurado={capiTokenConfigurado} disabled={!pronto} />
    </div>
  );
}
