import type { BrandId } from "./brands";

export interface DirectoryEntry {
  name: string;
  detail: string;
}

/** Everything the component gallery says, per brand, so no brand borrows another brand's voice. */
export interface GalleryCopy {
  tone: string;
  tagline: string;
  diffLabel: string;
  booking: {
    book: string;
    booked: string;
    cancel: string;
    reserve: string;
    reserved: string;
    idleStatus: string;
    reservedStatus: string;
    cancelledStatus: string;
    nothingToCancel: string;
    alreadyReserved: string;
  };
  providers: string;
  search: { placeholder: string; noun: string };
  directory: readonly DirectoryEntry[];
  name: { label: string; value: string; helper: string };
  specialty: { label: string; options: readonly string[] };
  reminders: { title: string; detail: string };
  consent: { label: string; required: string };
  badges: {
    success: string;
    info: string;
    warning: string;
    tags: readonly [string, string, string];
  };
  practitioner: {
    name: string;
    role: string;
    monogram: string;
    rating: string;
    reviews: string;
    slotLabel: string;
    slot: string;
    mode: string;
    bio: string;
    focus: string;
  };
  alert: { title: string; detail: string };
  progressLabel: string;
  empty: { title: string; detail: string; upload: string };
  intake: {
    eyebrow: string;
    title: string;
    body: string;
    keyLabel: string;
    keyValue: string;
    terms: readonly [string, string, string];
    authorized: string;
    revoked: string;
  };
}

