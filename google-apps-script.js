/**
 * 세차 플랜 (CARWASH PLAN) - 구글 스프레드시트 실시간 양방향 데이터 연동 Apps Script
 * 
 * [1분 설정 및 배포 방법]
 * 1. 구글 드라이브(drive.google.com)에서 세차플랜 스프레드시트를 엽니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 파일의 전체 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 오른쪽 위 파란색 [배포] > [새 배포] 클릭
 *    - 유형(톱니바퀴): [웹 앱]
 *    - 설명: 세차플랜 실시간 양방향 연동 (색상 및 전 기기 동기화)
 *    - 다음 사용자로 실행: 나 (내 Google 계정)
 *    - 액세스 권한: [모든 사용자 (Anyone)] ★ 반드시 선택!
 * 5. [배포] 버튼 클릭 후 승인 완료
 * 6. 생성된 '웹 앱 URL'을 복사하여 관리자 모달 [연동 설정]에 등록하시면 모든 PC/모바일에서 실시간으로 데이터가 동기화됩니다!
 */

// 1. 신규 고객 신청 시 구글 시트에 실시간 자동 기록 (POST)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트가 완전히 비어있는 경우 헤더 행 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "신청ID", 
        "신청일시", 
        "고객명", 
        "연락처", 
        "이메일", 
        "세차희망주소", 
        "차종 및 차량번호", 
        "차량색상", 
        "이용플랜", 
        "희망요일", 
        "결제방식", 
        "차량특이사항", 
        "진행상태",
        "서명데이터"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 14);
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
    
    var carWithPlate = model;
    if (plate && !carWithPlate.includes(plate)) {
      carWithPlate += " (" + plate + ")";
    }
    
    var carFullInfo = carWithPlate;
    if (color) {
      carFullInfo += " [색상: " + color + "]";
    }
    
    var rowData = [
      data.id || ("CUST-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100)),
      data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm"),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.region || "",
      carFullInfo,       // 차종, 차량번호, 색상 통합 표기 (기존 시트 호환)
      color,             // 차량 색상 전용 컬럼
      data.experience || "",
      data.days || "",
      data.paymentMethod || "",
      data.specialNotes || "",
      data.status || "PENDING",
      data.signature || ""
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "고객 데이터가 구글 시트에 성공적으로 등록되었습니다.",
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
    
    var customerList = [];
    
    if (lastRow > 1) {
      var lastColumn = Math.max(sheet.getLastColumn(), 14);
      var rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
      
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0] && !r[2]) continue; // 빈 행 제외
        
        var id = String(r[0] || ("CUST-" + (i + 1)));
        var createdAt = r[1] ? (r[1] instanceof Date ? Utilities.formatDate(r[1], "Asia/Seoul", "yyyy-MM-dd HH:mm") : String(r[1])) : "";
        var name = String(r[2] || "");
        var phone = String(r[3] || "");
        var email = String(r[4] || "");
        var region = String(r[5] || "");
        var carRaw = String(r[6] || "");
        var colorRaw = String(r[7] || "");
        var experience = String(r[8] || "");
        var days = String(r[9] || "");
        var paymentMethod = String(r[10] || "카드");
        var specialNotes = String(r[11] || "");
        var status = String(r[12] || "PENDING");
        var signature = String(r[13] || "");
        
        // 차종, 차량번호, 색상 파싱
        var model = carRaw;
        var plate = "";
        var color = colorRaw;
        
        // carRaw에 차량번호나 색상이 포함된 경우 분리
        var plateMatch = carRaw.match(/(\d{2,3}[가-힣]\s*\d{4})/);
        if (plateMatch) {
          plate = plateMatch[1];
          model = carRaw.replace(plateMatch[0], '').replace(/[()]/g, '').replace(/\[색상:[^\]]+\]/g, '').trim();
        }
        
        var colorMatch = carRaw.match(/\[색상:\s*([^\]]+)\]/);
        if (colorMatch && !color) {
          color = colorMatch[1].trim();
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
          experience: experience,
          days: days,
          paymentMethod: paymentMethod,
          specialNotes: specialNotes,
          status: status,
          signature: signature,
          termsAgreed: {
            service: true,
            privacy: true,
            financial: true,
            marketing: true,
            agreedAt: createdAt
          }
        });
      }
      
      // 최신 신청순(역순) 정렬
      customerList.reverse();
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
