/**
 * 세차 플랜 (CARWASH PLAN) - 구글 스프레드시트 자동 저장 Apps Script
 * 
 * [1분 설정 가이드]
 * 1. 구글 드라이브(drive.google.com)에서 새 'Google 스프레드시트'를 만듭니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 아래의 전체 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 오른쪽 위 [배포] > [새 배포] 클릭
 *    - 유형 선택(톱니바퀴): [웹 앱]
 *    - 설명: 세차 플랜 신청 연동
 *    - 다음 사용자로 실행: 나 (내 Google 계정)
 *    - 액세스 권한: [모든 사용자 (Anyone)] ★ 반드시 선택!
 * 5. [배포] 버튼 클릭 후 권한 승인 완료
 * 6. 생성된 '웹 앱 URL'을 복사하여 관리자 모달 '연동 설정' 또는 app.js에 등록하시면 완료됩니다!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트에 헤더가 없으면 첫 행에 컬럼 헤더 자동 생성
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
      
      // 헤더 스타일 서식 지정 (세차플랜 테마 블루 컬러)
      var headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setBackground("#0EA5E9");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // 전송된 JSON 데이터 파싱
    var data = JSON.parse(e.postData.contents);
    
    // 새로운 고객 신청 행 추가
    sheet.appendRow([
      data.id || ("CUST-" + new Date().getTime()),
      data.createdAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss"),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.region || "",
      data.car || "",
      data.experience || "",
      data.days || "",
      data.paymentMethod || "",
      data.specialNotes || "",
      data.status || "PENDING"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "고객 데이터가 구글 시트에 성공적으로 추가되었습니다." }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("세차 플랜 (CARWASH PLAN) 구글 시트 웹훅 API가 정상 작동 중입니다.");
}
