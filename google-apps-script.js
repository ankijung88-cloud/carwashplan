/**
 * 세차 플랜 (CARWASH PLAN) - 고객 가입신청 전체 데이터 완벽 반영 Google Apps Script
 * 
 * [1분 설정 및 배포 방법]
 * 1. 구글 드라이브(drive.google.com)에서 세차플랜 스프레드시트를 엽니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 파일의 전체 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 오른쪽 위 파란색 [배포] > [새 배포] 클릭
 *    - 유형(톱니바퀴): [웹 앱]
 *    - 설명: 세차플랜 전체 신청 데이터 동기화
 *    - 다음 사용자로 실행: 나 (내 Google 계정)
 *    - 액세스 권한: [모든 사용자 (Anyone)] ★ 반드시 선택!
 * 5. [배포] 버튼 클릭 후 권한 승인 완료
 * 6. 생성된 '웹 앱 URL'을 복사하여 관리자 모달 [연동 설정]에 등록하시면 완료됩니다!
 */

// 1. 신규 고객 신청 시 구글 시트에 모든 데이터 실시간 자동 기록 (POST)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    // 시트가 완전히 비어있는 경우 전체 항목 표준 헤더 행 자동 생성
    if (lastRow === 0) {
      sheet.appendRow([
        "신청ID", 
        "신청일시", 
        "고객명", 
        "연락처", 
        "이메일", 
        "세차희망주소", 
        "차종",
        "차량번호",
        "차량색상",
        "차종 및 색상(통합)",
        "신청플랜", 
        "추가선택옵션",
        "희망세차요일", 
        "결제방식", 
        "외관상태",
        "실내환경",
        "사용패턴",
        "차량특징",
        "증빙요청",
        "차량특이사항(종합)", 
        "약관동의내역",
        "진행상태",
        "전자서명"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 23);
      headerRange.setBackground("#0284C7");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      lastRow = 1;
    }
    
    // 전송된 JSON 데이터 파싱
    var data = JSON.parse(e.postData.contents);
    
    var model = data.model || data.car || "";
    var plate = data.plate || "";
    var color = data.color || "";
    
    var carWithPlate = model;
    if (plate && !carWithPlate.includes(plate)) {
      carWithPlate += " (" + plate + ")";
    }
    
    var carFullCombined = carWithPlate;
    if (color && !carFullCombined.includes("색상")) {
      carFullCombined += " / 색상: " + color;
    }
    
    var termsStr = "서비스이용약관(동의), 개인정보수집(동의), 결제규정(동의)";
    if (data.termsAgreed && data.termsAgreed.marketing) {
      termsStr += ", 이벤트수신(동의)";
    }
    
    // 현재 시트의 1행 헤더를 읽어와 스마트 컬럼 매핑 (어떤 기존 시트 양식이든 100% 매칭)
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    var newRow = [];
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c] || "").trim();
      
      if (h.indexOf("신청ID") !== -1 || h.indexOf("ID") !== -1) {
        newRow.push(data.id || ("CUST-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100)));
      } else if (h.indexOf("일시") !== -1 || h.indexOf("시간") !== -1 || h.indexOf("날짜") !== -1) {
        newRow.push(data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm"));
      } else if (h.indexOf("고객") !== -1 || h.indexOf("성명") !== -1 || h.indexOf("이름") !== -1) {
        newRow.push(data.name || "");
      } else if (h.indexOf("연락처") !== -1 || h.indexOf("전화") !== -1 || h.indexOf("휴대폰") !== -1) {
        newRow.push(data.phone || "");
      } else if (h.indexOf("이메일") !== -1 || h.indexOf("Email") !== -1) {
        newRow.push(data.email || "");
      } else if (h.indexOf("주소") !== -1 || h.indexOf("장소") !== -1 || h.indexOf("지역") !== -1) {
        newRow.push(data.region || "");
      } else if (h.indexOf("차종 및 색상") !== -1 || h.indexOf("차종및색상") !== -1 || h.indexOf("차량정보") !== -1) {
        newRow.push(carFullCombined); // 차종, 번호판, 색상이 모두 포함된 통합 표기
      } else if (h.indexOf("차종") !== -1 || h.indexOf("모델") !== -1) {
        newRow.push(model);
      } else if (h.indexOf("차량번호") !== -1 || h.indexOf("번호판") !== -1) {
        newRow.push(plate);
      } else if (h.indexOf("색상") !== -1 || h.indexOf("컬러") !== -1) {
        newRow.push(color);
      } else if (h.indexOf("추가") !== -1 || h.indexOf("옵션") !== -1) {
        newRow.push(data.extraOptions || "없음");
      } else if (h.indexOf("플랜") !== -1 || h.indexOf("이용") !== -1 || h.indexOf("서비스") !== -1) {
        newRow.push(data.plan || data.experience || "");
      } else if (h.indexOf("요일") !== -1) {
        newRow.push(data.days || "");
      } else if (h.indexOf("결제") !== -1) {
        newRow.push(data.paymentMethod || "카드");
      } else if (h.indexOf("외관") !== -1) {
        newRow.push(data.exteriorState || "없음");
      } else if (h.indexOf("실내") !== -1) {
        newRow.push(data.interiorEnv || "없음");
      } else if (h.indexOf("패턴") !== -1) {
        newRow.push(data.usagePattern || "없음");
      } else if (h.indexOf("특징") !== -1) {
        newRow.push(data.carFeatures || "없음");
      } else if (h.indexOf("증빙") !== -1) {
        newRow.push(data.proofRequest || "없음");
      } else if (h.indexOf("특이사항") !== -1) {
        newRow.push(data.specialNotes || "없음");
      } else if (h.indexOf("약관") !== -1 || h.indexOf("동의") !== -1) {
        newRow.push(termsStr);
      } else if (h.indexOf("상태") !== -1 || h.indexOf("승인") !== -1) {
        newRow.push(data.status || "PENDING");
      } else if (h.indexOf("서명") !== -1) {
        newRow.push(data.signature ? "서명완료 (Base64)" : "미서명");
      } else {
        newRow.push("");
      }
    }
    
    // 만약 기존 시트에 매핑되지 않은 경우 기본 포맷으로 추가
    if (newRow.length === 0) {
      newRow = [
        data.id || ("CUST-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100)),
        data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm"),
        data.name || "",
        data.phone || "",
        data.email || "",
        data.region || "",
        carFullCombined,
        data.plan || data.experience || "",
        data.days || "",
        data.paymentMethod || "",
        data.specialNotes || "",
        data.status || "PENDING",
        data.signature || ""
      ];
    }
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "고객 가입신청의 모든 상세 내용이 구글 시트에 완벽하게 등록되었습니다.",
      id: data.id 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 관리자 페이지에서 모든 기기(PC, 모바일) 접속 시 구글 시트 전체 고객 목록 실시간 조회 (GET + JSONP 지원)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    var customerList = [];
    
    if (lastRow > 1 && lastCol > 0) {
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0] && !r[1] && !r[2]) continue; // 빈 행 건너뜀
        
        var record = {
          id: "",
          createdAt: "",
          name: "",
          phone: "",
          email: "",
          region: "",
          model: "",
          plate: "",
          color: "",
          car: "",
          plan: "",
          extraOptions: "",
          experience: "",
          days: "",
          paymentMethod: "",
          specialNotes: "",
          status: "PENDING",
          signature: ""
        };
        
        for (var c = 0; c < headers.length; c++) {
          var h = String(headers[c] || "").trim();
          var val = r[c] ? (r[c] instanceof Date ? Utilities.formatDate(r[c], "Asia/Seoul", "yyyy-MM-dd HH:mm") : String(r[c])) : "";
          
          if (h.indexOf("신청ID") !== -1 || h.indexOf("ID") !== -1) record.id = val;
          else if (h.indexOf("일시") !== -1 || h.indexOf("시간") !== -1 || h.indexOf("날짜") !== -1) record.createdAt = val;
          else if (h.indexOf("고객") !== -1 || h.indexOf("성명") !== -1 || h.indexOf("이름") !== -1) record.name = val;
          else if (h.indexOf("연락처") !== -1 || h.indexOf("전화") !== -1 || h.indexOf("휴대폰") !== -1) record.phone = val;
          else if (h.indexOf("이메일") !== -1 || h.indexOf("Email") !== -1) record.email = val;
          else if (h.indexOf("주소") !== -1 || h.indexOf("장소") !== -1 || h.indexOf("지역") !== -1) record.region = val;
          else if (h.indexOf("차종 및 색상") !== -1 || h.indexOf("차종및색상") !== -1 || h.indexOf("차량정보") !== -1) record.car = val;
          else if (h.indexOf("차종") !== -1 || h.indexOf("모델") !== -1) record.model = val;
          else if (h.indexOf("차량번호") !== -1 || h.indexOf("번호판") !== -1) record.plate = val;
          else if (h.indexOf("색상") !== -1 || h.indexOf("컬러") !== -1) record.color = val;
          else if (h.indexOf("추가") !== -1 || h.indexOf("옵션") !== -1) record.extraOptions = val;
          else if (h.indexOf("플랜") !== -1 || h.indexOf("이용") !== -1 || h.indexOf("서비스") !== -1) record.experience = val;
          else if (h.indexOf("요일") !== -1) record.days = val;
          else if (h.indexOf("결제") !== -1) record.paymentMethod = val;
          else if (h.indexOf("특이사항") !== -1) record.specialNotes = val;
          else if (h.indexOf("상태") !== -1 || h.indexOf("승인") !== -1) record.status = val || "PENDING";
          else if (h.indexOf("서명") !== -1) record.signature = val;
        }
        
        // 차종/번호/색상 보정 파싱
        if (record.car && (!record.color || !record.plate || !record.model)) {
          var plateM = record.car.match(/(\d{2,3}[가-힣]\s*\d{4})/);
          if (plateM && !record.plate) record.plate = plateM[1];
          
          var colorM = record.car.match(/(?:색상|컬러|Color)\s*[:：]\s*([^\/\[\],]+)/i) || record.car.match(/\[색상:\s*([^\]]+)\]/);
          if (colorM && !record.color) record.color = colorM[1].trim();
          
          if (!record.model) {
            record.model = record.car.replace(/(\d{2,3}[가-힣]\s*\d{4})/, '').replace(/[()]/g, '').replace(/\/\s*색상\s*[:：][^\/]+/g, '').replace(/\[색상:[^\]]+\]/g, '').trim();
          }
        }
        
        if (!record.car && record.model) {
          record.car = record.model + (record.plate ? " (" + record.plate + ")" : "") + (record.color ? " / 색상: " + record.color : "");
        }
        
        if (!record.id) record.id = "CUST-" + (i + 1);
        
        customerList.push(record);
      }
      
      customerList.reverse(); // 최신순 정렬
    }
    
    var responseObj = {
      result: "success",
      total: customerList.length,
      data: customerList
    };
    
    // JSONP 지원 (CORS 제약 없이 100% 실시간 조회)
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
