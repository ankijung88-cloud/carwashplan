/**
 * 세차 플랜 (CARWASH PLAN) - 구글 스프레드시트 1:1 완벽 컬럼 매칭 Apps Script
 * 
 * [1분 설정 및 배포 방법]
 * 1. 구글 드라이브(drive.google.com)에서 세차플랜 스프레드시트를 엽니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 파일의 전체 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 오른쪽 위 파란색 [배포] > [새 배포] 클릭
 *    - 유형(톱니바퀴): [웹 앱]
 *    - 설명: 세차플랜 정기세차 12개 컬럼 1:1 완벽 매칭
 *    - 다음 사용자로 실행: 나 (내 Google 계정)
 *    - 액세스 권한: [모든 사용자 (Anyone)] ★ 반드시 선택!
 * 5. [배포] 버튼 클릭 후 승인 완료
 * 6. 생성된 '웹 앱 URL'을 복사하여 관리자 모달 [연동 설정]에 등록하시면 완료됩니다!
 */

// 1. 신규 고객 신청 시 구글 시트에 1:1 완벽 매칭 자동 기록 (POST)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트에 헤더가 없으면 사장님의 12개 컬럼 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "신청ID", 
        "신청일시", 
        "고객명", 
        "연락처", 
        "이메일", 
        "세차희망주소", 
        "차종 및 색상", 
        "이용플랜 및 선택옵션", 
        "희망요일", 
        "결제방식", 
        "차량특이사항", 
        "진행상태"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setBackground("#0284C7");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // 전송된 JSON 데이터 파싱
    var data = JSON.parse(e.postData.contents);
    
    // 1. 차종, 차량번호, 색상 통합 표기 (G열: 차종 및 색상)
    var model = data.model || data.car || "";
    var plate = data.plate || "";
    var color = data.color || "";
    
    var carSummary = model;
    if (plate && !carSummary.includes(plate)) {
      carSummary += " (" + plate + ")";
    }
    if (color && !carSummary.includes("색상")) {
      carSummary += " / 색상: " + color;
    }
    
    // 2. 이용플랜 및 추가옵션 통합 표기 (H열: 이용플랜 및 선택옵션)
    var planText = data.plan || data.experience || "퍼펙트 (월 4회 할인 특가)";
    if (data.extraOptions && data.extraOptions !== '없음' && !planText.includes(data.extraOptions)) {
      planText += " [옵션: " + data.extraOptions + "]";
    }
    
    // 3. 사장님 스프레드시트 12개 컬럼과 100% 1:1 완벽 일치 행 데이터
    var rowData = [
      data.id || ("CUST-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100)), // A: 신청ID
      data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm"),         // B: 신청일시
      data.name || "",                                                                              // C: 고객명
      data.phone || "",                                                                             // D: 연락처
      data.email || "",                                                                             // E: 이메일
      data.region || "",                                                                            // F: 세차희망주소
      carSummary,                                                                                   // G: 차종 및 색상 (예: 렉스턴 (290루3326) / 색상: 검정)
      planText,                                                                                     // H: 이용플랜 및 선택옵션 (예: 퍼펙트 (월 4회 할인 특가))
      data.days || "미지정",                                                                        // I: 희망요일 (예: 월요일, 목요일)
      data.paymentMethod || "카드",                                                                 // J: 결제방식 (예: 카드, 계좌이체)
      data.specialNotes || "없음",                                                                  // K: 차량특이사항 (예: 외관: 유광 | 실내: 먼지)
      data.status || "PENDING"                                                                      // L: 진행상태 (예: PENDING)
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "고객 신청 데이터가 구글 시트 12개 컬럼에 정확하게 기록되었습니다.",
      id: data.id 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 관리자 페이지 실시간 조회 (GET + JSONP 지원)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var customerList = [];
    
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
      
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0] && !r[1] && !r[2]) continue; // 빈 행 건너뜀
        
        var id = String(r[0] || ("CUST-" + (i + 1)));
        var createdAt = r[1] ? (r[1] instanceof Date ? Utilities.formatDate(r[1], "Asia/Seoul", "yyyy-MM-dd HH:mm") : String(r[1])) : "";
        var name = String(r[2] || "");
        var phone = String(r[3] || "");
        var email = String(r[4] || "");
        var region = String(r[5] || "");
        var carRaw = String(r[6] || "");
        var planText = String(r[7] || "");
        var days = String(r[8] || "");
        var paymentMethod = String(r[9] || "카드");
        var specialNotes = String(r[10] || "");
        var status = String(r[11] || "PENDING");
        
        // 차종, 번호판, 색상 분리 파싱
        var model = carRaw;
        var plate = "";
        var color = "";
        
        var plateMatch = carRaw.match(/(\d{2,3}[가-힣]\s*\d{4})/);
        if (plateMatch) plate = plateMatch[1];
        
        var colorMatch = carRaw.match(/(?:색상|컬러|Color)\s*[:：]\s*([^\/\[\],]+)/i) || carRaw.match(/\[색상:\s*([^\]]+)\]/);
        if (colorMatch) color = colorMatch[1].trim();
        
        if (plateMatch || colorMatch) {
          model = carRaw.replace(/(\d{2,3}[가-힣]\s*\d{4})/, '').replace(/[()]/g, '').replace(/\/\s*색상\s*[:：][^\/]+/g, '').replace(/\[색상:[^\]]+\]/g, '').trim();
        }
        
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
          car: carRaw,
          experience: planText,
          days: days,
          paymentMethod: paymentMethod,
          specialNotes: specialNotes,
          status: status,
          signature: "",
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
    
    // JSONP 지원 (CORS 정책 제약 완벽 우회)
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
