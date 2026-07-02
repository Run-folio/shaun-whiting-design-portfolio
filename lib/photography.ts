export type TravelPhoto = {
  country: string;
  flag: string;
  publicId: string;
};

export const cloudinaryImage = (publicId: string) =>
  `https://res.cloudinary.com/dbt3wkwa3/image/upload/f_auto,q_auto/${publicId}`;

export const travelPhotos: TravelPhoto[] = [
  { country: "Guatemala", flag: "🇬🇹", publicId: "guatemala_jkuqfl" },
  { country: "Nepal", flag: "🇳🇵", publicId: "nepal_pieful" },
  { country: "Iceland", flag: "🇮🇸", publicId: "iceland_rmehmy" },
  { country: "Japan", flag: "🇯🇵", publicId: "japan_tyklgc" },
  { country: "Argentina", flag: "🇦🇷", publicId: "argentina_hyoz4x" },
  { country: "Namibia", flag: "🇳🇦", publicId: "namibia_vwfyeb" },
  { country: "Peru", flag: "🇵🇪", publicId: "peru_to7dtv" },
  { country: "Switzerland", flag: "🇨🇭", publicId: "switzerland_qyppa0" },
  { country: "Australia", flag: "🇦🇺", publicId: "australia_simevv" },
  { country: "Belgium", flag: "🇧🇪", publicId: "belgium_hlh95b" },
  { country: "Bolivia", flag: "🇧🇴", publicId: "bolivia_tn5l1g" },
  { country: "China", flag: "🇨🇳", publicId: "china_vkvmrm" },
  { country: "Georgia", flag: "🇬🇪", publicId: "georgia_nmikjp" },
  { country: "New Zealand", flag: "🇳🇿", publicId: "newzealand_rrwx41" },
  { country: "Turkey", flag: "🇹🇷", publicId: "turkey_axzqlq" },
  { country: "Vietnam", flag: "🇻🇳", publicId: "vietnam_jx1wqg" },
];

export const featuredTravelPhotos = travelPhotos.slice(0, 9);
