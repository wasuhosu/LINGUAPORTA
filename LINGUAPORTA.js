console.debug("リンガポルタ拡張機能作動 version:" + chrome.runtime.getManifest().version);
const ALLOW_PAGE_TRANSLATION = 1;
if (ALLOW_PAGE_TRANSLATION == 0) {
    console.warn("ページ遷移オフ");
}

// フォールバック用の初期値設定（background.jsで設定されない場合のため）
// 拡張機能の初回インストール時やストレージが空の場合にデフォルトのGAS URLを設定
chrome.storage.local.get(['gas_url'], function(result) {
    if (!result.gas_url) {
        chrome.storage.local.set({
            gas_url: "https://script.google.com/macros/s/AKfycbzt9E7IMfXDy-tqPejjKyQgtytEi4YuXVRS9I7nuDPWut3zprueHne9k3s7lUXPl4DctA/exec"
        });
    }
});

// 現在のページを特定する関数
// リンガポルタのページ状態を判定し、適切な自動化処理を行うために使用
function getCurrentPageInfo() {
    let currentPage = "";
    let questionType = "";
    
    // ページタイトルから問題の種類（空所補充 or 単語の意味）を判定
    if (document.body.className == "page-problem") {
        questionType = document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[1];
    } else {
        questionType = "一覧";
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
    } else if (questionType == "空所補充") {
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
    } else if (questionType == "単語の意味") {
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
    } else if (document.querySelector("#problem-area") && document.querySelector("#problem-area").innerText == "問題が有りません。") {
        currentPage = "全問題終了画面で再読み込み";
    } else {
        console.error("ページの特定に失敗");
    }
    
    return {
        currentPage: currentPage,
        questionType: questionType
    };
}

function checkForUpdates() {
    const repo = "wasuhosu/LINGUAPORTA";
    const latestReleaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;

    fetch(latestReleaseUrl)
        .then(response => response.json())
        .then(data => {
            const latestVersion = data.tag_name.replace('v', '');
            const currentVersion = chrome.runtime.getManifest().version;

            // バージョンを比較し、新しいバージョンがあれば通知を表示
            if (compareVersions(latestVersion, currentVersion) > 0) {
                displayUpdateNotification(latestVersion, data.html_url);
            }
        })
        .catch(error => console.error('Error checking for updates:', error));
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}

