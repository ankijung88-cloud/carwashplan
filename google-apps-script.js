/**
 * 세차 플랜 (CARWASH PLAN) - 고객 자필 전자서명 클라우드 동기화 Google Apps Script
 * 
 * [스프레드시트 14개 컬럼 구성]
 * A: 신청ID
 * B: 신청일시
 * C: 고객명
 * D: 연락처
 * E: 이메일
 * F: 세차희망주소
 * G: 차종 및 색상      (예: 렉스턴 / 검정)
 * H: 차량번호         (예: 290루3326)
 * I: 이용플랜 및 선택옵션 (예: 퍼펙트 (월 4회 할인 특가))
 * J: 희망요일         (예: 화요일)
 * K: 결제방식         (예: 카드)
 * L: 차량특이사항      (예: 외관: 유광 | 실내: 먼지)
 * M: 진행상태         (예: PENDING)
 * N: 서명데이터        (고객 자필 전자서명 Base64 이미지)
 * 
 * [1분 설정 및 배포 방법]
 * 1. 구글 드라이브(drive.google.com)에서 세차플랜 스프레드시트를 엽니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 파일의 전체 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 오른쪽 위 파란색 [배포] > [새 배포] 클릭
 *    - 유형(톱니바퀴): [웹 앱]
 *    - 설명: 전자서명 클라우드 동기화 지원 v9
 *    - 다음 사용자로 실행: 나 (내 Google 계정)
 *    - 액세스 권한: [모든 사용자 (Anyone)] ★ 반드시 선택!
 * 5. [배포] 버튼 클릭 후 승인 완료
 */

var STANDARD_HEADERS = [
  "신청ID", 
  "신청일시", 
  "고객명", 
  "연락처", 
  "이메일", 
  "세차희망주소", 
  "차종 및 색상", 
  "차량번호",
  "이용플랜 및 선택옵션", 
  "희망요일", 
  "결제방식", 
  "차량특이사항", 
  "진행상태",
  "서명데이터"
];

function ensureStandardHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  var needUpdate = false;
  
  if (lastCol < 13) {
    needUpdate = true;
  } else {
    var curH = sheet.getRange(1, 1, 1, Math.min(lastCol, 14)).getValues()[0];
    if (String(curH[7] || '').trim() !== "차량번호") {
      needUpdate = true;
    }
  }
  
  if (needUpdate) {
    sheet.getRange(1, 1, 1, 14).setValues([STANDARD_HEADERS]);
    var headerRange = sheet.getRange(1, 1, 1, 14);
    headerRange.setBackground("#0284C7");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
}

// 1. 신규 고객 신청 시 구글 시트에 서명 데이터 포함 자동 기록 (POST)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureStandardHeaders(sheet);
    
    // 전송된 JSON 데이터 파싱
    var data = JSON.parse(e.postData.contents);
    
    var model = data.model || data.car || "";
    var plate = data.plate || "";
    var color = data.color || "";
    
    // G열: 차종 및 색상 (예: 렉스턴 / 검정)
    var modelAndColor = model;
    if (color) {
      modelAndColor += " / " + color;
    }
    
    // I열: 이용플랜 및 추가옵션
    var planText = data.plan || data.experience || "퍼펙트 (월 4회 할인 특가)";
    if (data.extraOptions && data.extraOptions !== '없음' && !planText.includes(data.extraOptions)) {
      planText += " [옵션: " + data.extraOptions + "]";
    }
    
    // 14개 컬럼과 1:1 완벽 일치 행 데이터 (N열에 서명데이터 저장)
    var rowData = [
      data.id || ("CUST-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100)), // A: 신청ID
      data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm"),         // B: 신청일시
      data.name || "",                                                                              // C: 고객명
      data.phone || "",                                                                             // D: 연락처
      data.email || "",                                                                             // E: 이메일
      data.region || "",                                                                            // F: 세차희망주소
      modelAndColor,                                                                                // G: 차종 및 색상
      plate,                                                                                        // H: 차량번호
      planText,                                                                                     // I: 이용플랜 및 선택옵션
      data.days || "미지정",                                                                        // J: 희망요일
      data.paymentMethod || "카드",                                                                 // K: 결제방식
      data.specialNotes || "없음",                                                                  // L: 차량특이사항
      data.status || "PENDING",                                                                     // M: 진행상태
      data.signature || ""                                                                          // N: 고객 전자서명 Base64
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "고객 데이터 및 전자서명이 구글 시트에 성공적으로 등록되었습니다.",
      id: data.id 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 관리자 페이지 실시간 조회 (GET + JSONP 지원 - 서명 데이터 반환)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var customerList = [];
    
    ensureStandardHeaders(sheet);
    
    if (lastRow > 1) {
      var lastCol = Math.max(sheet.getLastColumn(), 14);
      var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0] && !r[1] && !r[2]) continue;
        
        var id = String(r[0] || ("CUST-" + (i + 1)));
        var createdAt = r[1] ? (r[1] instanceof Date ? Utilities.formatDate(r[1], "Asia/Seoul", "yyyy-MM-dd HH:mm") : String(r[1])) : "";
        var name = String(r[2] || "");
        var phone = String(r[3] || "");
        var email = String(r[4] || "");
        var region = String(r[5] || "");
        var modelColorRaw = String(r[6] || "");
        var plate = String(r[7] || "");
        var planText = String(r[8] || "");
        var days = String(r[9] || "");
        var paymentMethod = String(r[10] || "카드");
        var specialNotes = String(r[11] || "");
        var status = String(r[12] || "PENDING");
        var signature = String(r[13] || ""); // N열의 서명데이터 추출
        
        var model = modelColorRaw;
        var color = "";
        
        if (modelColorRaw.includes("/")) {
          var parts = modelColorRaw.split("/");
          model = parts[0].trim();
          color = parts.slice(1).join("/").replace(/색상\s*[:：]/, '').trim();
        }
        
        var carSummary = model;
        if (plate) carSummary += " (" + plate + ")";
        if (color) carSummary += " - " + color;
        
        customerList.push({
          id: id,
          createdAt: createdAt,
          name: name,
          phone: phone,
          email: email,
          region: region,
          model: model,
          plate: plate,
          color: color,
          car: carSummary || modelColorRaw,
          experience: planText,
          days: days,
          paymentMethod: paymentMethod,
          specialNotes: specialNotes,
          status: status,
          signature: signature, // 모든 기기(웹/모바일)에 서명 데이터 제공
          termsAgreed: {
            service: true,
            privacy: true,
            financial: true,
            marketing: true,
            agreedAt: createdAt
          }
        });
      }
      
      customerList.reverse(); // 최신순 정렬
    }
    
    var responseObj = {
      result: "success",
      total: customerList.length,
      data: customerList
    };
    
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(responseObj) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(responseObj))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errorObj = {
      result: "error",
      message: error.toString(),
      data: []
    };
    
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(errorObj) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(errorObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
