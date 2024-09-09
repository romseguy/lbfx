import { Layout } from "features/layout";
import { useSession } from "hooks/useSession";
import { PageProps } from "./_app";

const IndexPage = (props: PageProps) => {
  const { data: session } = useSession();
  return (
    <Layout pageTitle="index" {...props}>
      index
    </Layout>
  );
};

export default IndexPage;
