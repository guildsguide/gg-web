import Document, { Html, Head, Main, NextScript } from "next/document";

// Injects the Travelpayouts "Drive" tracking script into every page's <head>.
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script
            nowprocket="true"
            data-noptimize="1"
            data-cfasync="false"
            data-wpfc-render="false"
            seraph-accel-crit="1"
            data-no-defer="1"
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                    var script = document.createElement("script");
                    script.async = 1;
                    script.src = 'https://tpembars.com/NTU1MTAw.js?t=555100';
                    document.head.appendChild(script);
                })();
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
