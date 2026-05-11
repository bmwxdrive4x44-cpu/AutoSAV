import type { Lang } from "@/lib/i18n";

export type LoginCopy = {
  title: string;
  offerMessage: string;
  email: string;
  password: string;
  submit: string;
  noAccount: string;
  signUp: string;
  emailPlaceholder: string;
};

export type RegisterCopy = {
  title: string;
  offerMessage: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  submit: string;
  hasAccount: string;
  signIn: string;
  emailPlaceholder: string;
  namePlaceholder: string;
  phonePlaceholder: string;
};

const LOGIN_COPY: Record<Lang, LoginCopy> = {
  fr: {
    title: "Connexion",
    offerMessage: "Connectez-vous pour envoyer une offre.",
    email: "Email",
    password: "Mot de passe",
    submit: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signUp: "S'inscrire",
    emailPlaceholder: "vous@exemple.com",
  },
  en: {
    title: "Sign In",
    offerMessage: "Sign in to submit an offer.",
    email: "Email",
    password: "Password",
    submit: "Sign In",
    noAccount: "No account yet?",
    signUp: "Sign Up",
    emailPlaceholder: "you@example.com",
  },
  ar: {
    title: "تسجيل الدخول",
    offerMessage: "سجل دخولك لإرسال عرض.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "دخول",
    noAccount: "ليس لديك حساب؟",
    signUp: "إنشاء حساب",
    emailPlaceholder: "you@example.com",
  },
};

const REGISTER_COPY: Record<Lang, RegisterCopy> = {
  fr: {
    title: "Inscription",
    offerMessage: "Inscrivez-vous pour participer au marketplace en tant qu'utilisateur.",
    name: "Nom complet",
    email: "Email",
    phone: "Telephone (optionnel)",
    password: "Mot de passe",
    submit: "Creer mon compte",
    hasAccount: "Deja un compte ?",
    signIn: "Se connecter",
    emailPlaceholder: "vous@exemple.com",
    namePlaceholder: "John Doe",
    phonePlaceholder: "+213 5XX XXX XXX",
  },
  en: {
    title: "Sign Up",
    offerMessage: "Sign up to join the marketplace as a user.",
    name: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    password: "Password",
    submit: "Create account",
    hasAccount: "Already have an account?",
    signIn: "Sign In",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "John Doe",
    phonePlaceholder: "+213 5XX XXX XXX",
  },
  ar: {
    title: "إنشاء حساب",
    offerMessage: "أنشئ حسابك للمشاركة في السوق كمستخدم.",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف (اختياري)",
    password: "كلمة المرور",
    submit: "إنشاء الحساب",
    hasAccount: "لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "John Doe",
    phonePlaceholder: "+213 5XX XXX XXX",
  },
};

export function getLoginCopy(lang: Lang): LoginCopy {
  return LOGIN_COPY[lang];
}

export function getRegisterCopy(lang: Lang): RegisterCopy {
  return REGISTER_COPY[lang];
}
