import type { MegaMenuItem } from "./MegaMenu";

const photo = (file: string) => `/catalog/${file}`;
export const departmentMenus: MegaMenuItem[] = [
  {
    id: "men",
    label: "Men",
    href: "/clothing/men-apparel",
    columns: [
      {
        title: "Clothing",
        links: [
          { label: "All clothing", href: "/clothing/men-apparel" },
          { label: "Dress shirts", href: "/clothing/dress-shirts" },
          { label: "Sport shirts", href: "/clothing/dress-shirts" },
          { label: "Sweaters", href: "/clothing/men-apparel?category=sweaters" },
          { label: "Quarter-zips", href: "/clothing/men-apparel?category=sweaters" },
          { label: "Polos & t-shirts", href: "/clothing/men-apparel?category=polos" },
          { label: "Suits", href: "/clothing/men-apparel?category=tailored" },
          { label: "Sport coats & blazers", href: "/clothing/men-apparel?category=tailored" },
          { label: "Coats & jackets", href: "/clothing/men-apparel?category=outerwear" },
          { label: "Chinos & casual pants", href: "/clothing/men-apparel?category=pants" },
          { label: "Dress pants", href: "/clothing/men-apparel?category=pants" },
          { label: "Pajamas & robes", href: "/clothing/men-apparel" },
        ],
      },
      {
        title: "Shoes & accessories",
        links: [
          { label: "All shoes & accessories", href: "/#accessories" },
          { label: "Ties & pocket squares", href: "/#accessories" },
          { label: "Bags & leather goods", href: "/#accessories" },
          { label: "Belts", href: "/#accessories" },
          { label: "Shoes", href: "/#accessories" },
          { label: "Socks", href: "/#accessories" },
        ],
      },
      {
        title: "Featured shops",
        links: [
          { label: "New fall classics", href: "/clothing/men-apparel" },
          { label: "The Friday shop", href: "/clothing/dress-shirts" },
          { label: "Performance series", href: "/clothing/men-apparel" },
          { label: "Wedding & occasion", href: "/clothing/men-apparel?category=tailored" },
          { label: "Big & tall", href: "/clothing/men-apparel" },
          { label: "Made to measure", href: "/#services" },
        ],
      },
      {
        title: "Special pricing",
        links: [{ label: "25% off sitewide", href: "/#sale" }],
      },
    ],
    features: [
      { title: "Coats & jackets", href: "/#coats", imageSrc: photo("Product16.png"), imageAlt: "Olive bomber jacket" },
      { title: "Quarter-zips", href: "/#sweaters", imageSrc: photo("Product13.png"), imageAlt: "Navy polo shirt" },
    ],
  },
  {
    id: "shirts",
    label: "Shirts",
    href: "/clothing/dress-shirts",
    columns: [
      {
        title: "Shop by category",
        links: [
          { label: "Dress shirts", href: "/clothing/dress-shirts" },
          { label: "Sport shirts", href: "/clothing/dress-shirts" },
          { label: "Formal shirts", href: "/#shirts" },
          { label: "Polos & rugby shirts", href: "/#polos" },
          { label: "T-shirts", href: "/#polos" },
        ],
      },
      {
        title: "Shop by collection",
        links: [
          { label: "Friday shirts", href: "/clothing/dress-shirts" },
          { label: "Performance series", href: "/#shirts" },
          { label: "Luxury dress shirts", href: "/#shirts" },
          { label: "Oxford cloth button-down", href: "/#shirts" },
          { label: "Supima cotton", href: "/#shirts" },
          { label: "Big & tall", href: "/#shirts" },
        ],
      },
      {
        title: "Shop by type",
        links: [
          { label: "Non-iron finish", href: "/clothing/dress-shirts?pattern=solid" },
          { label: "100% cotton", href: "/clothing/dress-shirts" },
          { label: "Spread collar", href: "/clothing/dress-shirts" },
          { label: "Button-down collar", href: "/clothing/dress-shirts" },
          { label: "White shirts", href: "/clothing/dress-shirts?pattern=white" },
          { label: "Striped shirts", href: "/clothing/dress-shirts?pattern=stripes" },
          { label: "Checks & plaids", href: "/clothing/dress-shirts" },
        ],
      },
      {
        title: "Special pricing",
        links: [{ label: "3 shirts $229", href: "/clothing/dress-shirts" }],
      },
    ],
    features: [
      { title: "Sport shirts", href: "/clothing/dress-shirts", imageSrc: photo("Product13.png"), imageAlt: "Navy polo shirt" },
      { title: "Dress shirts", href: "/#shirts", imageSrc: photo("Product18.png"), imageAlt: "Blush wrap dress" },
    ],
  },
  {
    id: "suits",
    label: "Suits",
    href: "/#suits",
    columns: [
      {
        title: "Shop by collection",
        links: [
          { label: "Explorer suit separates", href: "/#suits" },
          { label: "1818 suits", href: "/#suits" },
          { label: "Seasonal suit separates", href: "/#suits" },
          { label: "All suits", href: "/#suits" },
          { label: "Blazers & sport coats", href: "/#suits" },
          { label: "Dress pants", href: "/#pants" },
          { label: "Ties & suiting accessories", href: "/#accessories" },
        ],
      },
      {
        title: "The tuxedo shop",
        links: [
          { label: "Tuxedos", href: "/#suits" },
          { label: "Formal shirts", href: "/#shirts" },
          { label: "Formal ties & accessories", href: "/#accessories" },
        ],
      },
      {
        title: "Shop by fit",
        links: [
          { label: "Classic fit", href: "/#suits" },
          { label: "Slim fit", href: "/#suits" },
          { label: "Traditional fit", href: "/#suits" },
          { label: "Big & tall", href: "/#suits" },
        ],
      },
      {
        title: "Style & occasion",
        links: [
          { label: "Wedding & occasion", href: "/#suits" },
          { label: "Double breasted", href: "/#suits" },
          { label: "Checks & plaids", href: "/#suits" },
          { label: "Made to measure", href: "/#services" },
        ],
      },
    ],
    features: [
      { title: "Fall sport coats", href: "/#suits", imageSrc: photo("Product16.png"), imageAlt: "Olive bomber jacket" },
      { title: "The suit guide", href: "/#suits", imageSrc: photo("Product11.png"), imageAlt: "Sand leather satchel" },
    ],
  },
  {
    id: "women",
    label: "Women",
    href: "/#women",
    columns: [
      {
        title: "Clothing",
        links: [
          { label: "All clothing", href: "/#women" },
          { label: "Dresses", href: "/#women" },
          { label: "Blouses & shirts", href: "/#women" },
          { label: "Sweaters", href: "/#women" },
          { label: "Suit separates", href: "/#women" },
          { label: "Blazers", href: "/#women" },
          { label: "Pants, shorts & skirts", href: "/#women" },
          { label: "Coats & jackets", href: "/#women" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Jewelry", href: "/#women" },
          { label: "Hats, scarves & wraps", href: "/#women" },
          { label: "Bags & belts", href: "/#women" },
          { label: "Shoes", href: "/#women" },
        ],
      },
      {
        title: "Featured shops",
        links: [
          { label: "New fall classics", href: "/#women" },
          { label: "Work edit", href: "/#women" },
          { label: "White shirt shop", href: "/#women" },
          { label: "Made to measure", href: "/#services" },
        ],
      },
    ],
    features: [
      { title: "Pants & skirts", href: "/#women", imageSrc: photo("Product18.png"), imageAlt: "Blush wrap dress" },
      { title: "Coats & jackets", href: "/#women", imageSrc: photo("Product16.png"), imageAlt: "Olive bomber jacket" },
    ],
  },
  {
    id: "boys",
    label: "Boys",
    href: "/#boys",
    columns: [
      {
        title: "Shop boys",
        links: [
          { label: "Shirts", href: "/#boys" },
          { label: "Sweaters", href: "/#boys" },
          { label: "Coats & jackets", href: "/#boys" },
          { label: "Suits & blazers", href: "/#boys" },
          { label: "Ties & belts", href: "/#boys" },
          { label: "Pants, shorts & swim", href: "/#boys" },
          { label: "Polos & t-shirts", href: "/#boys" },
        ],
      },
      {
        title: "Featured",
        links: [
          { label: "Two of a kind", href: "/#boys" },
          { label: "Friday shirts", href: "/clothing/dress-shirts" },
          { label: "25% off sitewide", href: "/#sale" },
        ],
      },
    ],
    features: [
      { title: "Boys' quarter-zips", href: "/#boys", imageSrc: photo("Product13.png"), imageAlt: "Navy polo shirt" },
    ],
  },
  {
    id: "sale",
    label: "Sale",
    href: "/#sale",
    columns: [
      {
        title: "Men's clearance",
        links: [
          { label: "All men's clearance", href: "/#sale" },
          { label: "Dress shirts", href: "/#sale" },
          { label: "Sport shirts", href: "/clothing/dress-shirts" },
          { label: "Suits", href: "/#sale" },
          { label: "Sport coats & blazers", href: "/#sale" },
          { label: "Coats & jackets", href: "/#sale" },
        ],
      },
      {
        title: "Women's clearance",
        links: [
          { label: "All women's clearance", href: "/#sale" },
          { label: "Dresses", href: "/#sale" },
          { label: "Blouses & shirts", href: "/#sale" },
          { label: "Sweaters", href: "/#sale" },
          { label: "Coats & jackets", href: "/#sale" },
        ],
      },
      {
        title: "Boys' clearance",
        links: [{ label: "All boys' clearance", href: "/#sale" }],
      },
    ],
    features: [
      { title: "Extra 25% off sale", href: "/#sale", imageSrc: photo("Product15.png"), imageAlt: "White and grey court sneakers" },
    ],
  },
];
