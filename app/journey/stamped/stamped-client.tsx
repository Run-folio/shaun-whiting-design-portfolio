"use client";

import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import worldTopology from "world-atlas/countries-50m.json";
import styles from "./stamped.module.css";

type Status = "visited" | "want";
type Country = { id: string; name: string; continent: string; aliases?: string[] };
type Props = { userKey?: string; authenticated?: boolean };

const list = (value: string) => value.split("|");
const groups: Record<string, string[]> = {
  Africa: list("Algeria|Angola|Benin|Botswana|Burkina Faso|Burundi|Cabo Verde|Cameroon|Central African Republic|Chad|Comoros|Democratic Republic of the Congo|Djibouti|Egypt|Equatorial Guinea|Eritrea|Eswatini|Ethiopia|Gabon|Gambia|Ghana|Guinea|Guinea-Bissau|Ivory Coast|Kenya|Lesotho|Liberia|Libya|Madagascar|Malawi|Mali|Mauritania|Mauritius|Morocco|Mozambique|Namibia|Niger|Nigeria|Republic of the Congo|Rwanda|Sao Tome and Principe|Senegal|Seychelles|Sierra Leone|Somalia|South Africa|South Sudan|Sudan|Tanzania|Togo|Tunisia|Uganda|Zambia|Zimbabwe"),
  Americas: list("Antigua and Barbuda|Argentina|Bahamas|Barbados|Belize|Bolivia|Brazil|Canada|Chile|Colombia|Costa Rica|Cuba|Dominica|Dominican Republic|Ecuador|El Salvador|Grenada|Guatemala|Guyana|Haiti|Honduras|Jamaica|Mexico|Nicaragua|Panama|Paraguay|Peru|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Suriname|Trinidad and Tobago|United States|Uruguay|Venezuela"),
  Asia: list("Afghanistan|Armenia|Azerbaijan|Bahrain|Bangladesh|Bhutan|Brunei|Cambodia|China|Cyprus|Georgia|India|Indonesia|Iran|Iraq|Israel|Japan|Jordan|Kazakhstan|Kuwait|Kyrgyzstan|Laos|Lebanon|Malaysia|Maldives|Mongolia|Myanmar|Nepal|North Korea|Oman|Pakistan|Palestine|Philippines|Qatar|Saudi Arabia|Singapore|South Korea|Sri Lanka|Syria|Taiwan|Tajikistan|Thailand|Timor-Leste|Turkey|Turkmenistan|United Arab Emirates|Uzbekistan|Vietnam|Yemen"),
  Europe: list("Albania|Andorra|Austria|Belarus|Belgium|Bosnia and Herzegovina|Bulgaria|Croatia|Czechia|Denmark|Estonia|Finland|France|Germany|Greece|Hungary|Iceland|Ireland|Italy|Kosovo|Latvia|Liechtenstein|Lithuania|Luxembourg|Malta|Moldova|Monaco|Montenegro|Netherlands|North Macedonia|Norway|Poland|Portugal|Romania|Russia|San Marino|Serbia|Slovakia|Slovenia|Spain|Sweden|Switzerland|Ukraine|United Kingdom|Vatican City"),
  Oceania: list("Australia|Fiji|Kiribati|Marshall Islands|Micronesia|Nauru|New Zealand|Palau|Papua New Guinea|Samoa|Solomon Islands|Tonga|Tuvalu|Vanuatu"),
};
const colors: Record<string, string> = { Africa: "#f4a62a", Americas: "#68bd52", Asia: "#e65a86", Europe: "#6875d9", Oceania: "#36aeb2", Other: "#8d8a9d" };
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const curatedCountries: Country[] = Object.entries(groups).flatMap(([continent, names]) => names.map((name) => ({ id: slug(name), name, continent })));
const aliases: Record<string, string> = { "United States of America": "United States", Korea: "South Korea", "Czech Republic": "Czechia", "Czech Rep.": "Czechia", "Côte d'Ivoire": "Ivory Coast", "Cote d'Ivoire": "Ivory Coast", Swaziland: "Eswatini", eSwatini: "Eswatini", "São Tomé and Príncipe": "Sao Tome and Principe", Congo: "Republic of the Congo", "Dem. Rep. Congo": "Democratic Republic of the Congo", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "The Bahamas": "Bahamas", "The Gambia": "Gambia", "Kyrgyz Republic": "Kyrgyzstan", Macedonia: "North Macedonia", "Bosnia and Herz.": "Bosnia and Herzegovina", "Central African Rep.": "Central African Republic", "Eq. Guinea": "Equatorial Guinea", "S. Sudan": "South Sudan", "Solomon Is.": "Solomon Islands", "United Republic of Tanzania": "Tanzania", "Bolivia (Plurinational State of)": "Bolivia", "Venezuela (Bolivarian Republic of)": "Venezuela", Türkiye: "Turkey" };
const seed: Record<string, Status> = { guatemala: "visited", japan: "visited", "south-korea": "visited", taiwan: "visited", "united-states": "visited", france: "want", italy: "want", indonesia: "want", malaysia: "want", spain: "want" };
const flagCodes: Record<string, string> = { Argentina: "🇦🇷", Australia: "🇦🇺", Austria: "🇦🇹", Bahamas: "🇧🇸", Belgium: "🇧🇪", Brazil: "🇧🇷", Canada: "🇨🇦", Chile: "🇨🇱", China: "🇨🇳", Colombia: "🇨🇴", CostaRica: "🇨🇷", Croatia: "🇭🇷", Cuba: "🇨🇺", Czechia: "🇨🇿", Denmark: "🇩🇰", Ecuador: "🇪🇨", Egypt: "🇪🇬", Fiji: "🇫🇯", Finland: "🇫🇮", France: "🇫🇷", Germany: "🇩🇪", Ghana: "🇬🇭", Greece: "🇬🇷", Guatemala: "🇬🇹", Hungary: "🇭🇺", Iceland: "🇮🇸", India: "🇮🇳", Indonesia: "🇮🇩", Ireland: "🇮🇪", Israel: "🇮🇱", Italy: "🇮🇹", Jamaica: "🇯🇲", Japan: "🇯🇵", Jordan: "🇯🇴", Kenya: "🇰🇪", Laos: "🇱🇦", Malaysia: "🇲🇾", Maldives: "🇲🇻", Mexico: "🇲🇽", Morocco: "🇲🇦", Nepal: "🇳🇵", Netherlands: "🇳🇱", "New Zealand": "🇳🇿", Norway: "🇳🇴", Panama: "🇵🇦", Peru: "🇵🇪", Philippines: "🇵🇭", Poland: "🇵🇱", Portugal: "🇵🇹", Rwanda: "🇷🇼", Senegal: "🇸🇳", Singapore: "🇸🇬", "South Africa": "🇿🇦", "South Korea": "🇰🇷", Spain: "🇪🇸", SriLanka: "🇱🇰", Sweden: "🇸🇪", Switzerland: "🇨🇭", Taiwan: "🇹🇼", Tanzania: "🇹🇿", Thailand: "🇹🇭", Tunisia: "🇹🇳", Turkey: "🇹🇷", Uganda: "🇺🇬", Ukraine: "🇺🇦", "United Kingdom": "🇬🇧", "United States": "🇺🇸", Uruguay: "🇺🇾", Vietnam: "🇻🇳", Zambia: "🇿🇲", Zimbabwe: "🇿🇼" };
const flagIso: Record<string, string> = Object.fromEntries("Algeria:DZ|Angola:AO|Benin:BJ|Botswana:BW|Burkina Faso:BF|Burundi:BI|Cabo Verde:CV|Cameroon:CM|Central African Republic:CF|Chad:TD|Comoros:KM|Democratic Republic of the Congo:CD|Djibouti:DJ|Equatorial Guinea:GQ|Eritrea:ER|Eswatini:SZ|Ethiopia:ET|Gabon:GA|Gambia:GM|Guinea:GN|Guinea-Bissau:GW|Ivory Coast:CI|Lesotho:LS|Liberia:LR|Libya:LY|Madagascar:MG|Malawi:MW|Mali:ML|Mauritania:MR|Mauritius:MU|Mozambique:MZ|Namibia:NA|Niger:NE|Nigeria:NG|Republic of the Congo:CG|Seychelles:SC|Sierra Leone:SL|Somalia:SO|South Sudan:SS|Sudan:SD|Togo:TG|Zambia:ZM|Antigua and Barbuda:AG|Barbados:BB|Belize:BZ|Bolivia:BO|Dominica:DM|Dominican Republic:DO|El Salvador:SV|Grenada:GD|Guyana:GY|Haiti:HT|Honduras:HN|Nicaragua:NI|Paraguay:PY|Saint Kitts and Nevis:KN|Saint Lucia:LC|Saint Vincent and the Grenadines:VC|Suriname:SR|Trinidad and Tobago:TT|Venezuela:VE|Afghanistan:AF|Armenia:AM|Azerbaijan:AZ|Bahrain:BH|Bangladesh:BD|Bhutan:BT|Brunei:BN|Cambodia:KH|Cyprus:CY|Georgia:GE|Iran:IR|Iraq:IQ|Jordan:JO|Kazakhstan:KZ|Kuwait:KW|Kyrgyzstan:KG|Lebanon:LB|Mongolia:MN|Myanmar:MM|North Korea:KP|Oman:OM|Pakistan:PK|Palestine:PS|Qatar:QA|Saudi Arabia:SA|Sri Lanka:LK|Syria:SY|Tajikistan:TJ|Turkmenistan:TM|United Arab Emirates:AE|Uzbekistan:UZ|Yemen:YE|Albania:AL|Andorra:AD|Belarus:BY|Bosnia and Herzegovina:BA|Bulgaria:BG|Estonia:EE|Kosovo:XK|Latvia:LV|Liechtenstein:LI|Lithuania:LT|Luxembourg:LU|Malta:MT|Moldova:MD|Monaco:MC|Montenegro:ME|North Macedonia:MK|Romania:RO|Russia:RU|San Marino:SM|Serbia:RS|Slovakia:SK|Slovenia:SI|Vatican City:VA|Kiribati:KI|Marshall Islands:MH|Micronesia:FM|Nauru:NR|Palau:PW|Papua New Guinea:PG|Samoa:WS|Solomon Islands:SB|Tonga:TO|Tuvalu:TV|Vanuatu:VU".split("|").map((entry) => entry.split(":")));
const flagFor = (name: string) => { const direct = flagCodes[name.replace(/\s+/g, "")] || flagCodes[name]; if (direct) return direct; const code = flagIso[name]; return code ? [...code].map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397)).join("") : "🌐"; };

