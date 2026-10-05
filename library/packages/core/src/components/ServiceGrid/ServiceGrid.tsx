import { Card } from "../Card/Card";
import { Container, Grid } from "../Layout/Layout";
import { Image } from "../Image/Image";
import s from "./ServiceGrid.module.scss";

export interface ServiceStory {
  title: string;
  text: string;
  image: string;
  alt: string;
  href: string;
}

export interface ServiceGridProps {
  id: string;
  label: string;
  stories: ServiceStory[];
}

/** A row of linked service cards. */
export function ServiceGrid({ id, label, stories }: ServiceGridProps) {
  return (
    <Container size="xl">
      <section id={id} className={s.stories} aria-label={label}>
        <Grid columns={{ base: 1, md: 3 }} gap="md">
          {stories.map((story) => (
            <Card
              key={story.title}
              className={s.card}
              href={story.href}
              title={story.title}
              media={<Image src={story.image} alt={story.alt} aspectRatio="16/10" />}
            >
              <p>{story.text}</p>
            </Card>
          ))}
        </Grid>
      </section>
    </Container>
  );
}
