import React from "react";
import styles from "../styles/Testemonial.module.css";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { ResponsiveImage } from "./elements/responsiveimage";

export interface Testimony {
  quotee: string;
  quotee_background: string;
  quote: string;
  image: SanityImageSource;
}

export const Testimonial: React.FC<{ testimonies: Testimony[] }> = ({ testimonies }) => {
  const [currentTestimony, setCurrentTestimony] = React.useState(0);

  return (
    <section className={styles.wrapper}>
      <button
        className={`${styles.testimonial__arrow} ${styles.testimonial__arrow__backward}`}
        onClick={() => setCurrentTestimony(Math.max(0, currentTestimony - 1))}
      >
        ←
      </button>
      <div className={styles.testimonialtrack}>
        <div
          className={styles.testimonialtrackinner}
          style={{ transform: `translateX(${currentTestimony * -100}%)` }}
        >
          {testimonies.map(({ quotee, quotee_background, quote, image }) => (
            <div className={styles.testimonial} key={quotee}>
              <h4 className={styles.testemonial__quote}>“{quote}”</h4>
              <div className={styles.testemonial__image}>
                {image && <ResponsiveImage image={image} />}
              </div>
              <div className={styles.testimonial__bio}>
                <p>{quotee}</p>
                <p> &#x21b3; {quotee_background}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`${styles.testimonial__arrow} ${styles.testimonial__arrow__forward}`}
        onClick={() => setCurrentTestimony(Math.min(testimonies.length - 1, currentTestimony + 1))}
      >
        →
      </button>
    </section>
  );
};
