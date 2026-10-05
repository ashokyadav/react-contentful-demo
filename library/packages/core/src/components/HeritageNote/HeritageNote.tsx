import { Container } from "../Layout/Layout";
import s from "./HeritageNote.module.scss";

export interface HeritageNoteProps {
  mark: string;
  text: string;
}

/** A short closing statement under the store name. */
export function HeritageNote({ mark, text }: HeritageNoteProps) {
  return (
    <section id="heritage" className={s.heritage} aria-labelledby="heritage-heading">
      <Container size="md">
        <p className={s.mark}>{mark}</p>
        <h2 id="heritage-heading" className="visually-hidden">{mark}</h2>
        <p>{text}</p>
      </Container>
    </section>
  );
}
