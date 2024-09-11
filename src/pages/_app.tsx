import { unseal } from "@hapi/iron";
import "allsettled-polyfill";
import { parse } from "cookie";
import { GlobalConfig } from "features/GlobalConfig";
import { Session } from "inspector";
import "polyfill-object.fromentries";
import { ThemeProvider } from "features/ThemeProvider";
import { AppContext, AppProps as NextAppProps } from "next/app";
import NextNprogress from "nextjs-progressbar";
import { getSelectorsByUserAgent } from "react-device-detect";
import { wrapper } from "store";
import { setSession } from "store/sessionSlice";
import { setIsMobile } from "store/uiSlice";
import { setUserEmail } from "store/userSlice";
import { TOKEN_NAME, devSession, getAuthToken, sealOptions } from "utils/auth";
import { getEnv } from "utils/env";
import { isServer } from "utils/isServer";

interface AppProps {
  cookies?: string;
  pageProps: PageProps;
}

export interface PageProps {
  isMobile: boolean;
}

// workaround to invalidate user subscription query
// so there's no need to pass the email in mutation payloads
export let globalEmail: string | undefined;

const App = wrapper.withRedux(
  ({ Component, cookies, pageProps }: NextAppProps<PageProps> & AppProps) => {
    return (
      <>
        <GlobalConfig />
        <NextNprogress
          color="#29D"
          startPosition={0.3}
          stopDelayMs={200}
          height={3}
          showOnShallow
        />
        <ThemeProvider cookies={cookies}>
          {/* <ProgressBarProvider>
            <ProgressBar className="fixed h-1 shadow-lg shadow-sky-500/20 bg-sky-500 top-0" /> */}
          <Component {...pageProps} />
          {/* </ProgressBarProvider> */}
        </ThemeProvider>
      </>
    );
  }
);

App.getInitialProps = wrapper.getInitialAppProps(
  (store) =>
    async ({ Component, ctx }): Promise<AppProps> => {
      const headers = ctx.req?.headers;

      //#region browser
      let userAgent = headers?.["user-agent"];
      if (!isServer) {
        if (!userAgent) userAgent = navigator.userAgent;
      }
      //#endregion

      //#region device
      const isMobile =
        typeof userAgent === "string"
          ? getSelectorsByUserAgent(userAgent).isMobile
          : rddIsMobile;
      store.dispatch(setIsMobile(isMobile));
      //#endregion

      //#region email and session handling
      let email = ctx.query.email;
      let session: Session | undefined;

      if (devSession && getEnv() === "development") {
        // console.log("🚀 ~ App.getInitialProps ~ devSession:", devSession);
        session = devSession;
        //@ts-ignore
        email = devSession.user.email;
      }

      const cookies = headers?.cookie;
      let authToken: string | null = null;

      if (typeof cookies === "string" && cookies.includes(TOKEN_NAME)) {
        const cookie = parse(cookies);
        // console.log("🚀 ~ App.getInitialProps ~ cookie map:", cookie);
        authToken = getAuthToken(cookie);

        if (authToken) {
          // console.log("🚀 ~ App.getInitialProps ~ authToken:", authToken);
          const user = await unseal(authToken, process.env.SECRET, sealOptions);

          if (user) {
            const isAdmin =
              typeof process.env.ADMIN_EMAILS === "string"
                ? process.env.ADMIN_EMAILS.split(",").includes(user.email)
                : false;

            session = {
              user: {
                ...user,
                isAdmin
              }
            };

            email = user.email;
          }
        }
      }

      if (typeof email === "string") {
        globalEmail = email;
        store.dispatch(setUserEmail(email));
      }

      if (session) {
        store.dispatch(setSession({ ...session, [TOKEN_NAME]: authToken }));
      }
      //#endregion

      //#region page
      let pageProps: AppProps["pageProps"] = { isMobile };

      if (Component.getInitialProps)
        pageProps = {
          ...pageProps,
          ...(await Component.getInitialProps(ctx))
        };
      //#endregion

      return {
        cookies,
        pageProps
      };
    }
);

export default App;
