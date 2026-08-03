export type EasyTLanguage = "en" | "es";

export const easytCopy = {
  en: {
    nav: { back: "Back", prototype: "Prototype", trips: "My trips", newTrip: "New trip", stamped: "Stamps", account: "Account", profile: "Profile", language: "Language", signOut: "Sign out" },
    account: { settings: "Account settings", profileTitle: "Your profile.", personal: "Personal details", preferences: "Preferences", name: "Name", email: "Email", saveProfile: "Save profile", languageHint: "Your language preference is used across EasyT." },
    builder: { steps: ["Where", "When", "Places", "Style"], routeFirst: "Route first", datesSetLength: "Dates set length", spendDays: "Spend your days", howFeels: "How it should feel", back: "Back", continue: "Continue", buildDraft: "Build the draft", startFrom: "Starting from", addDestination: "Add a destination", startDate: "Start date", endDate: "End date", cityAirport: "City or airport", destinationPlaceholder: "City, region or landmark" },
  },
  es: {
    nav: { back: "Atrás", prototype: "Prototipo", trips: "Mis viajes", newTrip: "Nuevo viaje", stamped: "Sellos", account: "Cuenta", profile: "Perfil", language: "Idioma", signOut: "Cerrar sesión" },
    account: { settings: "Configuración de la cuenta", profileTitle: "Tu perfil.", personal: "Datos personales", preferences: "Preferencias", name: "Nombre", email: "Correo electrónico", saveProfile: "Guardar perfil", languageHint: "Tu idioma se usa en toda la experiencia de EasyT." },
    builder: { steps: ["Dónde", "Cuándo", "Lugares", "Estilo"], routeFirst: "Primero la ruta", datesSetLength: "Las fechas definen la duración", spendDays: "Distribuye tus días", howFeels: "Cómo quieres que se sienta", back: "Atrás", continue: "Continuar", buildDraft: "Crear borrador", startFrom: "Punto de partida", addDestination: "Añadir destino", startDate: "Fecha de inicio", endDate: "Fecha de fin", cityAirport: "Ciudad o aeropuerto", destinationPlaceholder: "Ciudad, región o lugar" },
  },
} as const;

export function languageFromStorage(): EasyTLanguage {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("easyt-language") === "es" ? "es" : "en";
}
