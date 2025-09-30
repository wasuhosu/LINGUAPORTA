console.debug("リンガポルタ拡張機能作動 version:" + chrome.runtime.getManifest().version);

// ページ遷移を許可するかどうかのフラグ (0: オフ, 1: オン)
const ALLOW_PAGE_TRANSLATION = 1;
if (ALLOW_PAGE_TRANSLATION == 0) {
  console.warn("ページ遷移オフ");
}

// Chromeのローカルストレージから設定を読み込む
chrome.storage.local.get(null, function (storageData) {
  console.debug(JSON.stringify(storageData));

  // ログインページ以外でIDが設定されていない場合はエラーを出力してログアウト
  if (storageData.id == null && document.body.className != "page-login") {
    console.error("idが設定されていません");
    logout();
  }

  let currentPage = "";
  let questionNumber = 0; // 問題番号

  // 問題タイトルとページタイトルから問題番号を計算
  if (document.getElementsByClassName("problem-title")[0] != null && document.getElementsByClassName("page-title")[0].children[0] != null) {
    questionNumber = document.getElementsByClassName("problem-title")[0].innerText.split("：")[1] - 1 + Number(document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[0].slice(1));
  }

  let currentProblemIndexInUnit = 0; // ユニット内の現在の問題インデックス
  if (document.getElementsByClassName("score-number")[1] != null) {
    currentProblemIndexInUnit = Number(document.getElementsByClassName("score-number")[1].innerText);
  }

  let problemType = "";
  let questionNumberList = [];
  let answerText1 = "";
  let answerText2 = "";
  let answerData = "";

  if (document.getElementById("question_td") != null) {
    document.getElementById("question_td").innerHTML = document.getElementById("question_td").innerHTML.replace(/<br>/g, "");
  }

  // ページの種類を特定
  if (document.body.className == "page-problem") {
    problemType = document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[1];
  } else {
    problemType = "一覧";
  }

  if (document.body.className == "page-login") {
    currentPage = "ログイン画面";
  } else if (document.body.className == "page-home") {
    currentPage = "ホーム画面";
  } else if (document.body.className == "page-study") {
    currentPage = "書籍選択画面";
  } else if (document.body.className == "page-units page-categories") {
    currentPage = "学習ユニット選択画面";
  } else if (document.body.className == "page-portfolio") {
    currentPage = "学習結果表示画面";
  } else if (problemType == "空所補充") {
    if (document.getElementById("true_msg") == null && document.getElementById("false_msg") == null && document.getElementById("tabindex1") != null) {
      currentPage = "空所補充-問題出題画面";
    } else if (document.getElementById("false_msg") != null) {
      currentPage = "空所補充-不正解画面";
    } else if (document.querySelector("#question_area > div.qu03 > input[type=text]") != null) {
      currentPage = "空所補充-正解表示画面";
    } else if (document.getElementById("true_msg") != null && document.getElementsByClassName("problem-next-group")[0].innerText.slice(-2) != "終了") {
      currentPage = "空所補充-正解後の画面";
    } else if (document.getElementById("true_msg") != null) {
      currentPage = "空所補充-全問題終了画面";
    } else {
      console.error("ページの特定に失敗");
    }
  } else if (problemType == "単語の意味") {
    if (document.getElementById("drill_form") != null && document.getElementById("commentary") == null && document.querySelector("#drill_form > font") == null) {
      currentPage = "単語の意味-問題出題画面";
    } else if (document.querySelector("#drill_form > font") != null && document.getElementById("true_msg") == null) {
      currentPage = "単語の意味-不正解画面";
    } else if (document.getElementById("drill_form") != null && document.getElementById("true_msg") == null && document.getElementById("under_area").innerText.indexOf("全問終了") == -1) {
      currentPage = "単語の意味-正解表示画面";
    } else if (document.getElementById("true_msg") != null && document.getElementsByClassName("problem-next-group")[0].innerText.slice(-2) != "終了") {
      currentPage = "単語の意味-正解後の画面";
    } else if (document.getElementsByClassName("problem-next-group")[0].innerText.slice(-2) == "終了") {
      currentPage = "単語の意味-全問題終了画面";
    } else {
      currentPage = "不明";
      console.error("ページの特定に失敗");
    }
  } else if (document.querySelector("#problem-area").innerText == "問題が有りません。") {
    currentPage = "全問題終了画面で再読み込み";
  } else {
    console.error("ページの特定に失敗");
  }

  // 現在のページに応じて処理を分岐
  switch (currentPage) {
    case "ログイン画面":
      console.debug("location:" + currentPage);
      /**
       * UIから設定を読み込み、ストレージに保存する
       */
      function updateSettings() {
        document.getElementById("current-value_late").innerText = document.getElementById("slider_late").value + "秒";
        document.getElementById("current-value_score").innerText = document.getElementById("slider_score").value + "点";
        document.getElementById("current-value_correct_answer_rate").innerText = Math.round(25 / (150 - document.getElementById("slider_correct_answer_rate").value) * 100) + "%";
        
        // 不正解にする問題のリストを作成
        let wrongQuestionPool = [];
        for (let i = 0; i < Math.floor((125 - document.getElementById("slider_correct_answer_rate").value) / 25); i++) {
          wrongQuestionPool.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25);
        }
        for (let j = 1; j <= Math.floor((125 - document.getElementById("slider_correct_answer_rate").value) % 25); j++) {
          wrongQuestionPool.push(j);
        }

        let delayMs = Number(document.getElementById("slider_late").value) * 1000;
        let targetScore = 0;
        let selectedUnits = [];
        document.querySelectorAll("input[name=\"unit_selection\"]").forEach(checkbox => {
          if (checkbox.checked) {
            selectedUnits.push(checkbox.value);
          }
        });

        // 自動化がオンかオフかで設定を切り替える
        if (document.getElementById("switch").checked) {
          document.querySelector(".current-status").textContent = "自動化ON";
          document.getElementsByClassName("stats-pannel ranking")[0].classList.remove("display-none");
          targetScore = Number(document.getElementById("slider_score").value);
        } else {
          document.querySelector(".current-status").textContent = "自動化OFF";
          document.getElementsByClassName("stats-pannel ranking")[0].classList.add("display-none");
          targetScore = -2; // 自動化オフを示す値
          delayMs = null;
          wrongQuestionPool = null;
          selectedUnits = null;
        }

        // 設定をストレージに保存
        chrome.storage.local.set({
          id: document.getElementsByName("id")[0].value,
          password: document.getElementsByName("password")[0].value,
          set_score: targetScore,
          set_late: delayMs,
          set_wrong_question: wrongQuestionPool,
          set_run_unit: selectedUnits
        }, function () {});
      }
      
      // ログイン画面のUIを書き換え、設定項目を追加
      document.getElementsByClassName("body")[0].innerHTML = "<form action='/user/seibido/' method='POST'><input type='hidden' name='login' value='login'><div class='login-error-block'></div><div clas[...]";
      
      // ストレージからID/Passwordなどを復元
      if (storageData.id != null) {
        document.getElementsByName("id")[0].value = storageData.id;
      }
      if (storageData.password != null) {
        document.getElementsByName("password")[0].value = storageData.password;
      }
      if (storageData.configured_score != null) {
        console.log("configured_score", storageData.configured_score);
        document.getElementById("slider_score").value = Math.round(storageData.learning_time * 10 / storageData.score) / 10 + "秒";
      }
      if (storageData.configured_late != null) {
        console.log("configured_late", storageData.configured_late);
        document.getElementById("slider_late").value = Math.round(storageData.learning_time * 10 / storageData.score) / 10 + "秒";
      }
      if (storageData.configured_rate != null) {
        console.log("configured_rate", storageData.configured_rate);
        document.getElementById("slider_correct_answer_rate").value = Math.round(storageData.learning_time * 10 / storageData.score) / 10 + "秒";
      }
      
      updateSettings();
      
      // 設定変更イベントリスナーを登録
      const settingElements = Object.freeze(["slider_score", "slider_late", "slider_correct_answer_rate", "unit_selection_0", "unit_selection_1", "switch"]);
      for (let i = 0; i < settingElements.length; i++) {
        document.getElementById(settingElements[i]).addEventListener("change", updateSettings);
      }
      break;

    case "ホーム画面":
      console.debug("location:" + currentPage);
      cleanupStorage();
      if (storageData.set_score > -2) { // 自動化がオンの場合
        chrome.storage.local.set({
          rank: Number(document.getElementsByClassName("score-number text-right")[0].innerText)
        }, function () {
          if (ALLOW_PAGE_TRANSLATION) {
            document.querySelector("#spmenu-nav > a:nth-child(2)").click(); // 書籍選択画面へ
          }
        });
      }
      break;

    case "書籍選択画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > -2) { // 自動化がオンの場合
        document.getElementsByClassName("button-secondary")[0].click(); // ユニット選択画面へ
      }
      break;

    case "学習ユニット選択画面":
      console.debug("location:" + currentPage);
      cleanupStorage();
      if ("set_score" in storageData) {
        if (storageData.set_score > 0) { // 目標スコアが設定されている場合
          /**
           * 学習するユニットを決定し、問題データを取得して学習を開始する
           * @param {number} pageNumber - ユニットリストのページ番号
           */
          async function startUnit(pageNumber = 1) {
            let scorePerMode = storageData.score_per_mode;
            let targetUnitType = "";

            if (scorePerMode == null) {
              targetUnitType = "空所補充"; // 初回は空所補充から
            } else if (storageData.set_run_unit.every(unit => Object.keys(scorePerMode).includes(unit))) {
              // 実行対象ユニットの中から、スコアが最も低いものを選択
              let filteredScores = Object.keys(scorePerMode)
                .filter(unitType => storageData.set_run_unit.includes(unitType))
                .reduce((obj, key) => {
                  obj[key] = scorePerMode[key];
                  return obj;
                }, {});
              targetUnitType = Object.keys(filteredScores).reduce((a, b) => filteredScores[a] < filteredScores[b] ? a : b);
            } else {
              targetUnitType = storageData.set_run_unit[0];
            }

            // ユニットリストを取得
            let url = "user/units.php";
            let params = new URLSearchParams();
            params.append("reference_num", "70");
            params.append("search", targetUnitType);
            if (pageNumber > 1) {
              params.append("unit_list_page", pageNumber);
            } else {
              params.append("paging_size", "50");
            }

            let response = await fetch(url, {
              method: "POST",
              body: params,
              headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            let unitListHtml = await response.text();
            document.getElementById("units_list").innerHTML = unitListHtml;

            let unitTableRows = document.getElementsByTagName("table")[0].rows;
            let unitStarted = false;
            for (let i = 1; i < unitTableRows.length; i++) {
              const cells = unitTableRows[i].cells;
              let unitInfo = {
                unit_name: cells[0].textContent.trim(),
                start_question_number: Number(cells[0].textContent.trim().split("-")[0].slice(1)),
                end_question_number: Number(cells[0].textContent.trim().split("-")[1].split(")")[0]),
                score: Number(cells[1].textContent.trim().split("点")[0]),
                button_onclick: cells[3].children[0].getAttribute("onclick")
              };

              if (unitInfo.button_onclick) { // 「学習する」ボタンがある場合
                unitStarted = true;
                for (let j = unitInfo.start_question_number; j < unitInfo.end_question_number; j++) {
                  questionNumberList.push(j);
                }

                const unitType = unitInfo.unit_name.split(")")[1];
                const getRequest = {
                  id: storageData.id,
                  request_type: "get",
                  question_number: questionNumberList
                };

                // バックグラウンドスクリプトに問題データの取得を要求
                chrome.runtime.sendMessage(getRequest, response => {
                  console.debug(JSON.stringify(response));
                  if (response != undefined) {
                    const newScorePerMode = { ...storageData.score_per_mode };
                    newScorePerMode[unitType] = unitInfo.start_question_number;

                    let newStorageData = {
                      start_question_number: unitInfo.start_question_number,
                      start_time: Date.now(),
                      correct_answer_times: 0,
                      incorrect_answer_times: 0,
                      wrong_question_queue: storageData.set_wrong_question,
                      score_per_mode: newScorePerMode
                    };

                    response.content.forEach((questionData) => {
                      newStorageData["a" + questionData[0]] = questionData.slice(1, 6);
                    });

                    // 学習状態をストレージに保存して問題ページに遷移
                    chrome.storage.local.set(newStorageData, function () {
                      if (ALLOW_PAGE_TRANSLATION) {
                        let form = document.querySelector("#unit-categories-table > form");
                        form.sub.value = "drill";
                        form.unit_num.value = unitInfo.button_onclick.split("'")[3];
                        form.category_tag.value = "";
                        form.submit();
                      }
                    });
                  }
                });
                break; // 最初の学習可能なユニットでループを抜ける
              }
            }

            if (!unitStarted) { // このページに学習可能なユニットがなければ次のページへ
              startUnit(pageNumber + 1);
            }
          }
          startUnit(1);
        } else if (storageData.set_score == 0) { // 目標スコア達成
          logout();
        }
      } else {
        console.error("エラー: set_scoreが定義されていません");
        logout();
      }
      break;

    case "学習結果表示画面":
      console.debug("location:" + currentPage);
      let timeParts = [];
      for (let i = 1; i < 4; i++) {
        timeParts.push(document.querySelector("body > div > main > section.stats-pannel.portfolio > div.body > div:nth-child(4) > div > span:nth-child(" + i + ")").innerText);
      }
      const portfolioData = {
        score: Number(document.getElementsByClassName("xl")[0].innerText.replace(/,/g, '')),
        challenge_times: Number(document.getElementsByClassName("portfolio-number")[2].innerText.slice(0, -2)),
        learning_time: Number(timeParts[0]) * 60 * 60 + Number(timeParts[1]) * 60 + Number(timeParts[2])
      };
      
      // 学習結果をストレージに保存
      chrome.storage.local.set(portfolioData, function () {
        const recordRequest = {
          id: storageData.id,
          request_type: "portfolio_record",
          score: portfolioData.score,
          rank: storageData.rank,
          challenge_times: portfolioData.challenge_times,
          learning_time: portfolioData.learning_time
        };
        
        // バックグラウンドに結果を送信
        chrome.runtime.sendMessage(recordRequest, response => {
          console.debug(JSON.stringify(response));
          if (storageData.set_score > 0) {
            if (ALLOW_PAGE_TRANSLATION) {
              document.querySelector("#spmenu-nav > a:nth-child(1)").click(); // ホームに戻る
            }
          } else if (storageData.set_score == 0) {
            logout();
          } else if (storageData.set_score != -2) {
            console.error("エラー");
          }
        });
      });
      break;

    case "空所補充-問題出題画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > 0) {
        let messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>${storageData.set_late / 1000}秒後に不正解になります。</div>`;
        
        // 意図的に間違える問題かどうかを判定
        if (storageData.wrong_question_queue.includes(currentProblemIndexInUnit + 1)) {
          document.getElementById("tabindex1").value = generateRandomString(); // ランダムな文字列を入力
          document.getElementById("under_area").before(messageDiv);
          submitAnswerWithDelay();
        } else {
          let key = "a" + String(questionNumber);
          if ([key] in storageData && storageData[key][2] != null && storageData[key][2] != "") {
            document.getElementById("tabindex1").value = storageData[key][2]; // 正解を入力
            messageDiv.innerHTML = `<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>${storageData.set_late / 1000}秒後に正解します。</div>`;
            document.getElementById("under_area").before(messageDiv);
          } else {
            document.getElementById("tabindex1").value = generateRandomString(); // 不明な場合はランダム
            document.getElementById("under_area").before(messageDiv);
          }
          submitAnswerWithDelay();
        }
      }
      break;

    case "空所補充-不正解画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > 0) {
        let wrongQueue = storageData.wrong_question_queue;
        wrongQueue.splice(storageData.wrong_question_queue.indexOf(currentProblemIndexInUnit + 1), 1);
        chrome.storage.local.set({
          incorrect_answer_times: storageData.incorrect_answer_times + 1,
          wrong_question_queue: wrongQueue
        }, function () {
          if (storageData.set_score > 0 && ALLOW_PAGE_TRANSLATION) {
            document.getElementsByClassName("button button-trans problem-view-answer")[0].click(); // 答えを見る
          }
        });
      }
      break;

    case "空所補充-正解表示画面":
      console.debug("location:" + currentPage);
      let key = "a" + String(questionNumber);
      answerText1 = document.querySelector("#question_area > div.qu03 > input[type=text]").value.trim();
      answerData = key in storageData ? [storageData[key][0], storageData[key][1], answerText1, storageData[key][3], storageData[key][4]] : [null, null, answerText1, null, null];
      
      const updateData = { [key]: answerData };
      chrome.storage.local.set(updateData, function () {
        if (storageData.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
          document.getElementsByClassName("button button-success button-next-problem")[0].click(); // 次の問題へ
        }
      });
      break;

    case "空所補充-正解後の画面":
    case "空所補充-全問題終了画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > -2) {
        function processNextStep() {
          console.log("this_question_info", thisQuestionInfo);
          if (ALLOW_PAGE_TRANSLATION) {
            if (currentPage === "空所補充-正解後の画面") {
              document.getElementsByClassName("button button-success button-next-problem")[0].click();
            } else if (currentPage === "空所補充-全問題終了画面") {
              finishUnitAndReportStats();
            }
          }
        }
        
        let thisQuestionInfo = {
          question_number: questionNumber,
          question_type: problemType,
          question_answer_1: document.querySelector("#drill_form > b").innerText.slice(1, -1),
          question_answer_2: null
        };
        
        // GASへの送信キューを処理
        if ("GAS_set_queue" in storageData) {
          if (storageData.GAS_set_queue.length > 3) { // キューが溜まったら送信
            chrome.storage.local.set({
              GAS_set_queue: [],
              correct_answer_times: storageData.correct_answer_times + 1
            }, function () {
              let sendQueue = storageData.GAS_set_queue;
              sendQueue.push(thisQuestionInfo);
              const setRequest = { id: storageData.id, request_type: "set", content: sendQueue };
              chrome.runtime.sendMessage(setRequest, response => console.debug(JSON.stringify(response)));
              processNextStep();
            });
          } else {
            let newQueue = storageData.GAS_set_queue;
            newQueue.push(thisQuestionInfo);
            chrome.storage.local.set({
              GAS_set_queue: newQueue,
              correct_answer_times: storageData.correct_answer_times + 1
            }, function () {
              processNextStep();
            });
          }
        } else {
          chrome.storage.local.set({
            GAS_set_queue: [thisQuestionInfo],
            correct_answer_times: storageData.correct_answer_times + 1
          }, function () {
            processNextStep();
          });
        }
      }
      break;

    case "単語の意味-問題出題画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > 0) {
        let messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>${storageData.set_late / 1000}秒後に不正解になります。</div>`;
        
        if (storageData.wrong_question_queue !== undefined) {
          let selectedAnswerIndex = 0;
          if (!storageData.wrong_question_queue.includes(currentProblemIndexInUnit + 1)) {
            let key = "a" + String(questionNumber);
            if (storageData[key] && storageData[key][1]) {
              let choices = Array.from({ length: 5 }, (_, i) => document.getElementById("answer_0_" + i).value);
              let correctIndex = choices.indexOf(storageData[key][1]);
              if (correctIndex !== -1) {
                selectedAnswerIndex = correctIndex;
                messageDiv.innerHTML = `<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>${storageData.set_late / 1000}秒後に正解します。</div>`;
              }
            }
          }
          document.getElementById("answer_0_" + selectedAnswerIndex).checked = true;
          document.getElementById("under_area").before(messageDiv);
          submitAnswerWithDelay();
        } else {
          console.error("wrong_question_queue is NULL");
          document.getElementById("answer_0_0").checked = true;
          document.getElementById("under_area").before(messageDiv);
          submitAnswerWithDelay();
        }
      }
      break;

    case "単語の意味-不正解画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > 0) {
        let wrongQueue = storageData.wrong_question_queue;
        wrongQueue.splice(storageData.wrong_question_queue.indexOf(currentProblemIndexInUnit + 1), 1);
        chrome.storage.local.set({
          incorrect_answer_times: storageData.incorrect_answer_times + 1,
          wrong_question_queue: wrongQueue
        }, function () {
          if (ALLOW_PAGE_TRANSLATION) {
            document.getElementsByClassName("button button-trans problem-view-answer")[0].click();
          }
        });
      }
      break;

    case "単語の意味-正解表示画面":
      console.debug("location:" + currentPage);
      let key = "a" + String(questionNumber);
      answerText1 = document.getElementById("qu02").innerText;
      answerText2 = document.getElementById("drill_form").innerText.slice(3, -2);
      answerData = key in storageData ? [answerText1, answerText2, storageData[key][2], storageData[key][3], storageData[key][4]] : [answerText1, answerText2, null, null, null];
      
      const updateData = { [key]: answerData };
      chrome.storage.local.set(updateData, function () {
        if (storageData.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
          document.getElementsByClassName("button button-success button-next-problem")[0].click();
        }
      });
      break;

    case "単語の意味-正解後の画面":
    case "単語の意味-全問題終了画面":
      console.debug("location:" + currentPage);
      if (storageData.set_score > -2) {
        function processNextStep() {
          console.log("this_question_info", thisQuestionInfo);
          if (ALLOW_PAGE_TRANSLATION) {
            if (currentPage === "単語の意味-正解後の画面") {
              document.getElementsByClassName("button button-success button-next-problem")[0].click();
            } else if (currentPage === "単語の意味-全問題終了画面") {
              finishUnitAndReportStats();
            }
          }
        }
        
        let thisQuestionInfo = {
          question_number: questionNumber,
          question_type: problemType,
          question_answer_1: document.getElementById("qu02").innerText,
          question_answer_2: document.getElementById("drill_form").innerText.slice(4, -2)
        };

        if ("GAS_set_queue" in storageData) {
          if (storageData.GAS_set_queue.length > 7) {
            chrome.storage.local.set({
              GAS_set_queue: [],
              correct_answer_times: storageData.correct_answer_times + 1
            }, function () {
              let sendQueue = storageData.GAS_set_queue;
              sendQueue.push(thisQuestionInfo);
              const setRequest = { id: storageData.id, request_type: "set", content: sendQueue };
              chrome.runtime.sendMessage(setRequest, response => console.debug(JSON.stringify(response)));
              processNextStep();
            });
          } else {
            let newQueue = storageData.GAS_set_queue;
            newQueue.push(thisQuestionInfo);
            chrome.storage.local.set({
              GAS_set_queue: newQueue,
              correct_answer_times: storageData.correct_answer_times + 1
            }, function () {
              processNextStep();
            });
          }
        } else {
          chrome.storage.local.set({
            GAS_set_queue: [thisQuestionInfo],
            correct_answer_times: storageData.correct_answer_times + 1
          }, function () {
            processNextStep();
          });
        }
      }
      break;

    case "全問題終了画面で再読み込み":
      console.debug("location:" + currentPage);
      document.querySelector("body > div > form:nth-child(6)").submit();
      break;
      
    default:
      console.error("エラー: 不明なページです");
      console.debug(document.querySelector("html").innerText);
  }

  /**
   * ストレージから不要なデータを削除する
   */
  function cleanupStorage() {
    for (let key in storageData) {
      const persistentKeys = Object.freeze(["id", "password", "set_score", "set_late", "set_wrong_question", "set_run_unit", "score", "rank", "challenge_times", "learning_time", "wrong_question_queue", "score_per_mode", "configured_score", "configured_late", "configured_rate"]);
      if (!persistentKeys.includes(key)) {
        chrome.storage.local.remove(key);
      }
    }
  }

  /**
   * ログアウト処理を行う
   */
  async function logout() {
    if (ALLOW_PAGE_TRANSLATION) {
      const logoutUrl = "";
      const params = new URLSearchParams();
      params.append("login", "logout");
      const response = await fetch(logoutUrl, {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      location.reload();
    }
  }

  /**
   * ランダムな8文字の英字文字列を生成する
   * @returns {string} ランダムな文字列
   */
  function generateRandomString() {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 設定された遅延時間後に解答を送信する
   */
  function submitAnswerWithDelay() {
    setTimeout(() => {
      if (ALLOW_PAGE_TRANSLATION) {
        document.getElementById("ans_submit").click();
      }
    }, storageData.set_late);
  }

  /**
   * ユニット終了時に統計情報を送信し、次のユニットへ進む
   */
  function finishUnitAndReportStats() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    let browserName = "";
    if (userAgent.indexOf("edge") !== -1 || userAgent.indexOf("edga") !== -1 || userAgent.indexOf("edgios") !== -1) {
      browserName = "Edge";
    } else if (userAgent.indexOf("opera") !== -1 || userAgent.indexOf("opr") !== -1) {
      browserName = "Opera";
    } else if (userAgent.indexOf("samsungbrowser") !== -1) {
      browserName = "Samsung Internet Browser";
    } else if (userAgent.indexOf("ucbrowser") !== -1) {
      browserName = "UC";
    } else if (userAgent.indexOf("chrome") !== -1 || userAgent.indexOf("crios") !== -1) {
      browserName = "Chrome";
    } else if (userAgent.indexOf("firefox") !== -1 || userAgent.indexOf("fxios") !== -1) {
      browserName = "Firefox";
    } else if (userAgent.indexOf("safari") !== -1) {
      browserName = "Safari";
    } else if (userAgent.indexOf("msie") !== -1 || userAgent.indexOf("trident") !== -1) {
      browserName = "IE";
    } else {
      browserName = "error";
    }

    let osName = "";
    if (userAgent.indexOf("windows nt") !== -1) {
      osName = "Windows";
    } else if (userAgent.indexOf("android") !== -1) {
      osName = "Android";
    } else if (userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1) {
      osName = "iOS";
    } else if (userAgent.indexOf("mac os x") !== -1) {
      osName = "Mac";
    } else {
      osName = "error";
    }

    // バックグラウンドに送信する統計データ
    chrome.runtime.sendMessage({
      id: storageData.id,
      request_type: "result_setting_record",
      version: chrome.runtime.getManifest().version,
      set_score: storageData.set_score,
      set_late: storageData.set_late / 1000,
      set_wrong_question: storageData["set_wrong_question.length"],
      set_run_unit: storageData.set_run_unit.join(),
      run_unit: problemType,
      run_question_number: storageData.start_question_number,
      get_score: storageData.correct_answer_times + 1,
      incorrect_answer_times: storageData.incorrect_answer_times,
      duration: Math.round((Date.now() - storageData.start_time) / 1000),
      browser: browserName,
      os: osName,
      user_agent: userAgent,
      screen_width: screen.width,
      screen_height: screen.height
    }, response => {
      console.debug(JSON.stringify(response));
      if (storageData.set_score > -2) {
        if ("set_score" in storageData) {
          // 目標スコアを更新して次のユニットへ
          chrome.storage.local.set({
            configured_score: storageData.set_score,
            configured_late: storageData.set_late,
            configured_rate: storageData.set_wrong_question.length,
            set_score: storageData.set_score - 25
          }, function () {
            if (ALLOW_PAGE_TRANSLATION) {
              document.getElementsByClassName("return-links _bottom")[0].children[0].click();
            }
          });
        } else {
          // 目標スコアを0に設定して終了
          const finalConfig = {
            configured_score: storageData.set_score,
            configured_late: storageData.set_late,
            configured_rate: storageData.set_wrong_question.length,
            set_score: 0
          };
          chrome.storage.local.set(finalConfig, function () {
            if (ALLOW_PAGE_TRANSLATION) {
              document.getElementsByClassName("return-links _bottom")[0].children[0].click();
            }
          });
          console.error("エラー");
        }
      }
    });
  }
});