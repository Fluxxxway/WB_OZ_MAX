import { clearDraft } from "./draft";
import { useEffect, useState } from "react";
import ClaimForm from "./ClaimForm";
import DocumentView from "./DocumentView";
import FinalPage from "./FinalPage";
import { generateClaim } from "../../api/claims";
import {
  getMaxUser,
  enableClosingConfirmation,
  disableClosingConfirmation,
} from "../../max/bridge";

export default function ClaimFlow() {
  const [step, setStep] = useState("form"); // "form" | "preview" | "final"
  const [user, setUser] = useState(null);
  const [claim, setClaim] = useState(null); // снимок данных формы
  const [pdf, setPdf] = useState(null);     // { claim_id, pdf_url, mid }
  const [genStatus, setGenStatus] = useState("idle"); // idle | loading | error

  useEffect(() => {
    enableClosingConfirmation();
    getMaxUser().then(setUser);
    return () => disableClosingConfirmation();
  }, []);

  const handlePreview = (data) => {
    setClaim(data);
    setStep("preview");
    window.scrollTo(0, 0);
  };

  const handleEdit = () => {
    setStep("form");
    window.scrollTo(0, 0);
  };

  const handleGenerate = async () => {
    setGenStatus("loading");
    try {
      const result = await generateClaim(claim.payload);
      setPdf(result);
      clearDraft();
      setGenStatus("idle");
      setStep("final");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      setGenStatus("error");
    }
  };

  if (!user) {
    return <div style={{ padding: 24 }}>Загрузка...</div>;
  }

  return (
    <>
      {step === "form" && (
        <ClaimForm initial={claim} user={user} onPreview={handlePreview} />
      )}

      {step === "preview" && claim && (
        <DocumentView
          claim={claim}
          status={genStatus}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
        />
      )}

      {step === "final" && pdf && <FinalPage pdf={pdf} />}
    </>
  );
}