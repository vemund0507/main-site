import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { getClient } from "../lib/sanity.server";
import { groq } from "next-sanity";
import { LayoutPage } from "../types";
import { Layout } from "../components/main/layout";
import { Navbar } from "../components/main/navbar";
import { PageHeader } from "../components/elements/pageheader";
import { SectionContainer } from "../components/sectionContainer";
import { Expander } from "../components/elements/expander";
import styles from "../styles/Support.module.css";
import { ContactInfo } from "../components/elements/contact-info";

const Support: LayoutPage<{ data: any; preview: boolean }> = ({ data, preview }) => {
  const router = useRouter();

  const header = data.page[0].header;
  const contactinfo = data.page[0].contact;

  return (
    <>
      <Head>
        <title>Konduit. - Support</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar elements={data.settings[0]["main_navigation"]} />

      <PageHeader title={header.title} inngress={header.inngress} links={header.links} />

      <SectionContainer>
        {data.page[0].questionandanswergroups.map((group: any) => (
          <div className={styles.grid} key={group._key}>
            <div className={styles.groupheader}>
              <h2>{group.title}</h2>
            </div>
            <div className={styles.groupanswers}>
              {group.answers.map((answer: any) => (
                <Expander
                  key={answer._key}
                  title={answer.question}
                  content={answer.answer}
                  links={answer.links}
                />
              ))}
            </div>
          </div>
        ))}
      </SectionContainer>

      <SectionContainer inverted>
        <ContactInfo
          title={contactinfo.title}
          description={contactinfo.description}
          phone={contactinfo.phone}
          email={contactinfo.email}
        ></ContactInfo>
      </SectionContainer>
    </>
  );
};

export async function getStaticProps({ preview = false }) {
  const data = await getClient(preview).fetch(fetchSupport);

  return {
    props: {
      preview,
      data,
    },
  };
}

const fetchSupport = groq`
{
  "settings": *[_type == "site_settings"] {
    main_navigation[] {
      _type == 'navgroup' => {
        _type,
        _key,
        title,
        items[]->{
          title,
          "slug": page->slug.current
        },
      },
      _type != 'navgroup' => @ {
        _type,
        _key,
        title,
        "slug": page->slug.current
      },
    }
  },
  "page": *[_type == "support"] {
    header,
    questionandanswergroups,
    contact->
  },
}
`;

Support.layout = Layout;
export default Support;
