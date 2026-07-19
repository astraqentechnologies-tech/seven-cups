export interface ProductImage {
  url: string
  sort_order: number
}

export interface StaticProduct {
  id: number
  name: string
  slug: string
  description: string
  price: number
  compare_price?: number
  image_url: string
  product_images: ProductImage[]
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  category?: { name: string }
  ingredients?: string
  flavor_profile?: string
  brewing_instructions?: string
  steep_time?: string
  temperature?: string
  weight_grams?: number
  reviews?: {
    id: number
    reviewer_name: string
    rating: number
    title?: string
    body: string
  }[]
}

export const PRODUCTS: StaticProduct[] = [
  {
    id: 1,
    name: 'LiverRevive Tea',
    slug: 'liverrevive-tea',
    description:
      'Your liver works tirelessly to keep your body clean — LiverRevive Tea is crafted to give it the care it deserves. This restorative blend by Seven Cups brings together the healing power of Haritaki, Turmeric, Fennel, and Ginger with the gentle detoxifying action of Green Tea.',
    price: 272,
    compare_price: 600,
    image_url:
      'https://res.cloudinary.com/dlebmdfhr/image/upload/f_auto,q_auto/WhatsApp_Image_2026-06-15_at_22.26.03_xkv9y1',
    product_images: [
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/f_auto,q_auto/WhatsApp_Image_2026-06-15_at_22.26.03_xkv9y1',
        sort_order: 0,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781545079/ChatGPT_Image_Jun_15_2026_11_05_25_PM_z9p5n9.png',
        sort_order: 1,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781545081/ChatGPT_Image_Jun_15_2026_11_06_55_PM_nbmuqb.png',
        sort_order: 2,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781545070/ChatGPT_Image_Jun_15_2026_11_03_31_PM_rgvd4t.png',
        sort_order: 3,
      },
    ],
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    category: { name: 'Herbal Detox & Liver Wellness Tea' },
    ingredients: 'Haritaki, Turmeric, Fennel Petals, Ginger, Green Tea',
    flavor_profile: 'Earthy, warm, and mildly spiced with a hint of fennel sweetness',
    brewing_instructions:
      'Place one tea bag in your cup. Add freshly boiled water (not boiling vigorously). Steep for 3–4 minutes for best flavour and benefits. Remove the bag and enjoy without sugar or milk. Best paired with a balanced diet and an active lifestyle.',
    steep_time: '3–4 minutes',
    temperature: '90°C',
    weight_grams: 25,
    reviews: [],
  },

  {
    id: 2,
    name: 'Power Booster Tea',
    slug: 'power-booster-tea',
    description:
      'When your day demands more, reach for Power Booster Tea — a bold yet refined infusion by Seven Cups, crafted to elevate your energy and sharpen your focus naturally. Blending invigorating Green Tea with the warming power of Ginger, the golden luxury of Saffron, and the time-tested strength of Fenugreek, this luxurious brew is designed to fuel your stamina, build inner strength, and support sustained vitality — without the crash of caffeine overload. For those who pursue performance and wellness in equal measure.',
    price: 444,
    compare_price: 699,
    image_url:
      'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781551371/ChatGPT_Image_Jun_16_2026_12_50_59_AM_mawu47.png',
    product_images: [
         {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781551371/ChatGPT_Image_Jun_16_2026_12_50_59_AM_mawu47.png',
        sort_order: 0,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781552297/ChatGPT_Image_Jun_16_2026_01_03_44_AM_grrfvu.png',
        sort_order: 1,
      },
       {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781552305/ChatGPT_Image_Jun_16_2026_01_07_47_AM_ypcvde.png',
        sort_order: 2,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781552296/ChatGPT_Image_Jun_16_2026_01_05_56_AM_zrhzgo.png',
        sort_order: 3,
      },
    ],
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    category: { name: 'Energy & Vitality Wellness Tea' },
    ingredients: 'Green Tea, Ginger, Saffron, Fenugreek',
    flavor_profile: 'Bold, invigorating, and warmly spiced with a golden saffron finish',
    brewing_instructions:
      'Place one tea bag in your cup. Pour boiling water over the bag. Steep for 3–4 minutes to release the full depth of flavour. Remove the bag and enjoy as is — no sugar or milk needed. Best consumed alongside daily physical activity for optimal results.',
    steep_time: '3–4 minutes',
    temperature: '90°C',
    weight_grams: 25,
    reviews: [],
  },

  // ── Product 3 ─────────────────────────────────────────────────────────────
  {
    id: 3,
    name: 'BodyReset Blue Tea',
    slug: 'bodyreset-blue-tea',
    description:
      'Experience wellness in the most beautiful way — BodyReset Blue Tea is Seven Cups\' expression of refined purity. This enchanting infusion of Blue Pea Flower, Green Tea, and Lemongrass is not just visually stunning — it is a powerhouse of antioxidants and detoxifying botanicals that gently cleanse, rejuvenate, and restore your body\'s natural harmony. The mesmerising blue hue transforms into purple when lemon is added, making every cup a sensory experience as delightful as it is nourishing. Reset, refresh, restore.',
    price: 269,
    compare_price: 499,
    image_url:
      'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781554974/ChatGPT_Image_Jun_16_2026_01_52_29_AM_vdjlmh.png',
    product_images: [
         {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781554974/ChatGPT_Image_Jun_16_2026_01_52_29_AM_vdjlmh.png',
        sort_order: 0,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781554848/ChatGPT_Image_Jun_16_2026_01_46_02_AM_ut6hzo.png',
        sort_order: 1,
      },
       {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781554847/ChatGPT_Image_Jun_16_2026_01_47_55_AM_atdcmi.png',
        sort_order: 2,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781554846/ChatGPT_Image_Jun_16_2026_01_50_04_AM_ucjcvu.png',
        sort_order: 3,
      },
    ],
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    category: { name: 'Detox & Antioxidant Blue Tea' },
    ingredients: 'Blue Pea Flower, Green Tea, Lemongrass',
    flavor_profile: 'Light, floral, and refreshing with a stunning blue hue that turns purple with lemon',
    brewing_instructions:
      'Place one tea bag in your cup. Add boiling water and watch the water turn a stunning blue. Steep for 3–4 minutes. Optionally, add a squeeze of lemon to see it transform to purple. Enjoy without sugar or milk for the full experience.',
    steep_time: '3–4 minutes',
    temperature: '90°C',
    weight_grams: 25,
    reviews: [],
  },
  // ── Product 4 ─────────────────────────────────────────────────────────────
{
  id: 4,
  name: 'Her Divine Tea',
  slug: 'her-divine-tea',
  description:
    'Crafted with love and intention, Her Divine Tea is Seven Cups\' gentle tribute to every woman. This luxurious blend of Chamomile, Spearmint, Fennel, and Milk Thistle is thoughtfully formulated to honour feminine balance — soothing hormonal fluctuations, calming the mind, easing discomfort, and nurturing inner serenity. Whether you\'re navigating a hectic day, seeking a peaceful evening wind-down, or simply honouring your own wellbeing, Her Divine Tea is your quiet moment of self-care in every cup.',
  price: 269,
  compare_price: 499,
  image_url:
      'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781559071/ChatGPT_Image_Jun_16_2026_02_48_16_AM_em3gjr.png',
    product_images: [
         {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781559071/ChatGPT_Image_Jun_16_2026_02_48_16_AM_em3gjr.png',
        sort_order: 0,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781559109/ChatGPT_Image_Jun_16_2026_03_00_26_AM_gntdwq.png',
        sort_order: 1,
      },
       {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781559090/ChatGPT_Image_Jun_16_2026_02_56_18_AM_imsaiq.png',
        sort_order: 2,
      },
      {
        url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781559106/ChatGPT_Image_Jun_16_2026_02_58_38_AM_kixrpu.png',
        sort_order: 3,
      },],
  is_featured: true,
  is_new_arrival: true,
  is_best_seller: false,
  category: { name: "Women's Wellness & Hormonal BalanceTea" },
  ingredients: 'Chamomile, Spearmint, Fennel, Milk Thistle',
  flavor_profile: 'Soft, floral, and gently minty with a calming herbal finish',
  brewing_instructions:
    'Place one tea bag gently in your cup. Pour boiling water and let the botanicals bloom. Steep for 3–4 minutes — breathe in the calming aroma. Remove the bag and sip slowly, without sugar or milk. Best enjoyed as a morning ritual or a calming evening brew.',
  steep_time: '3–4 minutes',
  temperature: '90°C',
  weight_grams: 25,
  reviews: [],
},
{
  id: 5,
  name: 'Stress Off Tea',
  slug: 'stress-off-tea',
  description:
    'In a world that never truly switches off, Stress Off Tea offers you a moment of genuine quiet. Thoughtfully crafted by Seven Cups, this soothing blend of Lavender, Peppermint, and Lemongrass is designed to gently unwind the tension of the day, calm a busy mind, and restore quiet clarity. The floral warmth of Lavender, the cool freshness of Peppermint, and the citrusy brightness of Lemongrass come together in perfect harmony — because you deserve a moment that is entirely yours.',
  price:270,
  compare_price: 499,
  image_url:
    'https://res.cloudinary.com/pjiarotf/image/upload/v1784464412/ChatGPT_Image_Jul_19_2026_05_46_52_PM_kkrbmn.png', // replace with actual
  product_images: [
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464412/ChatGPT_Image_Jul_19_2026_05_46_52_PM_kkrbmn.png',
      sort_order: 0,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464412/ChatGPT_Image_Jul_19_2026_05_23_37_PM_wfrih8.png',
      sort_order: 1,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464410/ChatGPT_Image_Jul_19_2026_05_21_28_PM_di0fj9.png',
      sort_order: 2,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464413/ChatGPT_Image_Jul_19_2026_05_26_19_PM_vvek1a.png',
      sort_order: 3,
    },
  ],
  is_featured: true,
  is_new_arrival: true,
  is_best_seller: false,
  category: { name: 'Relaxation & Stress Relief Herbal Tea' },
  ingredients: 'Lavender, Peppermint, Lemongrass',
  flavor_profile:
    'Floral and calming with a cool minty freshness and a bright citrusy lift',
  brewing_instructions:
    'Place one tea bag in your favourite cup. Pour boiling water and inhale the calming steam — that\'s part of the ritual. Steep for 3–4 minutes. Remove the bag and enjoy slowly — no sugar, no milk, just pure calm. Ideal for evenings, post-work wind-downs, or any stressful moment.',
  steep_time: '3–4 minutes',
  temperature: '100°C',
  weight_grams: 25,
  reviews: [],
},
{
  id: 6,
  name: 'Skin & Heart Wellness Tea',
  slug: 'skin-and-heart-wellness-tea',
  description:
    'Beauty and wellbeing from within — that is the promise of Seven Cups Skin & Heart Wellness Tea. This elegant infusion blends the floral power of Hibiscus with warming Cinnamon, revitalising Ginger, soothing Liquorice, and protective Green Tea to create a blend that supports heart health while enhancing your natural skin radiance. Rich in antioxidants and heart-friendly compounds, every sip is a step towards a healthier heart and a glowing complexion — because true beauty begins within.',
  price: 270,
  compare_price: 499,
  image_url:
    'https://res.cloudinary.com/pjiarotf/image/upload/v1784464412/ChatGPT_Image_Jul_19_2026_05_43_41_PM_yquje7.png', // replace with actual
  product_images: [
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464412/ChatGPT_Image_Jul_19_2026_05_43_41_PM_yquje7.png',
      sort_order: 0,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464425/ChatGPT_Image_Jul_19_2026_05_05_08_PM_gu40c4.png',
      sort_order: 1,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464423/ChatGPT_Image_Jul_19_2026_05_03_05_PM_du5fdp.png',
      sort_order: 2,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464422/ChatGPT_Image_Jul_19_2026_05_08_01_PM_gwkixk.png',
      sort_order: 3,
    },
  ],
  is_featured: true,
  is_new_arrival: true,
  is_best_seller: false,
  category: { name: 'Cardio & Skin Health Wellness Tea' },
  ingredients: 'Hibiscus, Cinnamon, Ginger, Liquorice, Green Tea',
  flavor_profile:
    'Bold and tangy hibiscus with warm spice notes of cinnamon and ginger, softened by a smooth liquorice finish',
  brewing_instructions:
    'Place one tea bag in your cup. Add boiling water and let the Hibiscus bloom into a rich crimson. Steep for 3–4 minutes for a full-bodied, vibrant cup. Enjoy without sugar or milk to honour its natural tangy sweetness. Drink consistently as part of a balanced wellness routine.',
  steep_time: '3–4 minutes',
  temperature: '100°C',
  weight_grams: 25,
  reviews: [],
},
{
  id: 7,
  name: 'Slim Ease Tea',
  slug: 'slim-ease-tea',
  description:
    'Your wellness journey deserves a companion that works as hard as you do. Slim Ease Tea by Seven Cups is a thoughtfully composed blend crafted for clarity, lightness, and inner vitality. A sophisticated infusion of Cumin, Peppermint, Ginger, and Green Tea, it is designed to support healthy digestion and encourage your body\'s natural metabolic balance. Not a shortcut — but a beautiful, sustainable daily ritual that makes feeling lighter something you actually look forward to.',
  price: 268,
  compare_price: 499,
  image_url:
    'https://res.cloudinary.com/pjiarotf/image/upload/v1784464413/ChatGPT_Image_Jul_19_2026_05_38_04_PM_akfzyi.png', // replace with actual
  product_images: [
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464413/ChatGPT_Image_Jul_19_2026_05_38_04_PM_akfzyi.png',
      sort_order: 0,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464425/ChatGPT_Image_Jul_19_2026_02_22_31_PM_ooh9il.png',
      sort_order: 1,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464425/ChatGPT_Image_Jul_19_2026_02_25_37_PM_g2s87m.png',
      sort_order: 2,
    },
    {
      url: 'https://res.cloudinary.com/pjiarotf/image/upload/v1784464423/ChatGPT_Image_Jul_19_2026_02_28_19_PM_erjcjd.png',
      sort_order: 3,
    },
  ],
  is_featured: true,
  is_new_arrival: true,
  is_best_seller: false,
  category: { name: 'Digestive & Metabolic Wellness Tea' },
  ingredients: 'Cumin, Peppermint, Ginger, Green Tea',
  flavor_profile:
    'Earthy and warming with a cool peppermint lift and a clean, refreshing green tea finish',
  brewing_instructions:
    'Place one tea bag in your cup. Pour freshly boiled water over it. Steep for 3–4 minutes to unlock the full digestive benefits. Enjoy without sugar or milk — ideally 30 minutes before or after meals. Pair with daily movement and a balanced diet for best results.',
  steep_time: '3–4 minutes',
  temperature: '100°C',
  weight_grams: 25,
  reviews: [],
},
]