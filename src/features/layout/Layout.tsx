import { Box, BoxProps, useColorMode } from "@chakra-ui/react";
import { ContactLink } from "features/common";
import Head from "next/head";
import { PageProps } from "pages/_app";
import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { ServerError } from "utils/errors";
import { capitalize } from "utils/string";

export interface LayoutProps extends PageProps, BoxProps {
  mainContainer?: boolean;
  pageTitle?: string;
}

export const Layout = ({
  children,
  isMobile,
  mainContainer = true,
  pageTitle,
  ...props
}: React.PropsWithChildren<LayoutProps>) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const title = `${
    pageTitle ? capitalize(pageTitle) : "Merci de patienter..."
  } – ${process.env.NEXT_PUBLIC_SHORT_URL}`;
  const main = (c: ReactNode) => (mainContainer ? <Box as="main">{c}</Box> : c);
  const page = (c: ReactNode) => <Box>{main(c)}</Box>;

  const Fallback = ({
    error,
    resetErrorBoundary,
    ...props
  }: FallbackProps & { error: ServerError }) => {
    return page(
      <>
        Une erreur est survenue, <ContactLink label="merci de nous contacter" />{" "}
        avec une description du scénario.
      </>
    );
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        <title>{title}</title>
      </Head>

      <ErrorBoundary fallbackRender={Fallback}>{page(children)}</ErrorBoundary>
    </>
  );
};
