export type Lang = "fr" | "en" | "ar";
export type AuthErrorCode = "invalid_credentials" | "invalid_form" | "email_exists";

const CATEGORY_LABELS: Record<string, Record<Lang, string>> = {
  "auto-parts": {
    fr: "Pieces Auto",
    en: "Auto Parts",
    ar: "قطع السيارات",
  },
  electronics: {
    fr: "Electronique",
    en: "Electronics",
    ar: "إلكترونيات",
  },
  "gaming-it": {
    fr: "Gaming & IT",
    en: "Gaming & IT",
    ar: "الألعاب وتقنية المعلومات",
  },
  fashion: {
    fr: "Mode",
    en: "Fashion",
    ar: "موضة",
  },
  beauty: {
    fr: "Beaute",
    en: "Beauty",
    ar: "الجمال",
  },
  tools: {
    fr: "Outils",
    en: "Tools",
    ar: "أدوات",
  },
  health: {
    fr: "Sante",
    en: "Health",
    ar: "الصحة",
  },
  other: {
    fr: "Autre",
    en: "Other",
    ar: "اخرى",
  },
};

const AUTH_ERROR_MESSAGES: Record<Lang, Record<AuthErrorCode, string>> = {
  fr: {
    invalid_credentials: "Email ou mot de passe invalide.",
    invalid_form: "Veuillez verifier les informations du formulaire.",
    email_exists: "Cet email est deja utilise.",
  },
  en: {
    invalid_credentials: "Invalid email or password.",
    invalid_form: "Please check the submitted form fields.",
    email_exists: "This email is already registered.",
  },
  ar: {
    invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    invalid_form: "يرجى التحقق من بيانات النموذج.",
    email_exists: "هذا البريد الإلكتروني مسجل بالفعل.",
  },
};

export function normalizeLang(value?: string): Lang {
  if (value === "fr" || value === "en" || value === "ar") {
    return value;
  }

  return "fr";
}

export function withLang(path: string, lang: Lang): string {
  if (lang === "fr") {
    return path;
  }

  const [baseWithQuery, hash = ""] = path.split("#");
  const separator = baseWithQuery.includes("?") ? "&" : "?";
  const localized = `${baseWithQuery}${separator}lang=${lang}`;
  return hash ? `${localized}#${hash}` : localized;
}

export function textDir(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function getAuthErrorMessage(lang: Lang, error?: string): string | null {
  if (!error) return null;

  if (error === "invalid_credentials" || error === "invalid_form" || error === "email_exists") {
    return AUTH_ERROR_MESSAGES[lang][error];
  }

  return null;
}

export function getCategoryLabel(slug: string, lang: Lang, fallbackName?: string): string {
  return CATEGORY_LABELS[slug]?.[lang] ?? fallbackName ?? slug;
}

