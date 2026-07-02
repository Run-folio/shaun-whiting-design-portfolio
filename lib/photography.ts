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
  { country: "Brazil", flag: "🇧🇷", publicId: "brazil_htu4iz" },
  { country: "Cambodia", flag: "🇰🇭", publicId: "cambodia_ki9fqp" },
  { country: "Chile", flag: "🇨🇱", publicId: "chile_jsarih" },
  { country: "China", flag: "🇨🇳", publicId: "china_vkvmrm" },
  { country: "Colombia", flag: "🇨🇴", publicId: "colombia_kosli8" },
  { country: "Croatia", flag: "🇭🇷", publicId: "croatia_bqhab6" },
  { country: "Denmark", flag: "🇩🇰", publicId: "denmark_b2ksko" },
  { country: "Egypt", flag: "🇪🇬", publicId: "egypt_vxb5ov" },
  { country: "France", flag: "🇫🇷", publicId: "france_zinnfm" },
  { country: "Georgia", flag: "🇬🇪", publicId: "georgia_nmikjp" },
  { country: "Germany", flag: "🇩🇪", publicId: "germany_akuxow" },
  { country: "Greece", flag: "🇬🇷", publicId: "greece_bevz86" },
  { country: "India", flag: "🇮🇳", publicId: "india_rsgvqz" },
  { country: "Indonesia", flag: "🇮🇩", publicId: "indonesia_chgjxp" },
  { country: "Italy", flag: "🇮🇹", publicId: "italy_ddkgsg" },
  { country: "Jordan", flag: "🇯🇴", publicId: "jordan_xjsgmx" },
  { country: "Kenya", flag: "🇰🇪", publicId: "kenya_mkway2" },
  { country: "Korea", flag: "🇰🇷", publicId: "korea_yh7y7h" },
  { country: "Laos", flag: "🇱🇦", publicId: "laos_smozyv" },
  { country: "Malaysia", flag: "🇲🇾", publicId: "malaysia_hiyjxb" },
  { country: "Mexico", flag: "🇲🇽", publicId: "mexico_pen3xk" },
  { country: "Netherlands", flag: "🇳🇱", publicId: "netherlands_rkfie7" },
  { country: "New Zealand", flag: "🇳🇿", publicId: "newzealand_rrwx41" },
  { country: "Norway", flag: "🇳🇴", publicId: "norway_i15dy6" },
  { country: "Panama", flag: "🇵🇦", publicId: "panama_mruswn" },
  { country: "Portugal", flag: "🇵🇹", publicId: "portugal_n0wnut" },
  { country: "Singapore", flag: "🇸🇬", publicId: "singapore_jzbsck" },
  { country: "Slovenia", flag: "🇸🇮", publicId: "slovenia_q4rx3k" },
  { country: "Sri Lanka", flag: "🇱🇰", publicId: "srilanka_a5dbey" },
  { country: "Sweden", flag: "🇸🇪", publicId: "sweden_zbwqj9" },
  { country: "Taiwan", flag: "🇹🇼", publicId: "taiwan_ncmzsv" },
  { country: "Thailand", flag: "🇹🇭", publicId: "thailand_xe9esu" },
  { country: "Turkey", flag: "🇹🇷", publicId: "turkey_axzqlq" },
  { country: "United Kingdom", flag: "🇬🇧", publicId: "uk_m636ax" },
  { country: "United States", flag: "🇺🇸", publicId: "usa_cbkcv1" },
  { country: "Vietnam", flag: "🇻🇳", publicId: "vietnam_jx1wqg" },
];

export const featuredTravelPhotos = travelPhotos.slice(0, 9);
