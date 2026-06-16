import {
  Hero,
  StepsHowItWorks,
  CaseStudies,
  ConditionGrid,
  ConsultationCTA,
  type CaseStudy,
} from "@/components/site/sections";

// Patient case studies, copy preserved from the live homepage.
const CASE_STUDIES: CaseStudy[] = [
  {
    name: "Stephany — Inflammatory Bowel Disease",
    symptoms:
      "Battled inflammatory bowel disease for 20 years. Her surgeon advised removing her colon, requiring a lifelong colostomy bag.",
    results:
      "Within one month, bleeding stopped and bowel function normalized. Three months later, off all medications — surgery cancelled.",
  },
  {
    name: "Judy — Multiple Chronic Conditions",
    symptoms:
      "Daily diarrhea, cramping, bloating and blood in stool, COPD with constant coughing, disabling knee pain, high blood pressure, diabetes, overweight.",
    results:
      "In six weeks bowel function normalized, cough and joint pain nearly gone, blood sugar 250→115. Six months later, off all medications and down over 70 lbs.",
  },
  {
    name: "Jeff — Ankylosing Spondylitis",
    symptoms:
      "Suffered with ankylosing spondylitis, a crippling autoimmune form of rheumatoid arthritis — one step away from a wheelchair for life.",
    results:
      "Within 3 months, pain-free and full of energy, off all medications, working out daily on the treadmill and weight lifting.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <StepsHowItWorks />
      <CaseStudies studies={CASE_STUDIES} />
      <ConditionGrid />
      <ConsultationCTA />
    </>
  );
}
