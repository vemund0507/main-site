import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { PortableText } from "../lib/sanity";
import { getClient } from "../lib/sanity.server";
import styles from "../styles/About.module.css";
import { groq } from "next-sanity";
import { LayoutPage } from "../types";
import { Layout } from "../components/main/layout";
import { Navbar } from "../components/main/navbar";
import { PageHeader } from "../components/elements/pageheader";
import { SectionContainer } from "../components/sectionContainer";
import { footerQuery } from "../components/footer";

const About: LayoutPage<{ data: any; preview: boolean }> = ({ data, preview }) => {
  const settings = data.settings[0];

  return (
    <>
      <Head>
        <title>Konduit. - Om oss</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar logo={settings.logo} elements={settings["main_navigation"]} />

      <PageHeader title={"Om oss"}></PageHeader>

      <SectionContainer>
        <PortableText blocks={data.about[0].content}></PortableText>
        {data.people.map((role: any) => (
          <div key={role._id}>
            <h2>{role.title}</h2>
            <div className={styles.grid}>
              {role.members.map((member: any) => (
                <div key={member._id} className={styles.person}>
                  <strong>{member.name}</strong>
                  <div>{member.subrole}</div>
                  <div>{member.additional}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </SectionContainer>
    </>
  );
};

export async function getStaticProps({ preview = false }) {
  const data = await getClient(preview).fetch(fetchAboutUs);

  return {
    props: {
      preview,
      data,
    },
  };
}

const fetchAboutUs = groq`
{
  "settings": *[_type == "site_settings"] {
    logo,
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
  ${footerQuery}
  "about": *[_type == "about_us"] {
    header,
    content
  },
  "people": *[_type == "role"] {
    _id,
    title,
    "members": *[ _type == "contributor" && role._ref == ^._id ] {
      _id,
      name,
      email,
      subrole,
      additional
    }
  }[count(members) > 0]
}
`;

About.layout = Layout;
export default About;