function displayUpdateNotification(newVersion, releaseUrl) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="padding: 15px; background-color: #1e90ff; color: white; text-align: center; font-size: 16px;">
            新しいバージョン (v${newVersion}) が利用可能です。
            <a href="${releaseUrl}" target="_blank" style="color: white; font-weight: bold; text-decoration: underline;">
                更新内容を確認してダウンロード
            </a>
        </div>
    `;
    document.body.prepend(notification);
}

chrome.storage.local.get(null, function (storageData) {
    if (storageData.id == null && document.body.className != "page-login") {
        console.error("idが設定されていません");
        performLogout();
    }
    // ページ情報を取得
    const pageInfo = getCurrentPageInfo();
    let currentPage = pageInfo.currentPage;
    let questionType = pageInfo.questionType;
    
    // 現在の問題番号を計算（複雑な計算式のため詳細説明）
    let questionNumber = 0;
    if (document.getElementsByClassName("problem-title")[0] != null && document.getElementsByClassName("page-title")[0].children[0] != null) {
        // 問題タイトル「問題：2」から「2」を抽出し、-1してインデックス化
        // ページタイトル「(1-25)空所補充」から「1」を抽出し、開始番号として加算
        // 結果：実際の問題番号 = (画面上の問題番号 - 1) + 単元開始番号
        questionNumber = document.getElementsByClassName("problem-title")[0].innerText.split("：")[1] - 1 + Number(document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[0].slice(1).split("-")[0]);
    }
    let currentScore = 0;
    if (document.getElementsByClassName("score-number")[1] != null) {
        currentScore = Number(document.getElementsByClassName("score-number")[1].innerText);
    }
    let questionNumberList = [];
    if (document.getElementById("question_td") != null) {
        document.getElementById("question_td").innerHTML = document.getElementById("question_td").innerHTML.replace(/<br>/g, "");
    }
    switch (currentPage) {
        case "ログイン画面":
            console.debug("location:" + currentPage);
            checkForUpdates();
            function updateLoginSettings() {
                document.getElementById("current-value_late").innerText = document.getElementById("slider_late").value + "秒";
                document.getElementById("current-value_score").innerText = document.getElementById("slider_score").value + "点";
                document.getElementById("current-value_correct_answer_rate").innerText = document.getElementById("slider_correct_answer_rate").value + "%";
                
                // 学習時間の概算を計算・表示
                let score = Number(document.getElementById("slider_score").value);
                let delayTime = Number(document.getElementById("slider_late").value);
                let correctRate = Number(document.getElementById("slider_correct_answer_rate").value) / 100;
                let estimatedTime = Math.round(score * (delayTime + 3) * (1 / correctRate));
                document.getElementById("estimated-time").innerText = Math.round(estimatedTime / 60) + "分";
                
                let questionsToFail = [];
                let incorrectRate = 100 - (correctRate * 100);
                // 25問中の不正解数を計算
                let incorrectCount = Math.round(25 * incorrectRate / 100);
                // 不正解にする問題番号をランダムに選択
                for (let i = 1; i <= incorrectCount; i++) {
                    questionsToFail.push(i);
                }
                let answerDelayMs = Number(document.getElementById("slider_late").value) * 1000;
                let setScore = 0;
                let selectedUnits = [];
                document.querySelectorAll("input[name=\"unit_selection\"]").forEach(checkbox => {
                    if (checkbox.checked) {
                        selectedUnits.push(checkbox.value);
                    }
                });
                if (document.getElementById("switch").checked) {
                    document.querySelector(".current-status").textContent = "自動化ON";
                    document.getElementsByClassName("stats-pannel ranking")[0].classList.remove("display-none");
                    setScore = Number(document.getElementById("slider_score").value);
                } else {
                    document.querySelector(".current-status").textContent = "自動化OFF";
                    document.getElementsByClassName("stats-pannel ranking")[0].classList.add("display-none");
                    setScore = -2;
                    answerDelayMs = null;
                    questionsToFail = null;
                    selectedUnits = null;
                }
                // ユーザー設定をChromeストレージに保存
                chrome.storage.local.set({
                    id: document.getElementsByName("id")[0].value,        // ログインID
                    password: document.getElementsByName("password")[0].value, // パスワード
                    set_score: setScore,                                   // 目標獲得スコア(-2=自動化OFF, 0=停止, >0=継続)
                    set_late: answerDelayMs,                              // 回答遅延時間(ミリ秒)
                    set_wrong_question: questionsToFail,                  // 意図的に間違える問題番号の配列
                    set_run_unit: selectedUnits,                          // 学習対象の単元名配列
                    gas_url: document.getElementById("gas_url").value      // Google Apps ScriptのURL
                }, function () { });
            }
            // ログイン画面に自動化設定UIを埋め込み
            // 元のログインフォームを拡張して、自動化ON/OFF、スコア設定、遅延設定、正答率設定、単元選択を追加
            document.getElementsByClassName("body")[0].innerHTML = "<form action='/user/seibido/' method='POST'><input type='hidden' name='login' value='login'><div class='login-error-block'></div><div class='input-with-icon login-input-text'><i class='las la-smile'></i><input type='text' name='id' autocomplete='username' placeholder='User ID'></div><div class='input-with-icon login-input-text'><i class='las la-key'></i><div class='password-wrapper'><input type='password' name='password' autocomplete='current-password' placeholder='Password'><button class='button button-trans passwdViewBtn' type='button'>表示</button></div></div><script>makePasswordVisible(document.querySelector('input[type=password]'));</script><div class='login-optx '><a href='resetpw.php'>パスワードを忘れた方&nbsp;<i class='las la-arrow-right'></i></a><a href='https://www.seibido.co.jp/linguaporta/register.html' target='_blank'>リンガポルタの使い方&nbsp;<i class='las la-arrow-right'></i></a></div><div class='center_RL'><label for='switch' class='switch_label'><div class='switch'><input type='checkbox' id='switch' checked /><div class='circle'></div> <div class='base'></div></div><span class='current-status'>OFF</span></label></div><div class='stats-pannel ranking'><div class='title'>SETTINGS</div><div class='body'><div class='tab-container'><div class='tab-buttons'><button type='button' class='tab-button active' data-tab='basic'>基本設定</button><button type='button' class='tab-button' data-tab='advanced'>詳細設定</button></div><div class='tab-content' id='basic-tab'><table id='table_setting' class='table_original'><tbody><tr id='tr_setting_score'><th style='width:7em;'>獲得するスコア</th><td id='current-value_score' class='current-value' style='width:3em; border-right:none;'></td><td><input type='range' id='slider_score' min='25' max='1500' step='25' value='100' style='width:100%' title='自動実行で獲得するスコアを選択します'></td></tr><tr id='tr_setting_late'><th>回答入力遅延</th><td id='current-value_late' class='current-value' style='border-right:none;'></td><td><input type='range' id='slider_late' min='0' max='20' step='1' value='8' style='width:100%' title='回答入力時の遅延を選択します(管理者に自動化ツールと判断されないようにするため)'></td></tr><tr id='tr_setting_rate'><th>正答率</th><td id='current-value_correct_answer_rate' class='current-value' style='border-right:none;'></td><td><input type='range' id='slider_correct_answer_rate' min='0' max='100' step='1' value='80' style='width:100%' title='正答率を選択します(0-100%)(管理者に自動化ツールと判断されないようにするため)'></td></tr><tr><th>予想実行時間</th><td id='estimated-time' class='current-value' style='width:4em; border-right:none; color:#007cba !important; font-weight:bold; white-space:nowrap;'></td><td style='color:#666; font-size:12px;'>概算時間</td></tr><tr><th>単元</th><td colspan='2' style='text-align:left !important;'><label><input type='checkbox' id='unit_selection_0' name='unit_selection' value='単語の意味' title='単語の意味' checked>単語の意味</label><label><input type='checkbox' id='unit_selection_1' name='unit_selection' value='空所補充' title='空所補充' checked>空所補充</label></td></tr></tbody></table></div><div class='tab-content' id='advanced-tab' style='display:none;'><table class='table_original'><tbody><tr><th style='width:7em; color:#333 !important;'>GAS URL</th><td colspan='2'><input type='url' id='gas_url' placeholder='https://script.google.com/macros/s/.../exec' style='width:100%; padding:5px; border:1px solid #ccc; border-radius:3px; color:#333 !important;' title='Google Apps ScriptのWebアプリURLを入力してください'></td></tr><tr><td colspan='3' style='padding:10px; color:#666; font-size:12px; line-height:1.4;'>※ Google Apps ScriptのWebアプリURLを入力してください。<br>デフォルト値が設定されているため、通常は変更不要です。</td></tr></tbody></table></div></div></div></div><div class='login-btn'><button type='submit' value='LOGIN' class='button button-secondary button-big'>スタート</button></div></form><style>.tab-container{margin-top:10px;}.tab-buttons{display:flex;border-bottom:1px solid #ccc;margin-bottom:10px;}.tab-button{flex:1;padding:10px 16px;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;font-size:14px;color:#333 !important;transition:all 0.3s;}.tab-button:hover{background:#f5f5f5;color:#007cba !important;}.tab-button.active{border-bottom-color:#007cba;color:#007cba !important;background:#fff;}.tab-content{min-height:150px;padding:10px 0;color:#333 !important;}.tab-content table th{color:#333 !important;}.tab-content table td{color:#333 !important;}</style> <a href='https://github.com/Raptor-zip/LINGUAPORTA/' class='bookmark source'><div class='bookmark-info'><div class='bookmark-text'><div class='bookmark-title'>《使い方》リンガポルタ自動化ツール</div></div><div class='bookmark-href'><img src='https://github.com/fluidicon.png' class='icon bookmark-icon'>https://github.com/Raptor-zip/LINGUAPORTA/</div></div></a>";
            // タブ機能の初期化
            setTimeout(function() {
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.addEventListener('click', function() {
                        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
                        this.classList.add('active');
                        document.getElementById(this.dataset.tab + '-tab').style.display = 'block';
                    });
                });
            }, 100);
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
            if (storageData.gas_url != null) {
                document.getElementById("gas_url").value = storageData.gas_url;
            }
            updateLoginSettings();
            // 設定変更時にリアルタイムで値を更新するためのイベントリスナーを設定
            // 各設定要素（スライダー、チェックボックス、スイッチ）の変更を監視
            const settingElements = Object.freeze(["slider_score", "slider_late", "slider_correct_answer_rate", "unit_selection_0", "unit_selection_1", "switch", "gas_url"]);
            for (let i = 0; i < settingElements.length; i++) {
                document.getElementById(settingElements[i]).addEventListener("change", updateLoginSettings);
            }
            break;
        case "ホーム画面":
            console.debug("location:" + currentPage);
            cleanupStorage();
            if (storageData.set_score > -2) {
                chrome.storage.local.set({
                    rank: Number(document.getElementsByClassName("score-number text-right")[0].innerText)
                }, function () {
                    if (ALLOW_PAGE_TRANSLATION) {
                        document.querySelector("#spmenu-nav > a:nth-child(2)").click();
                    }
                });
            }
            break;
        case "書籍選択画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > -2) {
                document.getElementsByClassName("button-secondary")[0].click();
            }
            break;
        case "学習ユニット選択画面":
            console.debug("location:" + currentPage);
            cleanupStorage();
            if ("set_score" in storageData) {
                if (storageData.set_score > 0) {
                    async function selectUnitAndStart(pageNumber = 1) {
                        let scorePerMode = storageData.score_per_mode;
                        let nextUnitName = "";
                        if (scorePerMode == null) {
                            nextUnitName = "空所補充";
                        } else if (storageData.set_run_unit.every(unit => Object.keys(scorePerMode).includes(unit))) {
                            let filteredScores = Object.keys(scorePerMode).filter(unit => storageData.set_run_unit.includes(unit)).reduce((obj, key) => {
                                obj[key] = scorePerMode[key];
                                return obj;
                            }, {});
                            nextUnitName = Object.keys(filteredScores).reduce((a, b) => filteredScores[a] < filteredScores[b] ? a : b);
                        } else {
                            nextUnitName = storageData.set_run_unit[0];
                        }
                        let unitsApiUrl = "user/units.php";
                        let requestParams = new URLSearchParams();
                        requestParams.append("reference_num", "70");
                        requestParams.append("search", nextUnitName);
                        if (pageNumber > 1) {
                            requestParams.append("unit_list_page", pageNumber);
                        } else {
                            requestParams.append("paging_size", "50");
                        }
                        // リンガポルタの単元一覧APIにリクエストを送信
                        let response = await fetch(unitsApiUrl, {
                            method: "POST",
                            body: requestParams,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        });
                        if (!response.ok) {
                            throw new Error("HTTP error! status: " + response.status);
                        }
                        // APIレスポンスをHTMLとしてページに埋め込み
                        let responseText = await response.text();
                        document.getElementById("units_list").innerHTML = responseText;
                        let unitTableRows = document.getElementsByTagName("table")[0].rows;
                        let foundRunnableQuestion = false;
                        // 単元一覧テーブルから実行可能な単元を検索
                        for (let i = 1; i < unitTableRows.length; i++) {
                            const cells = unitTableRows[i].cells;
                            // テーブルの各行から単元情報を抽出
                            // 例: "(1-25)空所補充" から開始番号1、終了番号25を取得
                            let unitInfo = {
                                unit_name: cells[0].textContent.trim(), // 単元名: "(1-25)空所補充"
                                start_question_number: Number(cells[0].textContent.trim().split("-")[0].slice(1)), // 開始問題番号: 1
                                end_question_number: Number(cells[0].textContent.trim().split("-")[1].split(")")[0]), // 終了問題番号: 25
                                score: Number(cells[1].textContent.trim().split("点")[0]), // 獲得可能スコア
                                button_onclick: cells[3].children[0].getAttribute("onclick") // 開始ボタンのクリック属性
                            };
                            // 開始ボタンが有効な場合（学習可能な単元）
                            if (unitInfo.button_onclick) {
                                foundRunnableQuestion = true;
                                // 単元内の全問題番号をリストに追加
                                for (let j = unitInfo.start_question_number; j < unitInfo.end_question_number; j++) {
                                    questionNumberList.push(j);
                                }
                                // 単元名から種類を抽出("空所補充"または"単語の意味")
                                const unitName = unitInfo.unit_name.split(")")[1];
                                // GASサーバーに問題データをリクエスト
                                const message = {
                                    request_type: "get",
                                    question_number: questionNumberList
                                };
                                // background.js経由でGASサーバーにメッセージ送信
                                chrome.runtime.sendMessage(message, response => {
                                    console.debug(JSON.stringify(response));
                                    if (response != undefined) {
                                        // 学習進捗情報を更新
                                        const newScorePerMode = {
                                            ...storageData.score_per_mode
                                        };
                                        newScorePerMode[unitName] = unitInfo.start_question_number;
                                        let updatedScorePerMode = newScorePerMode;
                                        // 新しい学習セッションの初期データを作成
                                        let newStorageData = {
                                            start_question_number: unitInfo.start_question_number, // 開始問題番号
                                            start_time: Date.now(),                               // 学習開始時刻
                                            correct_answer_times: 0,                             // 正解数カウンター
                                            incorrect_answer_times: 0,                           // 不正解数カウンター
                                            wrong_question_queue: storageData.set_wrong_question, // 意図的に間違える問題キュー
                                            score_per_mode: updatedScorePerMode                  // 各モードの進捗状況
                                        };
                                        // GASサーバーから取得した問題データをストレージに保存
                                        response.content.forEach((questionData) => {
                                            newStorageData["a" + questionData[0]] = questionData.slice(1, 6);
                                        });
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
                                break;
                            }
                        }
                        if (!foundRunnableQuestion) {
                            selectUnitAndStart(pageNumber + 1);
                        }
                    }
                    selectUnitAndStart(1);
                } else if (storageData.set_score == 0) {
                    performLogout();
                }
            } else {
                console.error("エラー");
                performLogout();
            }
            break;
        case "学習結果表示画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > 0) {
                if (ALLOW_PAGE_TRANSLATION) {
                    document.querySelector("#spmenu-nav > a:nth-child(1)").click();
                }
            } else if (storageData.set_score == 0) {
                performLogout();
            } else if (storageData.set_score != -2) {
                console.error("エラー");
            }
            break;
        case "空所補充-問題出題画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > 0) {
                // ユーザーに表示するメッセージ要素を作成
                let messageDiv = document.createElement("div");
                messageDiv.innerHTML = "<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>" + storageData.set_late / 1000 + "秒後に不正解になります。</div>";
                // 現在の問題を意図的に間違えるか判定
                if (storageData.wrong_question_queue.includes(currentScore + 1)) {
                    document.getElementById("tabindex1").value = generateRandomString();
                    document.getElementById("under_area").before(messageDiv);
                    submitAnswer();
                } else {
                    let key1 = "a" + String(questionNumber);
                    if ([key1] in storageData && storageData[key1][2] != null && storageData[key1][2] != "") {
                        document.getElementById("tabindex1").value = storageData[key1][2];
                        messageDiv.innerHTML = "<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>" + storageData.set_late / 1000 + "秒後に正解します。</div>";
                        document.getElementById("under_area").before(messageDiv);
                    } else {
                        document.getElementById("tabindex1").value = generateRandomString();
                        document.getElementById("under_area").before(messageDiv);
                    }
                    submitAnswer();
                }
            }
            break;
        case "空所補充-不正解画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > 0) {
                let wrongQueue = storageData.wrong_question_queue;
                wrongQueue.splice(storageData.wrong_question_queue.indexOf(currentScore + 1), 1);
                chrome.storage.local.set({
                    incorrect_answer_times: storageData.incorrect_answer_times + 1,
                    wrong_question_queue: wrongQueue
                }, function () {
                    if (storageData.set_score > 0) {
                        if (ALLOW_PAGE_TRANSLATION) {
                            document.getElementsByClassName("button button-trans problem-view-answer")[0].click();
                        }
                    }
                });
            }
            break;
        case "空所補充-正解表示画面":
            // 空所補充-正解表示画面の処理
            console.debug("location:" + currentPage);
            // 問題番号キーを生成（空所補充はkey1_）
            let key1 = "a" + String(questionNumber);
            let answerText1 = document.querySelector("#question_area > div.qu03 > input[type=text]").value.trim();
            let answerData = key1 in storageData
                        ? [storageData[key1][0], null, answerText1, storageData[key1][3], storageData[key1][4]]
                        : [null, null, answerText1, null, null];
            const dataToSet1 = {
                [key1]: answerData
            };
            chrome.storage.local.set(dataToSet1, function () {
                if (storageData.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
                    document.getElementsByClassName("button button-success button-next-problem")[0].click();
                }
            });
            break;
        case "空所補充-正解後の画面":
        case "空所補充-全問題終了画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > -2) {
                function proceedToNextStepForFillBlank() {
                    console.log("this_question_info", thisQuestionInfoForFillBlank);
                    if (ALLOW_PAGE_TRANSLATION) {
                        if (currentPage === "空所補充-正解後の画面") {
                            document.getElementsByClassName("button button-success button-next-problem")[0].click();
                        } else if (currentPage === "空所補充-全問題終了画面") {
                            sendResultData();
                        }
                    }
                }
                let thisQuestionInfoForFillBlank = {
                    question_number: questionNumber,
                    question_type: questionType,
                    question_answer_1: document.querySelector("#drill_form > b").innerText.slice(1, -1),
                    question_answer_2: null
                };
                // GAS_set_queueが存在する場合はバッファに追加し、4件ごとにGASサーバーへ送信
                if ("GAS_set_queue" in storageData) {
                    if (storageData.GAS_set_queue.length > 3) {
                        // 4件以上溜まったら送信してバッファをクリア
                        chrome.storage.local.set({
                            GAS_set_queue: [],
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            let newQueue = storageData.GAS_set_queue;
                            newQueue.push(thisQuestionInfoForFillBlank);
                            const message = {
                                request_type: "set",
                                content: newQueue
                            };
                            // GASサーバーに送信
                            console.log(message.content)
                            chrome.runtime.sendMessage(message, response => {
                                console.debug(JSON.stringify(response));
                            });
                            proceedToNextStepForFillBlank();
                        });
                    } else {
                        // バッファに追加のみ
                        let newQueue = storageData.GAS_set_queue;
                        newQueue.push(thisQuestionInfoForFillBlank);
                        chrome.storage.local.set({
                            GAS_set_queue: newQueue,
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            proceedToNextStepForFillBlank();
                        });
                    }
                } else {
                    // 初回は配列を作成
                    chrome.storage.local.set({
                        GAS_set_queue: [thisQuestionInfoForFillBlank],
                        correct_answer_times: storageData.correct_answer_times + 1
                    }, function () {
                        proceedToNextStepForFillBlank();
                    });
                }
            }
            break;
        case "単語の意味-問題出題画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > 0) {
                let messageDiv = document.createElement("div");
                messageDiv.innerHTML = "<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>" + storageData.set_late / 1000 + "秒後に不正解になります。</div>";
                if (storageData.wrong_question_queue !== undefined) {
                    let checkedIndex2 = 0;
                    if (!storageData.wrong_question_queue.includes(currentScore + 1)) {
                        let key2 = "a2_" + String(questionNumber);
                        if (storageData[key2] && storageData[key2][1]) {
                            let answerOptions2 = Array.from({
                                length: 5
                            }, (v, i) => document.getElementById("answer_0_" + i).value);
                            let correctIndex2 = answerOptions2.indexOf(storageData[key2][1]);
                            if (correctIndex2 !== -1) {
                                checkedIndex2 = correctIndex2;
                                messageDiv.innerHTML = "<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>" + storageData.set_late / 1000 + "秒後に正解します。</div>";
                            }
                        }
                    }
                    document.getElementById("answer_0_" + checkedIndex2).checked = true;
                    document.getElementById("under_area").before(messageDiv);
                    submitAnswer();
                } else {
                    console.error("wrong_question_queue is NULL");
                    document.getElementById("answer_0_0").checked = true;
                    document.getElementById("under_area").before(messageDiv);
                    submitAnswer();
                }
            }
            break;
        case "単語の意味-不正解画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > 0) {
                let wrongQueue = storageData.wrong_question_queue;
                wrongQueue.splice(storageData.wrong_question_queue.indexOf(currentScore + 1), 1);
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
            let key2 = "a" + String(questionNumber);
            let answerText1_word = document.getElementById("qu02").innerText;
            let answerText2_word = document.getElementById("drill_form").innerText.slice(3, -2);
            let answerData_word = key2 in storageData 
                        ? [answerText1_word, answerText2_word, storageData[key2][2], storageData[key2][3], storageData[key2][4]] 
                        : [answerText1_word, answerText2_word, null, null, null];
            const dataToSet2 = {
                [key2]: answerData_word
            };
            chrome.storage.local.set(dataToSet2, function () {
                if (storageData.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
                    document.getElementsByClassName("button button-success button-next-problem")[0].click();
                }
            });
            break;
        case "単語の意味-正解後の画面":
        case "単語の意味-全問題終了画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > -2) {
                function proceedToNextStepForWordMeaning() {
                    console.log("this_question_info", thisQuestionInfoForWordMeaning);
                    if (ALLOW_PAGE_TRANSLATION) {
                        if (currentPage === "単語の意味-正解後の画面") {
                            document.getElementsByClassName("button button-success button-next-problem")[0].click();
                        } else if (currentPage === "単語の意味-全問題終了画面") {
                            sendResultData();
                        }
                    }
                }
                let thisQuestionInfoForWordMeaning = {
                    question_number: questionNumber,
                    question_type: questionType,
                    question_answer_1: document.getElementById("qu02").innerText,
                    question_answer_2: document.getElementById("drill_form").innerText.slice(4, -2)
                };
                // GAS_set_queueが存在する場合はバッファに追加し、4件ごとにGASサーバーへ送信
                if ("GAS_set_queue" in storageData) {
                    if (storageData.GAS_set_queue.length > 3) {
                        // 4件以上溜まったら送信してバッファをクリア
                        chrome.storage.local.set({
                            GAS_set_queue: [],
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            let newQueue = storageData.GAS_set_queue;
                            newQueue.push(thisQuestionInfoForWordMeaning);
                            const message = {
                                request_type: "set",
                                content: newQueue
                            };
                            // GASサーバーに送信
                            console.log(message)
                            chrome.runtime.sendMessage(message, response => {
                                console.debug(JSON.stringify(response));
                            });
                            proceedToNextStepForWordMeaning();
                        });
                    } else {
                        // バッファに追加のみ
                        let newQueue = storageData.GAS_set_queue;
                        newQueue.push(thisQuestionInfoForWordMeaning);
                        chrome.storage.local.set({
                            GAS_set_queue: newQueue,
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            proceedToNextStepForWordMeaning();
                        });
                    }
                } else {
                    // 初回は配列を作成
                    chrome.storage.local.set({
                        GAS_set_queue: [thisQuestionInfoForWordMeaning],
                        correct_answer_times: storageData.correct_answer_times + 1
                    }, function () {
                        proceedToNextStepForWordMeaning();
                    });
                }
            }
            break;
        case "全問題終了画面で再読み込み":
            console.debug("location:" + currentPage);
            document.querySelector("body > div > form:nth-child(6)").submit();
        default:
            console.error("エラー");
            console.debug(document.querySelector("html").innerText);
    }

    function cleanupStorage() {
        for (let key in storageData) {
            const persistentKeys = Object.freeze(["id", "password", "set_score", "set_late", "set_wrong_question", "set_run_unit", "score", "rank", "challenge_times", "learning_time", "wrong_question_queue", "score_per_mode", "gas_url"]);
            if (!persistentKeys.includes(key)) {
                chrome.storage.local.remove(key);
            }
        }
    }

    async function performLogout() {
        if (ALLOW_PAGE_TRANSLATION) {
            const logoutUrl = "";
            const logoutParams = new URLSearchParams();
            logoutParams.append("login", "logout");
            const response = await fetch(logoutUrl, {
                method: "POST",
                body: logoutParams,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            location.reload();
        }
    }

    function generateRandomString() {
        const characters = "abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function submitAnswer() {
        setTimeout(() => {
            if (ALLOW_PAGE_TRANSLATION) {
                document.getElementById("ans_submit").click();
            }
        }, storageData.set_late);
    }

    function sendResultData() {
        if (storageData.set_score > -2) {
            if ("set_score" in storageData) {
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
                const newConfig = {
                    configured_score: storageData.set_score,
                    configured_late: storageData.set_late,
                    configured_rate: storageData.set_wrong_question.length,
                    set_score: 0
                };
                chrome.storage.local.set(newConfig, function () {
                    if (ALLOW_PAGE_TRANSLATION) {
                        document.getElementsByClassName("return-links _bottom")[0].children[0].click();
                    }
                });
            }
        }
    }
});