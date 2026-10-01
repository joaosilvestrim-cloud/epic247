import NewsletterForm from "./NewsletterForm";

export default function NewsletterInline() {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
      <div>
        <p className="font-mono text-sm text-latao-escuro">Newsletter</p>
        <p className="mt-3 font-display text-[1.8rem] leading-tight text-grafite">Uma carta, de vez em quando.</p>
      </div>
      <NewsletterForm claro />
    </div>
  );
}