export const GALLERY_COPY: Record<BrandId, GalleryCopy> = {
  solace: {
    tone: "BIO-ORGANIC",
    tagline: "Holistic clinical sanctuary & mindful preventative care",
    diffLabel: "Organic Wellness",
    booking: {
      book: "Book consultation",
      booked: "Consultation booked",
      cancel: "Cancel appointment",
      reserve: "Instant Reserve",
      reserved: "Reserved",
      idleStatus: "No appointment booked yet.",
      reservedStatus: "Appointment held with Dr. Maya Lin. Demo only, nothing was sent.",
      cancelledStatus: "Appointment cancelled. The slot is open again.",
      nothingToCancel: "No appointment to cancel yet. Book one first.",
      alreadyReserved: "This appointment is already held for you.",
    },
    providers: "View providers",
    search: { placeholder: "Search doctors, clinics, integrative labs...", noun: "provider" },
    directory: [
      { name: "Dr. Maya Lin, DO", detail: "Family Medicine & Longevity" },
      { name: "Dr. Julian Vance", detail: "Clinical Director" },
      { name: "Dr. Mei Tanaka", detail: "Integrative Medicine" },
      { name: "Nora Ellis", detail: "Clinical Nutritionist" },
      { name: "Solace Mission Bay", detail: "Clinic and metabolic lab" },
    ],
    name: {
      label: "Full Legal Name",
      value: "Elena Rostova, MSc",
      helper: "Matches government identification records",
    },
    specialty: {
      label: "Preferred Care Specialty",
      options: [
        "Integrative & Longevity Medicine",
        "Preventative Cardiology",
        "Neurological Optimization",
        "General Family Wellness",
      ],
    },
    reminders: {
      title: "SMS Care Reminders",
      detail: "Real-time alerts for virtual intake queues",
    },
    consent: {
      label: "Agree to clinical privacy practices and encrypted records storage.",
      required: "Agree to the privacy practices to authorize your intake.",
    },
    badges: {
      success: "Accepting Patients",
      info: "Telehealth Only",
      warning: "3 slots left today",
      tags: ["TIER 1 PROVIDER", "HIPAA ENCRYPTED", "SYNC ACTIVE"],
    },
    practitioner: {
      name: "Dr. Maya Lin, DO",
      role: "Family Medicine & Longevity",
      monogram: "ML",
      rating: "4.96",
      reviews: "(142 clinical reviews)",
      slotLabel: "Earliest Opening",
      slot: "Tomorrow, 10:00 AM PST",
      mode: "Video Call",
      bio: "Dr. Lin pairs osteopathic family medicine with long-horizon prevention plans.",
      focus: "Focus: sleep, metabolic health and family care",
    },
    alert: {
      title: "Consultation Confirmed",
      detail: "Appointment secured for Oct 14th with Dr. Lin.",
    },
    progressLabel: "Health Profile Onboarding",
    empty: {
      title: "No previous lab results found",
      detail: "Connect external health providers or upload recent metabolic test panels manually.",
      upload: "Upload records",
    },
    intake: {
      eyebrow: "INTAKE PROTOCOL",
      title: "Confirm Clinical Intake",
      body: "By proceeding, you authorize Solace Integrative Health to review shared vitals and initialize your personalized longevity chart.",
      keyLabel: "ENCRYPTION PROTOCOL",
      keyValue: "AES-256 GCM",
      terms: [
        "Your care team may read the vitals you share.",
        "You can withdraw this authorization at any time.",
        "Records stay encrypted at rest and in transit.",
      ],
      authorized: "Intake authorized. Your chart would start now. Demo only, nothing was sent.",
      revoked: "Intake authorization revoked.",
    },
  },
  orbit: {
    tone: "BRUTALIST TECH",
    tagline: "Industrial telemetry, automated logistics & speed",
    diffLabel: "Industrial Acceleration",
    booking: {
      book: "Queue dispatch",
      booked: "Dispatch queued",
      cancel: "Abort dispatch",
      reserve: "Lock Slot",
      reserved: "Locked",
      idleStatus: "NO DISPATCH QUEUED.",
      reservedStatus: "Slot locked with Agent K. Vane. Demo only, nothing was sent.",
      cancelledStatus: "Dispatch aborted. The slot is back in the pool.",
      nothingToCancel: "No dispatch to abort yet. Queue one first.",
      alreadyReserved: "This slot is already locked for you.",
    },
    providers: "View hubs",
    search: { placeholder: "Search hubs, operators, freight lanes...", noun: "record" },
    directory: [
      { name: "Agent K. Vane", detail: "Automated Logistics Lead" },
      { name: "Hub 04 Rotterdam", detail: "Autonomous micro-hub" },
      { name: "Hub 11 Oakland", detail: "Autonomous micro-hub" },
      { name: "Lane EU-7", detail: "Next-day freight lane" },
      { name: "R. Osei", detail: "Field Hardware Engineer" },
    ],
    name: {
      label: "Operator Call Sign",
      value: "Marcus K.",
      helper: "Printed on every dispatch manifest",
    },
    specialty: {
      label: "Primary Freight Class",
      options: ["Modular EDC Hardware", "Tactical Soft Goods", "Raw Materials", "Field Repair Kits"],
    },
    reminders: {
      title: "SMS Dispatch Alerts",
      detail: "Real-time telemetry for every hub handoff",
    },
    consent: {
      label: "Agree to telemetry logging and encrypted manifest storage.",
      required: "Accept telemetry logging to authorize the release.",
    },
    badges: {
      success: "Hubs Online",
      info: "Autonomous Only",
      warning: "3 units left today",
      tags: ["TIER 1 CARRIER", "MANIFEST ENCRYPTED", "SYNC ACTIVE"],
    },
    practitioner: {
      name: "Agent K. Vane, SysOps",
      role: "Automated Logistics Lead",
      monogram: "KV",
      rating: "4.99",
      reviews: "(142 field audits)",
      slotLabel: "Next Dispatch Window",
      slot: "Next Cycle, 0400 UTC",
      mode: "Remote Link",
      bio: "Vane runs the autonomous hub network and signs off every high-velocity lane.",
      focus: "Focus: hub routing, freight telemetry and failover",
    },
    alert: {
      title: "Dispatch Confirmed",
      detail: "Drop 04 locked for the 0400 UTC cycle with Agent Vane.",
    },
    progressLabel: "Operator Profile Provisioning",
    empty: {
      title: "No previous manifests found",
      detail: "Connect external carriers or upload recent shipping manifests manually.",
      upload: "Upload manifest",
    },
    intake: {
      eyebrow: "RELEASE PROTOCOL",
      title: "Confirm Freight Release",
      body: "By proceeding, you authorize Orbit Supply to read shared telemetry and release your kit to the nearest autonomous hub.",
      keyLabel: "TRANSPORT PROTOCOL",
      keyValue: "TLS 1.3 / ED25519",
      terms: [
        "Hub operators may read the telemetry you share.",
        "You can abort this release at any time before pickup.",
        "Manifests stay encrypted at rest and in transit.",
      ],
      authorized: "Release authorized. Your kit would leave the hub now. Demo only, nothing was sent.",
      revoked: "Release authorization revoked.",
    },
  },
  lumen: {
    tone: "SCHOLARLY FLUID",
    tagline: "Higher inquiry, luminous discourse & academic discovery",
    diffLabel: "Scholarly Luminosity",
    booking: {
      book: "Request a seat",
      booked: "Seat requested",
      cancel: "Withdraw request",
      reserve: "Hold Seat",
      reserved: "Held",
      idleStatus: "No seminar seat requested yet.",
      reservedStatus: "Seat held with Prof. Sterling. Demo only, nothing was sent.",
      cancelledStatus: "Request withdrawn. The seat is open again.",
      nothingToCancel: "No request to withdraw yet. Request a seat first.",
      alreadyReserved: "This seat is already held for you.",
    },
    providers: "View faculty",
    search: { placeholder: "Search faculty, studios, seminars...", noun: "listing" },
    directory: [
      { name: "Prof. Julian Sterling, PhD", detail: "Chair of Cognitive Architecture" },
      { name: "Prof. Iris Okafor", detail: "Dean of Studios" },
      { name: "Systems Thinking", detail: "Socratic seminar" },
      { name: "Architectural Design", detail: "Hands-on studio" },
      { name: "Capstone Critique", detail: "Mentored review" },
    ],
    name: {
      label: "Fellow Name",
      value: "Amara Sen, PhD",
      helper: "Appears on your fellowship certificate",
    },
    specialty: {
      label: "Preferred Fellowship Track",
      options: [
        "Cognitive Architecture",
        "Systems Thinking",
        "Architectural Design",
        "Pedagogy & Mentorship",
      ],
    },
    reminders: {
      title: "SMS Seminar Reminders",
      detail: "Real-time notes before every colloquium",
    },
    consent: {
      label: "Agree to the academic honor code and private transcript storage.",
      required: "Agree to the honor code to authorize your enrollment.",
    },
    badges: {
      success: "Admissions Open",
      info: "Hybrid Cohort",
      warning: "3 seats left today",
      tags: ["TIER 1 FACULTY", "TRANSCRIPT SEALED", "SYNC ACTIVE"],
    },
    practitioner: {
      name: "Prof. Julian Sterling, PhD",
      role: "Chair of Cognitive Architecture",
      monogram: "JS",
      rating: "4.98",
      reviews: "(142 fellow reviews)",
      slotLabel: "Next Colloquium",
      slot: "Mon Colloquium, 2:15 PM",
      mode: "Seminar",
      bio: "Sterling leads the colloquium series and mentors each capstone in person.",
      focus: "Focus: cognition, systems and critique",
    },
    alert: {
      title: "Seat Confirmed",
      detail: "Your seat is secured for Monday with Prof. Sterling.",
    },
    progressLabel: "Fellowship Application",
    empty: {
      title: "No previous transcripts found",
      detail: "Connect other institutions or upload recent transcripts manually.",
      upload: "Upload transcript",
    },
    intake: {
      eyebrow: "ADMISSIONS PROTOCOL",
      title: "Confirm Fellowship Enrollment",
      body: "By proceeding, you authorize Lumen Academy to review shared transcripts and open your personal fellowship dossier.",
      keyLabel: "RECORD PROTOCOL",
      keyValue: "SEALED DOSSIER",
      terms: [
        "The admissions team may read the transcripts you share.",
        "You can withdraw this enrollment at any time.",
        "Dossiers stay private to the academy.",
      ],
      authorized: "Enrollment authorized. Your dossier would open now. Demo only, nothing was sent.",
      revoked: "Enrollment authorization revoked.",
    },
  },
};
