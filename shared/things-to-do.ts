export type AtlantaActivity = {
  name: string;
  category: string;
  description: string;
  url: string;
};

export type AtlantaRestaurantGroup = {
  name: string;
  restaurants: readonly string[];
};

export const atlantaActivities: readonly AtlantaActivity[] = [
  {
    name: "Georgia Aquarium",
    category: "3–4 hours",
    description:
      "Purchase a ticket online to reserve a time slot in advance. Go during the week if you can to avoid the crowds!",
    url: "https://www.georgiaaquarium.org/",
  },
  {
    name: "Atlanta Botanical Garden",
    category: "3–4 hours",
    description:
      "Purchase a ticket online to reserve a time slot in advance. Tulips and daffodils will be in season!",
    url: "https://atlantabg.org/",
  },
  {
    name: "World of Coca-Cola",
    category: "2 hours",
    description:
      "Purchase a ticket online to reserve a time slot in advance. Try the red cream soda!",
    url: "https://www.worldofcoca-cola.com/",
  },
  {
    name: "Buford Highway",
    category: "1 hour",
    description:
      "Drive 15 minutes out of the city to try the best Hispanic and Asian restaurants in the South. Our favorites are Pho Bac, Canton House, and Kamayan.",
    url: "https://discoveratlanta.com/dining/buford-highway/",
  },
  {
    name: "Beltline",
    category: "1–5 hours · depends on you!",
    description:
      "Find an entrance around Piedmont Park, Ponce City Market, or Inman Park and enjoy a stroll through the city. Inman Park's Victory Sandwich Bar has a great Jack and Coke slushie!",
    url: "https://beltline.org/visitor-information/",
  },
  {
    name: "Atlantic Station",
    category: "Shopping",
    description:
      "Show up and enjoy free parking for two hours for any last-minute shopping if you don't want to deal with the mall.",
    url: "https://atlanticstation.com/",
  },
  {
    name: "Farmer's Market",
    category: "Saturday · 9 AM–1 PM",
    description:
      "Find it at Piedmont Park on Saturdays only. We always stop by the coffee stand!",
    url: "https://piedmontpark.org/green-market/",
  },
];

export const atlantaRestaurantGroups: readonly AtlantaRestaurantGroup[] = [
  {
    name: "Bang for your buck",
    restaurants: [
      "Steamhouse Lounge",
      "Urban Hai",
      "bb.q Chicken (Korean fried chicken)",
      "Nagomiya (the ramen/sushi combos)",
      "DUA (poke bowls)",
      "Xi'an Gourmet House",
      "Establishment (happy hour)",
      "Silver Skillet",
    ],
  },
  {
    name: "Delicious with city prices",
    restaurants: [
      "Tabla",
      "E Ramen",
      "Agora",
      "Boqueria",
      "Pasta da Pulcinella",
      "26 Thai",
      "Rreal Tacos",
      "Crescent City Kitchen",
    ],
  },
  {
    name: "I want a sweet treat",
    restaurants: [
      "Cafe Intermezzo",
      "Moge Tee",
      "White Windmill",
      "Coffee: Cafe Lucia, Dancing Goats, For Five, Haraz",
    ],
  },
  {
    name: "Familiar faces",
    restaurants: ["Chipotle", "Shake Shack", "5 Guys", "Chick-fil-A", "Panera"],
  },
  {
    name: "Higher end",
    restaurants: ["The Consulate", "Rumi's Kitchen"],
  },
];
