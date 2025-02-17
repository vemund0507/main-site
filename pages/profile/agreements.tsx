import Head from "next/head";
import { Layout } from "../../components/profile/layout/layout";
import { LayoutPage } from "../../types";
import "react-toastify/dist/ReactToastify.css";
import { AgreementList } from "../../components/profile/shared/lists/agreementList/AgreementList";
import { AvtaleGiroAgreement, Distribution, Organization, VippsAgreement } from "../../models";
import { useAuth0, User } from "@auth0/auth0-react";
import {
  useAgreementsDistributions,
  useAvtalegiroAgreements,
  useOrganizations,
  useVippsAgreements,
} from "../../_queries";
import { useContext, useState } from "react";
import { ActivityContext } from "../../components/profile/layout/activityProvider";
import { InfoBox } from "../../components/shared/components/Infobox/Infobox";
import { Clock } from "react-feather";
import AgreementsMenu from "../../components/profile/agreements/AgreementsMenu/AgreementsMenu";
import styles from "../../styles/Agreements.module.css";
import { PageContent } from "../../components/profile/layout/PageContent/PageContent";
import { getClient } from "../../lib/sanity.server";
import { groq } from "next-sanity";
import { Navbar } from "../../components/profile/layout/navbar";
import { Spinner } from "../../components/shared/components/Spinner/Spinner";
import { footerQuery } from "../../components/shared/layout/Footer/Footer";
import { MainHeader } from "../../components/shared/layout/Header/Header";

const Agreements: LayoutPage<{ data: any; preview: boolean }> = ({ data, preview }) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const { setActivity } = useContext(ActivityContext);
  const [selected, setSelected] = useState<"Aktive avtaler" | "Inaktive avtaler">("Aktive avtaler");
  const settings = data.result.settings[0];

  const {
    loading: avtaleGiroLoading,
    data: avtaleGiro,
    isValidating: avtaleGiroRefreshing,
    error: avtaleGiroError,
  } = useAvtalegiroAgreements(user as User, getAccessTokenSilently);

  const {
    loading: vippsLoading,
    data: vipps,
    isValidating: vippsRefreshing,
    error: vippsError,
  } = useVippsAgreements(user as User, getAccessTokenSilently);

  const {
    loading: organizationsLoading,
    data: organizations,
    isValidating: organizationsRefreshing,
    error: organizationsError,
  } = useOrganizations(user as User, getAccessTokenSilently);

  const kids = new Set<string>();
  if (vipps && avtaleGiro)
    [
      ...vipps?.map((a: VippsAgreement) => a.KID),
      ...avtaleGiro?.map((a: AvtaleGiroAgreement) => a.KID),
    ].map((kid) => kids.add(kid));

  const {
    loading: distributionsLoading,
    data: distributions,
    isValidating: distributionsRefreshing,
    error: distributionsError,
  } = useAgreementsDistributions(
    user as User,
    getAccessTokenSilently,
    !vippsLoading && !avtaleGiroLoading,
    Array.from(kids),
  );

  const loading = vippsLoading || avtaleGiroLoading || distributionsLoading || organizationsLoading;

  const refreshing =
    avtaleGiroRefreshing || vippsRefreshing || organizationsRefreshing || distributionsRefreshing;

  if (loading || !organizations || !distributions || !vipps || !avtaleGiro)
    return (
      <>
        <PageContent>
          <h3>Faste avtaler</h3>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spinner />
          </div>
        </PageContent>
      </>
    );

  if (refreshing) setActivity(true);
  else setActivity(false);

  const distributionsMap = getDistributionMap(distributions, organizations);

  const vippsPending = vipps.filter((agreement: VippsAgreement) => agreement.status === "PENDING");
  const avtalegiroPending = avtaleGiro.filter(
    (agreement: AvtaleGiroAgreement) => agreement.active === 0 && agreement.cancelled === null,
  );
  const pendingCount = vippsPending.length + avtalegiroPending.length;
  return (
    <>
      <Head>
        <title>Konduit. - Avtaler</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MainHeader hideOnScroll={false}>
        <Navbar logo={settings.logo} />
        <AgreementsMenu
          selected={selected}
          onChange={(selected) => setSelected(selected)}
        ></AgreementsMenu>
      </MainHeader>

      <PageContent>
        <div className={styles.container}>
          <h3 className={styles.header}>Faste avtaler</h3>

          {pendingCount >= 1 ? (
            <InfoBox>
              <header>
                <Clock size={24} color={"black"} />
                {pendingCount} {pendingCount === 1 ? "avtale" : "avtaler"} bekreftes
              </header>
              <p>
                Vi har registrert {pendingCount} {pendingCount === 1 ? "ny" : "nye"} avtaler på deg.
                Bankene bruker noen dager på å bekrefte opprettelse før avtalen din blir aktivert.
              </p>
            </InfoBox>
          ) : null}

          {window.innerWidth > 1180 || selected === "Aktive avtaler" ? (
            <AgreementList
              title={"Aktive"}
              vipps={vipps.filter((agreement: VippsAgreement) => agreement.status === "ACTIVE")}
              avtalegiro={avtaleGiro.filter(
                (agreement: AvtaleGiroAgreement) => agreement.active === 1,
              )}
              distributions={distributionsMap}
              supplemental={"Dette er dine aktive betalingsavtaler du har med oss"}
            />
          ) : null}

          {window.innerWidth > 1180 || selected === "Inaktive avtaler" ? (
            <AgreementList
              title={"Inaktive"}
              vipps={vipps.filter((agreement: VippsAgreement) => agreement.status !== "ACTIVE")}
              avtalegiro={avtaleGiro.filter(
                (agreement: AvtaleGiroAgreement) => agreement.cancelled !== null,
              )}
              distributions={distributionsMap}
              supplemental={
                "Dette er tidligere faste betalingsavtaler du har hatt med oss, som vi ikke lenger trekker deg for"
              }
              expandable={false}
            />
          ) : null}
        </div>
      </PageContent>
    </>
  );
};

export async function getStaticProps({ preview = false }) {
  const result = await getClient(preview).fetch(fetchProfilePage);

  return {
    props: {
      preview: preview,
      data: {
        result: result,
        query: fetchProfilePage,
        queryParams: {},
      },
    },
  };
}

const fetchProfilePage = groq`
{
  "settings": *[_type == "site_settings"] {
    logo,
  },
  ${footerQuery}
}
`;

Agreements.layout = Layout;
export default Agreements;

const getDistributionMap = (distributions: Distribution[], organizations: Organization[]) => {
  const map = new Map<string, Distribution>();

  for (let i = 0; i < distributions.length; i++) {
    let dist = distributions[i];

    let newDist = {
      kid: "",
      organizations: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        share: "0",
      })),
    };

    for (let j = 0; j < dist.organizations.length; j++) {
      let org = dist.organizations[j];
      let index = newDist.organizations.map((o) => o.id).indexOf(org.id);
      newDist.organizations[index].share = org.share;
    }

    map.set(dist.kid, { ...newDist });
  }

  return map;
};
