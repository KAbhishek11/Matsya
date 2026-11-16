import credits from './credits.json'

export type Depth = 'surface' | 'mid' | 'bottom'

export const DEPTH_LABEL: Record<Depth, string> = {
  surface: 'Swims near the surface',
  mid: 'Swims in mid-water',
  bottom: 'Lives near the bottom',
}

// One entry per species. Source: Wikipedia "List of Indian state fishes" (Nov 2026).
export interface Fish {
  id: string
  name: string
  localName: string
  scientific: string
  states: string[]
  fact: string
  /** Which way the head points in the photo, so swimming fish can be flipped correctly. */
  faces: 'left' | 'right'
  /**
   * Where in the water column it lives, from its FishBase habitat (pelagic / benthopelagic / demersal)
   * and how Indian fish farms layer carps: rohu feeds in mid-water, calbasu on the bottom.
   */
  depth: Depth
  /** Bonus fish are much-loved Indian fish that no state has picked; they appear in Name the Fish and the tank. */
  bonus?: true
  /** Where a bonus fish is best known, shown instead of state chips. */
  famousIn?: string
  credit: { author: string; license: string; source: string; note?: string }
}

type Base = Omit<Fish, 'credit'>

const BASE: Base[] = [
  { id: 'hilsa', name: 'Hilsa', localName: 'Ilish', scientific: 'Tenualosa ilisha', states: ['wb'], faces: 'right', depth: 'surface',
    fact: 'Swims up from the sea into rivers like the Ganga to spawn. Monsoon ilish season is a festival in Bengal.' },
  { id: 'karimeen', name: 'Pearl spot', localName: 'Karimeen', scientific: 'Etroplus suratensis', states: ['kl'], faces: 'right', depth: 'bottom',
    fact: 'Kerala declared 2010–11 the "Year of the Karimeen". Karimeen pollichathu is cooked wrapped in banana leaf.' },
  { id: 'pomfret', name: 'Silver pomfret', localName: 'Paplet', scientific: 'Pampus argenteus', states: ['mh'], faces: 'left', depth: 'mid',
    fact: 'Mumbai’s favourite fry fish became Maharashtra’s state fish in 2023.' },
  { id: 'rohu', name: 'Rohu', localName: 'Rohu / Rui', scientific: 'Labeo rohita', states: ['pb'], faces: 'right', depth: 'mid',
    fact: 'One of the most farmed fish in India, and the star of many a Bengali macher jhol.' },
  { id: 'goldenMahseer', name: 'Golden mahseer', localName: 'Mahseer', scientific: 'Tor putitora', states: ['ar', 'hp', 'jk', 'ut'], faces: 'right', depth: 'mid',
    fact: 'Anglers call it the "tiger of the river". It climbs Himalayan rivers to breed, and four states claim it.' },
  { id: 'chocolateMahseer', name: 'Chocolate mahseer', localName: 'Katley / Khasaw', scientific: 'Neolissochilus hexagonolepis', states: ['ml', 'nl', 'sk'], faces: 'left', depth: 'mid',
    fact: 'Named for its coppery-brown colour. It lives in cool, clear hill streams of the Northeast.' },
  { id: 'murrel', name: 'Striped murrel', localName: 'Korramenu', scientific: 'Channa striata', states: ['ap', 'tg'], faces: 'left', depth: 'bottom',
    fact: 'It gulps air at the surface, so it survives in shallow, muddy ponds where other fish can’t.' },
  { id: 'magur', name: 'Walking catfish', localName: 'Magur', scientific: 'Clarias magur', states: ['br', 'jh'], faces: 'right', depth: 'bottom',
    fact: 'It can wriggle across wet ground from one pond to another, breathing air as it goes.' },
  { id: 'mullet', name: 'Grey mullet', localName: 'Shevtto', scientific: 'Mugil cephalus', states: ['ga'], faces: 'right', depth: 'surface',
    fact: 'Grazes on algae in estuaries, and schools of mullet often leap clean out of the water.' },
  { id: 'ghol', name: 'Blackspotted croaker', localName: 'Ghol', scientific: 'Protonibea diacanthus', states: ['gj'], faces: 'left', depth: 'bottom',
    fact: 'Its air bladder is so prized that one big ghol can sell for lakhs of rupees.' },
  { id: 'calbasu', name: 'Orangefin labeo', localName: 'Kalbasu', scientific: 'Labeo calbasu', states: ['hr'], faces: 'left', depth: 'bottom',
    fact: 'A bottom-feeding carp of north Indian rivers that grazes with its thick, fleshy lips.' },
  { id: 'carnaticCarp', name: 'Carnatic carp', localName: 'Korachi', scientific: 'Hypselobarbus carnaticus', states: ['ka'], faces: 'right', depth: 'mid',
    fact: 'Found only in the rivers of the Western Ghats, and nowhere else on Earth.' },
  { id: 'narmadaMahseer', name: 'Narmada mahseer', localName: 'Mahseer', scientific: 'Tor tor', states: ['mp'], faces: 'left', depth: 'mid',
    fact: 'A big-scaled mahseer of central Indian rivers like the Narmada, famous for its fight on a fishing line.' },
  { id: 'mahanadiMahseer', name: 'Mahanadi mahseer', localName: 'Mahseer', scientific: 'Tor mahanadicus', states: ['or'], faces: 'left', depth: 'mid',
    fact: 'Lives in the Mahanadi river system. Mahseers can live for decades and grow very large.' },
  { id: 'pengba', name: 'Pengba', localName: 'Pengba', scientific: 'Osteobrama belangeri', states: ['mn'], faces: 'left', depth: 'mid',
    fact: 'Once common in Loktak Lake, it almost vanished from the wild. Manipur now breeds it in hatcheries to bring it back.' },
  { id: 'ngahvang', name: 'Burmese kingfish', localName: 'Ngahvang', scientific: 'Semiplotus modestus', states: ['mz'], faces: 'right', depth: 'bottom',
    fact: 'A hill-stream fish of the Northeast, at home in fast, rocky rivers.' },
  { id: 'pabda', name: 'Butter catfish', localName: 'Pabda', scientific: 'Ompok bimaculatus', states: ['tr'], faces: 'right', depth: 'bottom',
    fact: 'Named for its soft, buttery flesh, it is a favourite in Tripuri and Bengali kitchens.' },
  { id: 'chital', name: 'Indian featherback', localName: 'Chital', scientific: 'Chitala chitala', states: ['up'], faces: 'left', depth: 'bottom',
    fact: 'It swims by rippling one long fin under its belly, so it can glide forwards and backwards.' },
]

