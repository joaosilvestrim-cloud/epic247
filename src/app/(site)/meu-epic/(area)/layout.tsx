import { Container } from "@/components/epic/ui";
import NavMeuEpic from "@/components/epic/meu-epic/NavMeuEpic";

// Navegação mínima do CR-01A: cinco seções, nada além disso.
export default function AreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] pb-20">
      <div className="border-b border-linha bg-papel">
        <Container>
          <NavMeuEpic />
        </Container>
      </div>
      {children}
    </div>
  );
}
