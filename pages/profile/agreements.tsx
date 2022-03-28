import Head from "next/head";
import { Layout } from "../../components/profile/layout";
import { LayoutPage } from "../../types";
import "react-toastify/dist/ReactToastify.css";
import { AgreementList } from "../../components/lists/agreementList/agreementList";
import { Distribution, Organization } from "../../models";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/elements/spinner";
import { useAuth0, User } from "@auth0/auth0-react";
import { useAgreementsDistributions, useAvtalegiroAgreements, useOrganizations, useVippsAgreements } from "../../_queries";
import { useContext } from "react";
import { ActivityContext } from "../../components/profile/activityProvider";

const Agreements: LayoutPage = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const { setActivity } = useContext(ActivityContext);

  const {
    loading: avtaleGiroLoading,
    data: avtaleGiro,
    refreshing: avtaleGiroRefreshing,
    error: avtaleGiroError,
  } = useAvtalegiroAgreements(user as User, getAccessTokenSilently)

  const {
    loading: vippsLoading,
    data: vipps,
    refreshing: vippsRefreshing,
    error: vippsError,
  } = useVippsAgreements(user as User, getAccessTokenSilently);

  const {
    loading: organizationsLoading,
    data: organizations,
    refreshing: organizationsRefreshing,
    error: organizationsError,
  } = useOrganizations(user as User, getAccessTokenSilently);

  const kids = new Set<string>();
  if (vipps && avtaleGiro)
    [...vipps?.map(a => a.KID), ...avtaleGiro?.map(a => a.KID)].map((kid) => kids.add(kid));

  const {
    loading: distributionsLoading,
    data: distributions,
    refreshing: distributionsRefreshing,
    error: distributionsError,
  } = useAgreementsDistributions(user as User, getAccessTokenSilently, !vippsLoading && !avtaleGiroLoading, Array.from(kids))

  const loading = vippsLoading || avtaleGiroLoading || distributionsLoading || organizationsLoading
  const refreshing = avtaleGiroRefreshing || vippsRefreshing || organizationsRefreshing || distributionsRefreshing
  if (loading || !organizations || !distributions || !vipps || !avtaleGiro)
    return <><h1>Faste avtaler</h1><Spinner /></>;

  if (refreshing)
    setActivity(true)
  else
    setActivity(false)

  const distributionsMap = getDistributionMap(distributions, organizations)

  return (
    <>
      <Head>
        <title>Konduit. - Avtaler</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Faste avtaler</h1>

        <AgreementList
          title={"Aktive"}
          vipps={vipps}
          avtalegiro={avtaleGiro}
          distributions={distributionsMap}
          supplemental={"Dette er dine aktive betalingsavtaler du har med oss"}
        />
        <AgreementList
          title={"Inaktive"}
          vipps={vipps}
          avtalegiro={avtaleGiro}
          distributions={distributionsMap}
          supplemental={
            "Dette er tidligere faste betalingsavtaler du har hatt med oss, som vi ikke lenger trekker deg for"
          }
        />
      </div>
    </>
  );
};

Agreements.layout = Layout;
export default Agreements;

const getDistributionMap = (distributions: Distribution[], organizations: Organization[]) => {
  const map = new Map<string, Distribution>();
  
  for (let i = 0; i < distributions.length; i++) {
    let dist = distributions[i]
    
    console.log(dist.kid, organizations)

    let newDist = { kid: "", organizations: organizations.map(org => ({
      id: org.id,
      name: org.name,
      share: "0"
    }))}

    for (let j = 0; j < dist.organizations.length; j++) {
      let org = dist.organizations[j]
      let index = newDist.organizations.map(o => o.id).indexOf(org.id)
      console.log(index)
      newDist.organizations[index].share = org.share
    }

    map.set(dist.kid, {...newDist})
  }

  return map
}