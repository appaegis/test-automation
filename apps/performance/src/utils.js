import exec from "k6/x/exec";

module.exports = {
  getAuthAndTenantID: function () {
    if (__ENV.Auth == undefined) {
      const result = exec.command(
        "dotenv",
        ["-e", "../config/.env.qa", "node", "../src/authorize.js"],
        { env: { ADMIN_PASSWORD: __ENV.ADMIN_PASSWORD } }
      );
      const obj = JSON.parse(result);
      return {
        idToken: obj.idToken,
        tenantID: obj.tenantID,
        GRAPHQL_API: `${__ENV.MMC_API_ORIGIN}/graphql`,
      };
    }
  },
  /**
   *
   * @name getCurrentDate
   * @return year-month-day
   */
  getCurrentDate: function () {
    let objectDate = new Date();
    let day = objectDate.getDate();
    let month = objectDate.getMonth();
    let year = objectDate.getFullYear();
    month = month + 1;
    if (month <= 10) {
      month = "0" + String(month);
    }
    if (day <= 10) {
      day = "0" + String(day);
    }

    return year + "." + month + "." + day;
  },
  getRandomItem: function (list) {
    if (!Array.isArray(list)) {
      throw "Please make sure the input is an array";
    }
    return list[Math.floor(Math.random() * list.length)];
  },
  generateCountryCode: function () {
    // prettier-ignore
    const countryCodes = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"]
    return countryCodes[Math.floor(Math.random() * countryCodes.length)];
  },
  generateAction: function () {
    const actions = [
      "page.paste",
      "page.copy",
      "page.print",
      "page.download",
      "page.upload",
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  },
  elasticSearchHost: "http://localhost:9200",
};
