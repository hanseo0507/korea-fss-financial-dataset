import dotenv from "dotenv";
import { KoreaFssFinlifeService, FinancialGroupCode } from "./services";

import { keyBy } from "lodash";

dotenv.config();

async function main() {
  const koreaFssApi = new KoreaFssFinlifeService();

  const { baseList, optionList } = await koreaFssApi.getFinancialCompanies({
    groupCode: FinancialGroupCode.은행,
    pageNo: 1,
  });

  const optionsByCompanyCode = keyBy(optionList, "fin_co_no");

  const bankList = baseList.map((bank) => ({
    ...bank,
    options: optionsByCompanyCode[bank.fin_co_no],
  }));

  console.log(bankList);
}

main();
