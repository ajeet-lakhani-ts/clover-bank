import React from "react";
import { Button, Space, notification, Spin, Modal } from "antd";
import qs from "query-string";
import {
  init,
  SearchEmbed,
  AppEmbed,
  AuthType,
  EmbedEvent,
  LogLevel
} from "@thoughtspot/visual-embed-sdk";
import { useSurveySender } from "../send-survey-modal/SendSurveyModal";

import { getDataForColumnName } from "./FeedbackAnalysis.util";
import "./FeedbackAnalysis.css";

const queryParams = qs.parse(window.location.search);
const customHost: string = queryParams.host as string;

const thoughtSpotHost = !!customHost
  ? `http://${customHost}`
  : "https://embed-1-do-not-delete.thoughtspotdev.cloud";

init({
  thoughtSpotHost,
  authType: AuthType.None,
  noRedirect: true,
  getAuthToken: async () => {
    return fetch(
      "http://ts-everywhere-auth.thoughtspot.com:5000/gettoken/tsadmin"
    ).then((r) => r.text());
  },
  username: "tsadmin",
  password: "<password>",
  logLevel: LogLevel.DEBUG,
  disablePreauthCache: false
});
window.performance .mark('init');

// init({
//   thoughtSpotHost: tsHost,
//   authType: AuthType.Basic,
//   logLevel: logLevel,
//   username,
//   password,
// }),

export const FeedbackAnalysis = () => {
  const embedRef = React.useRef(null);
  const [isEmbedLoading, setIsEmbedLoading] = React.useState(true);
  const { sendSurvey, modalJSX } = useSurveySender();

  console.log("embedRef", embedRef);

  React.useEffect(() => {
    if (embedRef !== null) {
      embedRef!.current.innerHTML = "";
    }

    performance.mark('render-start');
    const tsSearch = new AppEmbed("#tsEmbed", {
      frameParams: {
        // preAuthCache: false,
        // disablePreauthCache: true,
      },
      // showPrimaryNavbar: true,
      // hideDataSources: true,
      // dataSources: !!customHost ? [] : [""],
    });
    // const tsSearch = new SearchEmbed("#tsEmbed", {
    //   frameParams: {},
    //   hideDataSources: true,
    //   dataSources: !!customHost ? [] : [""],
    // });`

    tsSearch
      .on(EmbedEvent.Init, () => setIsEmbedLoading(true))
      .on(EmbedEvent.Load, () => {
        performance.mark('load');
        performance.measure('Init to load', 'init', 'load');
        performance.measure('render start to load', 'render-start', 'load');
        setIsEmbedLoading(false);

        const measures = performance.getEntriesByType('measure');
        measures.forEach(measure => {
          console.log(`InfoSuccess time ---> ${measure.name}: ${measure.duration} milliseconds`);
        });        

      })
      .on(EmbedEvent.CustomAction, (payload: any) => {
        const data = payload.data;
        if (data.id === "send-survey") {
          const recipients = getDataForColumnName(
            data.columnsAndData,
            "email address"
          );
          sendSurvey(recipients);
        }
      })
      .render();
  }, []);
  return (
    <div className="feedbackAnalysis">
      {isEmbedLoading ? (
        <div className="embedSpinner">
          <Spin size="large" />
        </div>
      ) : (
        ""
      )}
      <div className="tsEmbed" ref={embedRef} id="tsEmbed"></div>
      {modalJSX}
    </div>
  );
};
