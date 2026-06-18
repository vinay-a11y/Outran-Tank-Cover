import { StaticPage } from "@/components/static-page";

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="Privacy" title="Your data stays guarded.">
      <p>OUTRAN collects only the information required to process guest checkout, ship orders, provide support, prevent fraud, and improve the shopping experience.</p>
      <p>Payments are processed through Razorpay. We do not store full card details on OUTRAN servers.</p>
    </StaticPage>
  );
}