// Popular Indian fish that are not a state fish. Depths follow FishBase habitat and carp-pond layering
// (catla feeds at the surface, mrigal on the bottom).
const BONUS_BASE: Base[] = [
  { id: 'catla', name: 'Catla', localName: 'Catla / Bhakur', scientific: 'Labeo catla', states: [], faces: 'right', depth: 'surface', bonus: true, famousIn: 'Bengal, Bihar, Odisha and Andhra Pradesh',
    fact: 'The surface feeder of India’s carp ponds. Its big upturned mouth skims plankton near the top while rohu and mrigal feed lower down.' },
  { id: 'mrigal', name: 'Mrigal', localName: 'Mrigal / Mirka', scientific: 'Cirrhinus mrigala', states: [], faces: 'right', depth: 'bottom', bonus: true, famousIn: 'rivers and ponds of north and east India',
    fact: 'The third of India’s “major carps”. It feeds on the pond bottom, so farmers raise it with catla and rohu without them competing for food.' },
  { id: 'bombil', name: 'Bombay duck', localName: 'Bombil', scientific: 'Harpadon nehereus', states: [], faces: 'left', depth: 'mid', bonus: true, famousIn: 'Mumbai and the Konkan coast',
    fact: 'Not a duck at all! Mumbai fries it fresh or dries it on bamboo racks in the sun.' },
  { id: 'surmai', name: 'King mackerel', localName: 'Surmai / Vanjaram', scientific: 'Scomberomorus commerson', states: [], faces: 'left', depth: 'surface', bonus: true, famousIn: 'the west coast and Tamil Nadu',
    fact: 'A fast open-sea hunter. Surmai fry and vanjaram curry are coastal favourites.' },
  { id: 'bangda', name: 'Indian mackerel', localName: 'Bangda / Ayala', scientific: 'Rastrelliger kanagurta', states: [], faces: 'left', depth: 'surface', bonus: true, famousIn: 'Karnataka, Kerala and Goa',
    fact: 'Swims in huge schools, filtering plankton with its mouth wide open. It is one of India’s most-caught sea fish.' },
  { id: 'bhetki', name: 'Barramundi', localName: 'Bhetki / Koduva', scientific: 'Lates calcarifer', states: [], faces: 'right', depth: 'bottom', bonus: true, famousIn: 'Bengal and the Sundarbans',
    fact: 'Bengal’s fish for fish fry and paturi. Every bhetki starts life as a male, and many turn female as they grow.' },
  { id: 'koi', name: 'Climbing perch', localName: 'Koi / Kawai', scientific: 'Anabas testudineus', states: [], faces: 'left', depth: 'mid', bonus: true, famousIn: 'paddy fields of Bengal, Assam and Kerala',
    fact: 'It breathes air and can shuffle across wet ground on its spiny gill covers to reach a new pond.' },
  { id: 'singhi', name: 'Stinging catfish', localName: 'Singhi', scientific: 'Heteropneustes fossilis', states: [], faces: 'left', depth: 'bottom', bonus: true, famousIn: 'Bihar, Bengal and Assam',
    fact: 'Careful! Its fin spines carry venom and the sting really hurts. It breathes air, so it survives in muddy ponds.' },
  { id: 'rani', name: 'Pink perch', localName: 'Rani / Kilimeen', scientific: 'Nemipterus japonicus', states: [], faces: 'left', depth: 'bottom', bonus: true, famousIn: 'Kerala, Karnataka and Mumbai',
    fact: 'Named for the long yellow thread trailing from its tail. A cheap, tasty fry fish all along the west coast.' },
  { id: 'tengra', name: 'Striped dwarf catfish', localName: 'Tengra', scientific: 'Mystus vittatus', states: [], faces: 'left', depth: 'bottom', bonus: true, famousIn: 'Bengal and Bihar',
    fact: 'A little striped catfish with very long whiskers. Tengra macher jhol is Bengali comfort food.' },
  { id: 'mathi', name: 'Indian oil sardine', localName: 'Mathi / Chaala', scientific: 'Sardinella longiceps', states: [], faces: 'left', depth: 'surface', bonus: true, famousIn: 'Kerala and Karnataka',
    fact: 'Kerala’s everyday fish. Huge oily schools crowd the Malabar coast when the monsoon stirs up the sea.' },
  { id: 'rawas', name: 'Indian salmon', localName: 'Rawas', scientific: 'Eleutheronema tetradactylum', states: [], faces: 'left', depth: 'mid', bonus: true, famousIn: 'Mumbai and the Gujarat coast',
    fact: 'Not a real salmon. It feels its way through muddy water with four long finger-like rays under its gills.' },
  { id: 'baam', name: 'Zig-zag eel', localName: 'Baam', scientific: 'Mastacembelus armatus', states: [], faces: 'left', depth: 'bottom', bonus: true, famousIn: 'rivers across India, especially Bengal and Assam',
    fact: 'A spiny eel, not a true eel. By day it buries itself in sand with only its pointy snout sticking out.' },
]

const withCredit = (f: Base): Fish => ({ ...f, credit: (credits as Record<string, Fish['credit']>)[f.id] })
/** The 18 official state fish. Everything about states uses this list. */
export const FISH: Fish[] = BASE.map(withCredit)
export const BONUS: Fish[] = BONUS_BASE.map(withCredit)
export const ALL_FISH: Fish[] = [...FISH, ...BONUS]
export const FISH_BY_ID: Record<string, Fish> = Object.fromEntries(ALL_FISH.map((f) => [f.id, f]))
export const fishOfState = (stateId: string) => FISH.find((f) => f.states.includes(stateId))!
export const fishSrc = (id: string) => `${import.meta.env.BASE_URL}fish/${id}.webp`
