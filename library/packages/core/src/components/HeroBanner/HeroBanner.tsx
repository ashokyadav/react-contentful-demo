import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";
import { Flex } from "../Layout/Layout";
import { Image } from "../Image/Image";
import s from "./HeroBanner.module.scss";

export interface HeroBannerAction {
  label: string;
  href: string;
}

export interface HeroBannerProps {
  kicker: string;
  offer: string;
  note: string;
  fine: string;
  details?: string;
  image: string;
  imageAlt: string;
  actions: HeroBannerAction[];
  onNavigate?: (href: string) => void;
  onDetails?: () => void;
  className?: string;
}

/** Split hero: offer copy and actions beside a photo. */
export function HeroBanner({
  kicker, offer, note, fine, details, image, imageAlt, actions, onNavigate, onDetails, className,
}: HeroBannerProps) {
  const open = (href: string) => {
    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };
  return (
    <section className={cx(s.hero, className)} aria-label={kicker}>
      <div className={s.copy}>
        <div className={s.inner}>
          <h1>
            <span className={s.kicker}>{kicker}</span>
            <span className={s.offer}>{offer}</span>
          </h1>
          <p className={s.note}>{note}</p>
          <Flex gap="sm" justify="center" wrap>
            {actions.map((action) => (
              <Button key={action.label} variant="secondary" className={s.action} onClick={() => open(action.href)}>
                {action.label}
              </Button>
            ))}
          </Flex>
          <p className={s.fine}>
            {fine}
            {details && (
              <button type="button" onClick={onDetails}>{details}</button>
            )}
          </p>
        </div>
      </div>
      <div className={s.photo}>
        <Image src={image} alt={imageAlt} priority fit="cover" />
      </div>
    </section>
  );
}