export default function StampedClient({ userKey, authenticated }: Props) {
  const isAuthenticated = authenticated ?? Boolean(userKey);
  const storageKey = `easyt-stamped-${userKey ?? "guest"}`;
  const [statuses, setStatuses] = useState<Record<string, Status>>(seed);
  const [continent, setContinent] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dbLoaded, setDbLoaded] = useState(false);
  const [savePrompt, setSavePrompt] = useState(false);
  useEffect(() => {
    let cancelled = false;
    try { const saved = window.localStorage.getItem(storageKey); if (saved) setStatuses(JSON.parse(saved)); } catch { /* use defaults */ }
    if (!isAuthenticated) {
      setDbLoaded(true);
      return () => { cancelled = true; };
    }
    fetch("/api/easyt/stamped", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!cancelled && data?.statuses) setStatuses(data.statuses); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setDbLoaded(true); });
    return () => { cancelled = true; };
  }, [storageKey, isAuthenticated]);
  useEffect(() => { if (dbLoaded) window.localStorage.setItem(storageKey, JSON.stringify(statuses)); }, [statuses, storageKey, dbLoaded]);
  const topo = useMemo(() => feature(worldTopology as never, worldTopology.objects.countries as never) as unknown as { features: any[] }, []);
  const projection = useMemo(() => geoNaturalEarth1().fitSize([1200, 610], topo as never), [topo]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const countries = useMemo(() => {
    const known = new Map(curatedCountries.map((country) => [country.name, country]));
    return topo.features
      .map((feature) => aliases[feature.properties?.name] || feature.properties?.name)
      .filter((name): name is string => Boolean(name) && name !== "Antarctica")
      .filter((name, index, names) => names.indexOf(name) === index)
      .map((name) => known.get(name) || ({ id: slug(name), name, continent: "Other" } as Country));
  }, [topo]);
  const groupNames = useMemo(() => [...Object.keys(groups), "Other"], []);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (continent === "All" ? countries : countries.filter((country) => country.continent === continent))
      .filter((country) => !query || country.name.toLowerCase().includes(query));
  }, [continent, countries, search]);
  const selectedCountry = countries.find((country) => country.id === selected);
  const selectedFeature = selectedCountry ? topo.features.find((feature) => (aliases[feature.properties?.name] || feature.properties?.name) === selectedCountry.name) : null;
  const selectedPoint = selectedFeature ? path.centroid(selectedFeature) : null;
  const [hovered, setHovered] = useState<string | null>(null);
  const setStatus = (id: string, value: Status) => {
    const nextStatus = statuses[id] === value ? null : value;
    setStatuses((current) => {
      if (nextStatus === null) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: nextStatus };
    });
    if (isAuthenticated) {
      void fetch("/api/easyt/stamped", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ countryId: id, status: nextStatus }) }).catch(() => undefined);
    } else if (nextStatus) {
      setSavePrompt(true);
    }
  };
  const visitedCount = Object.values(statuses).filter((value) => value === "visited").length;
  const calloutWidth = selectedCountry ? Math.min(440, Math.max(300, 176 + selectedCountry.name.length * 7.5)) : 300;
  const calloutHeight = selectedCountry && selectedCountry.name.length > 22 ? 136 : 112;
  const calloutX = selectedPoint ? Math.max(8, Math.min(selectedPoint[0] - calloutWidth / 2, 1200 - calloutWidth - 8)) : 8;

  return <div className={styles.shell}>
    <section className={styles.intro}><div><p className={styles.eyebrow}>EASYT · STAMPED</p><h1>Your world, marked.</h1><p>Keep a living record of where you’ve been, and the places still calling.</p></div><div className={styles.stat}><strong>{visitedCount}</strong><span>countries visited</span></div></section>
    {!isAuthenticated && savePrompt && <div className={styles.savePrompt} role="status"><div><strong>Keep your stamps</strong><span>Create a free account to save this map and use it on every device.</span></div><a href="/journey/login?mode=sign-up&next=%2Fjourney%2Fstamped">Create account</a><button type="button" onClick={() => setSavePrompt(false)} aria-label="Dismiss save prompt">Dismiss</button></div>}
    <div className={styles.workspace}>
      <section className={styles.mapPanel} aria-label="World map">
        <div className={styles.mapHeader}><span>Tap a country to update its stamp</span><div className={styles.legend}><span><i className={styles.dotVisited} />Visited</span><span><i className={styles.dotWant} />Want to visit</span></div></div>
        <svg className={styles.map} viewBox="0 0 1200 610" role="img" aria-label="Interactive world map" onClick={() => setSelected(null)}>
          {topo.features.map((feature, index) => { const name = aliases[feature.properties?.name] || feature.properties?.name; const item = countries.find((entry) => entry.name === name); const status = item ? statuses[item.id] : undefined; return <path key={feature.id || index} d={path(feature) || ""} onMouseEnter={() => item && setHovered(item.id)} onMouseLeave={() => setHovered(null)} onClick={(event) => { event.stopPropagation(); if (item) setSelected(item.id); }} className={`${styles.country} ${status === "visited" ? styles.visited : ""} ${status === "want" ? styles.want : ""} ${selected === item?.id ? styles.countrySelected : ""}`} style={status === "visited" ? { fill: colors[item?.continent || "Other"] } : undefined} />; })}
          {hovered && !selectedCountry ? (() => { const country = countries.find((entry) => entry.id === hovered); const feature = topo.features.find((entry) => (aliases[entry.properties?.name] || entry.properties?.name) === country?.name); const point = feature ? path.centroid(feature) : null; return country && point ? <foreignObject x={Math.max(8, Math.min(point[0] - 92, 980))} y={Math.max(8, Math.min(point[1] - 42, 550))} width="220" height="54" className={styles.svgLabel}><div><span>{flagFor(country.name)}</span> {country.name}<small>{statuses[country.id] === "visited" ? "Visited" : statuses[country.id] === "want" ? "Want to visit" : "Not yet"}</small></div></foreignObject> : null; })() : null}
          {selectedCountry && selectedPoint ? <foreignObject x={calloutX} y={Math.max(8, Math.min(selectedPoint[1] - calloutHeight / 2, 610 - calloutHeight - 8))} width={calloutWidth} height={calloutHeight} className={styles.svgCallout}><div className={styles.mapCallout}><div><b><span>{flagFor(selectedCountry.name)}</span> {selectedCountry.name}</b><span>{statuses[selectedCountry.id] === "visited" ? "Visited" : statuses[selectedCountry.id] === "want" ? "Want to visit" : "Unmarked"}</span></div><div className={styles.calloutActions}><button type="button" className={statuses[selectedCountry.id] === "visited" ? styles.calloutActive : ""} onClick={(event) => { event.stopPropagation(); setStatus(selectedCountry.id, "visited"); }}>Visited</button><button type="button" className={statuses[selectedCountry.id] === "want" ? styles.calloutActive : ""} onClick={(event) => { event.stopPropagation(); setStatus(selectedCountry.id, "want"); }}>Want to visit</button></div></div></foreignObject> : null}
        </svg>
      </section>
      <aside className={styles.listPanel}><div className={styles.listTop}><div><p className={styles.eyebrow}>YOUR STAMPS</p><h2>Countries</h2></div></div><label className={styles.searchBox}><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search countries" aria-label="Search countries" /></label><div className={styles.filters}><button className={continent === "All" ? styles.activeFilter : ""} onClick={() => setContinent("All")}>All</button>{groupNames.map((name) => <button key={name} className={continent === name ? styles.activeFilter : ""} onClick={() => setContinent(name)}>{name}</button>)}</div>{groupNames.filter((name) => continent === "All" || name === continent).map((name) => { const isCollapsed = collapsed[name] === true; const visible = filtered.filter((country) => country.continent === name); if (search.trim() && visible.length === 0) return null; return <section key={name} className={styles.continent}><button type="button" className={styles.continentHeader} style={{ color: colors[name] || "#555563" }} aria-expanded={!isCollapsed} onClick={() => setCollapsed((current) => ({ ...current, [name]: !current[name] }))}><b>{name}</b><span>{countries.filter((country) => country.continent === name && statuses[country.id] === "visited").length} visited <i aria-hidden="true">{isCollapsed ? "＋" : "−"}</i></span></button>{!isCollapsed && visible.map((country) => <button type="button" key={country.id} className={`${styles.row} ${selected === country.id ? styles.rowSelected : ""}`} onClick={() => setSelected(country.id)}><span className={styles.countryName}><span className={styles.flag}>{flagFor(country.name)}</span>{country.name}</span><span className={statuses[country.id] === "visited" ? styles.visitedLabel : statuses[country.id] === "want" ? styles.wantLabel : styles.unmarkedLabel}>{statuses[country.id] === "visited" ? "Visited" : statuses[country.id] === "want" ? "Want to visit" : "Not yet"}</span><span className={styles.rowActions}><span onClick={(event) => { event.stopPropagation(); setStatus(country.id, "visited"); }}>✓</span><span onClick={(event) => { event.stopPropagation(); setStatus(country.id, "want"); }}>+</span></span></button>)}</section>; })}</aside>
    </div>
  </div>;
}
