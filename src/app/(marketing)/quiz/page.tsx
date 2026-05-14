import { QuizClient } from "./quiz-client";

export const metadata = {
  title: "Quiz gratuito di compliance AI Act",
  description:
    "Scopri in 3 minuti se la tua azienda è a norma con AI Act e Legge 132/2025. Quiz gratuito di 17 domande con report personalizzato.",
};

export default function QuizPage() {
  return (
    <div className="bg-gradient-to-b from-violet-50/40 to-white">
      <div className="container-narrow py-10 sm:py-14">
        <QuizClient />
      </div>
    </div>
  );
}
