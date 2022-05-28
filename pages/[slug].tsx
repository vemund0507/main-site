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
import { PortableText } from "../lib/sanity";

const Faq: LayoutPage<{ data: any, preview: boolean }>  = ({ data, preview }) => {
  const router = useRouter()

  const header = data.page[0].header
  const content = data.page[0].content

  return (
    <>
      <Head>
        <title>Konduit. - {header.title}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar elements={data.settings[0]["main_navigation"]} />

      <PageHeader title={header.title} inngress={header.inngress} links={header.links} />

      <SectionContainer>
        <PortableText blocks={content} />
      </SectionContainer>
    </>
  )
}

export async function getStaticProps(context: any) {
  const { slug = "" } = context.params
  const data = await getClient(false).fetch(fetchFaq, { slug })

  return {
    props: {
      preview: false,
      data,
    },
  }
}

export async function getStaticPaths() {
  const data = await getClient(false).fetch(fetchGenericPages)

  return {
    paths: data.pages.map((page: { slug: { current: string } }) => (
        { params: { slug: page.slug.current } }
    )),
    fallback: false
  };
}

const fetchGenericPages = groq`
{
  "pages": *[_type == "generic_page"] {
    slug { current }
  }
}
`

const fetchFaq = groq`
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
  "page": *[_type == "generic_page"  && slug.current == $slug] {
    header,
    content
  },
}
`

Faq.layout = Layout
export default Faq