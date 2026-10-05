import { useState } from "react";
import { useRouter } from "next/router";
import {
  ArrivalBand,
  Button,
  Carousel,
  FeatureBand,
  HeritageNote,
  HeroBanner,
  Image,
  OfferPrompt,
  PanelGrid,
  ProductRow,
  ServiceGrid,
  type PanelGridItem,
} from "@myproject/core";
import { SiteFrame } from "../components/SiteFrame";
import { useNavigationMenu } from "../components/NavigationMenu";
import { emptyHome, getHomePage, getHomePanels, getSite, type StoreHome } from "../lib/contentstack";
import { persistScope, scopeFor, scopeFrom } from "../lib/scope";
import styles from "../styles/home.module.scss";

function go(router: ReturnType<typeof useRouter>, href: string) {
  if (href.startsWith("#")) {
    document.querySelector(href)?.scrollIntoView();
    return;
  }
  router.push(href);
}

function CategoryShortcuts() {
  const { items, label } = useNavigationMenu();
  if (!items.length) return null;
  return (
    <nav className={styles.shortcuts} aria-label={label || "Departments"}>
      <ul>
        {items.map((item) => {
          const image = item.features?.find((feature) => feature.imageSrc);
          return (
            <li key={item.id}>
              <a href={item.href}>
                {image ? <Image src={image.imageSrc} alt={image.imageAlt} fit="cover" /> : null}
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CampaignCarousel({
  home,
  panels,
  onNavigate,
  onDetails,
}: {
  home: StoreHome;
  panels: PanelGridItem[];
  onNavigate: (href: string) => void;
  onDetails: () => void;
}) {
  const slides = [
    ...(home.hero
      ? [{
          id: "campaign-hero",
          image: home.hero.image,
          alt: home.hero.imageAlt,
          kicker: home.hero.kicker,
          title: home.hero.offer,
          text: home.hero.note,
          fine: home.hero.fine,
          details: home.hero.details,
          actions: home.hero.actions,
        }]
      : []),
    ...panels.map((panel) => ({
      id: panel.id,
      image: panel.image,
      alt: panel.alt,
      kicker: "",
      title: panel.title,
      text: panel.text,
      fine: "",
      details: "",
      actions: [panel.action],
    })),
  ];
  if (!slides.length) return null;
  return (
    <Carousel label={home.hero?.kicker || slides[0].title} autoPlayInterval={6000} visibleCount={1} className={styles.campaign}>
      {slides.map((slide, index) => {
        const Heading = index === 0 ? "h1" : "h2";
        return (
          <article key={slide.id} id={slide.id} className={styles.campaignSlide}>
            <div className={styles.campaignCopy}>
              {slide.kicker ? <p className={styles.campaignKicker}>{slide.kicker}</p> : null}
              <Heading>{slide.title}</Heading>
              {slide.text ? <p>{slide.text}</p> : null}
              <div className={styles.campaignActions}>
                {slide.actions.map((action) => (
                  <Button key={action.label} variant="secondary" className={styles.campaignAction} onClick={() => onNavigate(action.href)}>
                    {action.label}
                  </Button>
                ))}
              </div>
              {slide.fine ? (
                <p className={styles.campaignFine}>
                  {slide.fine}
                  {slide.details ? <button type="button" onClick={onDetails}>{slide.details}</button> : null}
                </p>
              ) : null}
            </div>
            <div className={styles.campaignMedia}>
              <Image src={slide.image} alt={slide.alt} fit="cover" priority={index === 0} />
            </div>
          </article>
        );
      })}
    </Carousel>
  );
}

export default function HomePage({
  home,
  panels,
  carousel,
}: {
  home: StoreHome;
  panels: PanelGridItem[];
  carousel?: boolean;
}) {
  const router = useRouter();
  const [promo, setPromo] = useState(false);
  const open = (href: string) => go(router, href);

  return (
    <SiteFrame>
      <main id="main" className={carousel ? styles.example1 : undefined}>
        {carousel ? (
          <>
            <CampaignCarousel home={home} panels={panels} onNavigate={open} onDetails={() => setPromo(true)} />
            <CategoryShortcuts />
          </>
        ) : (
          <>
            {home.hero && (
              <HeroBanner {...home.hero} onNavigate={open} onDetails={() => setPromo(true)} />
            )}
            {panels.length > 0 && <PanelGrid panels={panels} onNavigate={open} />}
          </>
        )}
        {home.arrivals && <ArrivalBand {...home.arrivals} onNavigate={open} />}
        {home.feature && <FeatureBand {...home.feature} onNavigate={open} />}
        {home.products && <ProductRow {...home.products} />}
        {home.services && <ServiceGrid {...home.services} />}
        {home.heritage && <HeritageNote {...home.heritage} />}
      </main>
      {home.offer && (
        <OfferPrompt
          {...home.offer}
          open={promo}
          onOpen={() => setPromo(true)}
          onClose={() => setPromo(false)}
        />
      )}
    </SiteFrame>
  );
}

export async function getServerSideProps(ctx: Parameters<typeof scopeFrom>[0]) {
  const scope = scopeFrom(ctx);
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  persistScope(ctx, content);
  const [panels, home] = await Promise.all([
    getHomePanels(content).catch(() => [] as PanelGridItem[]),
    getHomePage(content).catch(() => emptyHome),
  ]);
  return { props: { panels, home, carousel: site.key === "example1" } };
}
