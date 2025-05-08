import axios, { AxiosInstance } from "axios";

class KoreaFssFinlifeServiceError extends Error {
  constructor(public readonly code: ApiResponseCode, public readonly message: string, readonly requestParams: any) {
    super(message);
  }
}

/**
 * 금융회사 권역 코드
 */
export enum FinancialGroupCode {
  은행 = "020000",
  여신전문 = "030200",
  저축은행 = "030300",
  보험 = "050000",
  금융투자 = "060000",
}

/**
 * API 응답 코드
 */
enum ApiResponseCode {
  /**
   * 정상적으로 처리되는 경우
   */
  SUCCESS = "000",
  /**
   * 등록되지 않은 인증키(auth)를 입력한 경우
   */
  INVALID_AUTH_KEY = "010",
  /**
   * 중지 처리된 인증키(auth)를 입력한 경우
   */
  SUSPENDED_AUTH_KEY = "011",
  /**
   * 삭제 처리된 인증키(auth)를 입력한 경우
   */
  DELETED_AUTH_KEY = "012",
  /**
   * 샘플 인증키(auth)를 입력한 경우
   */
  SAMPLE_AUTH_KEY = "013",
  /**
   * 일일검색 허용횟수 초과
   * 개인의 경우로, 일일허용횟수를 초과하여 사용한 경우
   */
  EXCEEDED_DAILY_SEARCH_LIMIT = "020",
  /**
   * 허용된 IP가 아닙니다.
   * 단체의 경우로, 인증키 신청시와 다른 IP를 사용한 경우
   */
  INVALID_IP = "021",
  /**
   * 요청변수값을 입력하지 않은 경우
   */
  MISSING_REQUEST_PARAMETER = "100",
  /**
   * 부적절한 요청변수값을 사용한 경우
   */
  INVALID_REQUEST_PARAMETER = "101",
  /**
   * Open API 서비스 내부 시스템 에러
   */
  SYSTEM_ERROR = "900",
}

/**
 * API 기본 응답 유형
 */
interface ApiResponse<T> {
  result: {
    err_cd: ApiResponseCode.SUCCESS;
    err_message: string;
    total_count: number;
    max_page_no: number;
    now_page_no: number;
  } & T;
}

interface FinancialCompany {
  /**
   * 공시 제출월 [YYYYMM]
   */
  dcls_month: string;
  /**
   * 금융회사코드
   */
  fin_co_no: string;
  /**
   * 금융회사명
   */
  kor_co_nm: string;
  /**
   * 공시담당자
   */
  dcls_chrg_man: string;
  /**
   * 홈페이지 주소
   */
  homp_url: string;
  /**
   * 콜센터 전화번호
   */
  cal_tel: string;
}

interface FinancialCompanyOptions {
  /**
   * 공시 제출월 [YYYYMM]
   */
  dcls_month: string;
  /**
   * 금융회사코드
   */
  fin_co_no: string;
  /**
   * 지역구분
   */
  area_cd: string;
  /**
   * 지역이름
   */
  area_nm: string;
  /**
   * 점포소재여부
   */
  exis_yn: string;
}

export class KoreaFssFinlifeService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "https://finlife.fss.or.kr/finlifeapi",
      params: {
        auth: process.env.FSS_OPEN_API_KEY,
      },
    });

    this.api.interceptors.response.use((response) => {
      if (response.data?.result?.err_cd !== ApiResponseCode.SUCCESS) {
        throw new KoreaFssFinlifeServiceError(
          response.data.result.err_cd,
          response.data.result.err_msg,
          response.config.params
        );
      }

      return response;
    });
  }

  /**
   * 금융회사 상세 API
   * @docs https://finlife.fss.or.kr/finlife/api/fncCoApi/list.do?menuNo=700051
   */
  async getFinancialCompanies({
    groupCode,
    financeCode,
    pageNo = 1,
  }: {
    /**
     * 조회하려는 금융회사가 속한 권역 코드
     */
    groupCode: FinancialGroupCode;
    /**
     * 조회하려는 금융회사 코드 또는 명
     */
    financeCode?: string;
    /**
     * 페이지 번호
     * @default 1
     */
    pageNo?: number;
  }): Promise<
    ApiResponse<{
      baseList: FinancialCompany[];
      optionList: FinancialCompanyOptions[];
    }>["result"]
  > {
    return await this.api
      .get<
        ApiResponse<{
          baseList: FinancialCompany[];
          optionList: FinancialCompanyOptions[];
        }>
      >("/companySearch.json", {
        params: {
          topFinGrpNo: groupCode,
          financeCd: financeCode,
          pageNo,
        },
      })
      .then((res) => res.data.result);
  }
}
