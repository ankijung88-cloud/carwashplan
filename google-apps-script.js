/**
 * 세차 플랜 (CARWASH PLAN) - 헤더 자동인식 스마트 Google Apps Script
 * 
 * [스프레드시트 13개 컬럼 구성]
 * A: 신청ID
 * B: 신청일시
 * C: 고객명
 * D: 연락처
 * E: 이메일
 * F: 세차희망주소
 * G: 차종 및 색상  (예: 렉스턴 / 검정)
 * H: 차량번호     (예: 290루3326)
 * I: 이용플랜 및 선택옵션
 * J: 희망요일
 * K: 결제방식
 * L: 차량특이사항
 * M: 진행상태
 * 
 * [1분 설정 및 배포 방법]
 * 1. 구글 드라이브(drive.google.com)에서 세차플랜 스프레드시트를 엽니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 파일의 전체 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 오른쪽 위 파란색 [배포] > [새 배포] 클릭
 *    - 유형(톱니바퀴): [웹 앱]
 *    - 설명: 세차플랜 스마트 컬럼 자동인식 v6
 *    - 다음 사용자로 실행: 나 (내 Google 계정)
 *    - 액세스 권한: [모든 사용자 (Anyone)] ★ 반드시 선택!
 * 5. [배포] 버튼 클릭 후 승인 완료
 */

// 1. 신규 고객 신청 시 구글 시트에 자동 기록 (POST)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트에 헤더가 없으면 13개 표준 컬럼 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
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
        "진행상태"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setBackground("#0284C7");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // 전송된 JSON 데이터 파싱
    var data = JSON.parse(e.postData.contents);
    
    var model = data.model || data.car || "";
    var plate = data.plate || "";
    var color = data.color || "";
    
    // 1. 차종 및 색상 (G열): 예: 렉스턴 / 검정
    var modelAndColor = model;
    if (color) {
      modelAndColor += " / " + color;
    }
    
    // 2. 이용플랜 및 추가옵션 (I열)
    var planText = data.plan || data.experience || "퍼펙트 (월 4회 할인 특가)";
    if (data.extraOptions && data.extraOptions !== '없음' && !planText.includes(data.extraOptions)) {
      planText += " [옵션: " + data.extraOptions + "]";
    }
    
    // 3. 13개 컬럼 1:1 매칭 행 데이터
    var rowData = [
      data.id || ("CUST-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100)), // A: 신청ID
      data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm"),         // B: 신청일시
      data.name || "",                                                                              // C: 고객명
      data.phone || "",                                                                             // D: 연락처
      data.email || "",                                                                             // E: 이메일
      data.region || "",                                                                            // F: 세차희망주소
      modelAndColor,                                                                                // G: 차종 및 색상
      plate,                                                                                        // H: 차량번호 (개별 분리)
      planText,                                                                                     // I: 이용플랜 및 선택옵션
      data.days || "미지정",                                                                        // J: 희망요일
      data.paymentMethod || "카드",                                                                 // K: 결제방식
      data.specialNotes || "없음",                                                                  // L: 차량특이사항
      data.status || "PENDING"                                                                      // M: 진행상태
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "고객 데이터가 13개 컬럼(차량번호 분리)에 성공적으로 등록되었습니다.",
      id: data.id 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 관리자 페이지 실시간 조회 (GET + JSONP 지원 - 헤더 이름 기반 스마트 매핑)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var customerList = [];
    
    if (lastRow > 1) {
      var lastCol = sheet.getLastColumn();
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      
      // 헤더 인덱스 동적 탐색
      var colMap = {};
      for (var h = 0; h < headers.length; h++) {
        var hName = String(headers[h] || '').trim();
        colMap[hName] = h;
      }
      
      var findIdx = function(keywords, defaultIdx) {
        for (var k = 0; k < keywords.length; k++) {
          for (var name in colMap) {
            if (name.indexOf(keywords[k]) !== -1) return colMap[name];
          }
        }
        return defaultIdx;
      };

      var idIdx = findIdx(["신청ID", "ID"], 0);
      var dateIdx = findIdx(["일시", "시간", "날짜"], 1);
      var nameIdx = findIdx(["고객명", "성명", "이름"], 2);
      var phoneIdx = findIdx(["연락처", "전화", "휴대폰"], 3);
      var emailIdx = findIdx(["이메일", "Email"], 4);
      var regionIdx = findIdx(["주소", "장소", "지역"], 5);
      var carIdx = findIdx(["차종 및 색상", "차종및색상", "차량정보", "차종"], 6);
      var plateIdx = findIdx(["차량번호", "번호판"], 7);
      var planIdx = findIdx(["이용플랜", "플랜", "선택옵션"], 8);
      var daysIdx = findIdx(["요일"], 9);
      var payIdx = findIdx(["결제방식", "결제"], 10);
      var notesIdx = findIdx(["특이사항", "차량특이사항"], 11);
      var statusIdx = findIdx(["진행상태", "상태"], 12);
      
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0] && !r[1] && !r[2]) continue;
        
        var id = String(r[idIdx] || ("CUST-" + (i + 1)));
        var createdAt = r[dateIdx] ? (r[dateIdx] instanceof Date ? Utilities.formatDate(r[dateIdx], "Asia/Seoul", "yyyy-MM-dd HH:mm") : String(r[dateIdx])) : "";
        var name = String(r[nameIdx] || "");
        var phone = String(r[phoneIdx] || "");
        var email = String(r[emailIdx] || "");
        var region = String(r[regionIdx] || "");
        var modelColorRaw = String(r[carIdx] || "");
        var plate = plateIdx !== -1 ? String(r[plateIdx] || "") : "";
        var planText = String(r[planIdx] || "");
        var days = String(r[daysIdx] || "");
        var paymentMethod = String(r[payIdx] || "카드");
        var specialNotes = String(r[notesIdx] || "");
        var status = String(r[statusIdx] || "PENDING");
        
        var model = modelColorRaw;
        var color = "";
        
        if (modelColorRaw.includes("/")) {
          var parts = modelColorRaw.split("/");
          model = parts[0].trim();
          color = parts.slice(1).join("/").replace(/색상\s*[:：]/, '').trim();
        }
        
        // 차종/번호판/색상 분리
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
