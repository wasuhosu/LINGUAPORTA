console.debug("リンガポルタ拡張機能作動 version:" + chrome.runtime.getManifest().version);
const ALLOW_PAGE_TRANSLATION = 1;
if (ALLOW_PAGE_TRANSLATION == 0) {
    console.warn("ページ遷移オフ");
}
chrome.storage.local.get(null, function (storageData) {
    console.debug(JSON.stringify(storageData));
    if (storageData.id == null && document.body.className != "page-login") {
        console.error("idが設定されていません");
        performLogout();
    }
    let currentPage = "";
    let questionNumber = 0;
    if (document.getElementsByClassName("problem-title")[0] != null && document.getElementsByClassName("page-title")[0].children[0] != null) {
        questionNumber = document.getElementsByClassName("problem-title")[0].innerText.split("：")[1] - 1 + Number(document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[0].slice(1).split("-")[0]);
    }
    let currentScore = 0;
    if (document.getElementsByClassName("score-number")[1] != null) {
        currentScore = Number(document.getElementsByClassName("score-number")[1].innerText);
    }
    let questionType = "";
    let questionNumberList = [];
    let answerText1 = "";
    let answerText2 = "";
    let answerData = "";
    if (document.getElementById("question_td") != null) {
        document.getElementById("question_td").innerHTML = document.getElementById("question_td").innerHTML.replace(/<br>/g, "");
    }
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
    } else if (document.querySelector("#problem-area").innerText == "問題が有りません。") {
        currentPage = "全問題終了画面で再読み込み";
    } else {
        console.error("ページの特定に失敗");
    }
    switch (currentPage) {
        case "ログイン画面":
            console.debug("location:" + currentPage);
            function updateLoginSettings() {
                document.getElementById("current-value_late").innerText = document.getElementById("slider_late").value + "秒";
                document.getElementById("current-value_score").innerText = document.getElementById("slider_score").value + "点";
                document.getElementById("current-value_correct_answer_rate").innerText = Math.round(25 / (150 - document.getElementById("slider_correct_answer_rate").value) * 100) + "%";
                let questionsToFail = [];
                for (let i = 0; i < Math.floor((125 - document.getElementById("slider_correct_answer_rate").value) / 25); i++) {
                    questionsToFail.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25);
                }
                for (let j = 1; j <= Math.floor((125 - document.getElementById("slider_correct_answer_rate").value) % 25); j++) {
                    questionsToFail.push(j);
                }
                let answerDelayMs = Number(document.getElementById("slider_late").value) * 1000;
                let setScore = 0;
                let dummy = "";
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
                chrome.storage.local.set({
                    id: document.getElementsByName("id")[0].value,
                    password: document.getElementsByName("password")[0].value,
                    set_score: setScore,
                    set_late: answerDelayMs,
                    set_wrong_question: questionsToFail,
                    set_run_unit: selectedUnits
                }, function () { });
            }
            document.getElementsByClassName("body")[0].innerHTML = "<form action='/user/seibido/' method='POST'><input type='hidden' name='login' value='login'><div class='login-error-block'></div><div class='input-with-icon login-input-text'><i class='las la-smile'></i><input type='text' name='id' autocomplete='username' placeholder='User ID'></div><div class='input-with-icon login-input-text'><i class='las la-key'></i><div class='password-wrapper'><input type='password' name='password' autocomplete='current-password' placeholder='Password'><button class='button button-trans passwdViewBtn' type='button'>表示</button></div></div><script>makePasswordVisible(document.querySelector('input[type=password]'));</script><div class='login-optx '><a href='resetpw.php'>パスワードを忘れた方&nbsp;<i class='las la-arrow-right'></i></a><a href='https://www.seibido.co.jp/linguaporta/register.html' target='_blank'>リンガポルタの使い方&nbsp;<i class='las la-arrow-right'></i></a></div><div class='center_RL'><label for='switch' class='switch_label'><div class='switch'><input type='checkbox' id='switch' checked /><div class='circle'></div> <div class='base'></div></div><span class='current-status'>OFF</span></label></div><div class='stats-pannel ranking'><div class='title'>SETTINGS</div><div class='body'><table id='table_setting' class='table_original'><tbody><tr id='tr_setting_score'><th style='width:7em;'>獲得するスコア</th><td id='current-value_score' class='current-value' style='width:3em; border-right:none;'></td><td><input type='range' id='slider_score' min='25' max='300' step='25' value='100' style='width:100%' title='自動実行で獲得するスコアを選択します'></td></tr><tr id='tr_setting_late'><th>回答入力遅延</th><td id='current-value_late' class='current-value' style='border-right:none;'></td><td><input type='range' id='slider_late' min='0' max='20' step='1' value='8' style='width:100%' title='回答入力時の遅延を選択します(管理者に自動化ツールと判断されないようにするため)'></td></tr><tr id='tr_setting_rate'><th>正答率</th><td id='current-value_correct_answer_rate' class='current-value' style='border-right:none;'></td><td><input type='range' id='slider_correct_answer_rate' min='50' max='125' step='1' value='115' style='width:100%' title='正答率を選択します(サーバー上に答えがない場合は50%になります)(管理者に自動化ツールと判断されないようにするため)'></td></tr><tr><th>単元</th><td colspan='2' style='text-align:left !important;'><label><input type='checkbox' id='unit_selection_0' name='unit_selection' value='単語の意味' title='単語の意味' checked>単語の意味</label><label><input type='checkbox' id='unit_selection_1' name='unit_selection' value='空所補充' title='空所補充' checked>空所補充</label></td></tr></tbody></table></div></div><div class='login-btn'><button type='submit' value='LOGIN' class='button button-secondary button-big'>スタート</button></div></form> <a href='https://github.com/Raptor-zip/LINGUAPORTA/' class='bookmark source'><div class='bookmark-info'><div class='bookmark-text'><div class='bookmark-title'>《使い方》リンガポルタ自動化ツール</div></div><div class='bookmark-href'><img src='https://github.com/fluidicon.png' class='icon bookmark-icon'>https://github.com/Raptor-zip/LINGUAPORTA/</div></div></a>";
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
            updateLoginSettings();
            const settingElements = Object.freeze(["slider_score", "slider_late", "slider_correct_answer_rate", "unit_selection_0", "unit_selection_1", "switch"]);
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
                        let responseText = await response.text();
                        document.getElementById("units_list").innerHTML = responseText;
                        let unitTableRows = document.getElementsByTagName("table")[0].rows;
                        let foundRunnableQuestion = false;
                        for (let i = 1; i < unitTableRows.length; i++) {
                            const cells = unitTableRows[i].cells;
                            let unitInfo = {
                                unit_name: cells[0].textContent.trim(),
                                start_question_number: Number(cells[0].textContent.trim().split("-")[0].slice(1)),
                                end_question_number: Number(cells[0].textContent.trim().split("-")[1].split(")")[0]),
                                score: Number(cells[1].textContent.trim().split("点")[0]),
                                button_onclick: cells[3].children[0].getAttribute("onclick")
                            };
                            if (unitInfo.button_onclick) {
                                foundRunnableQuestion = true;
                                for (let j = unitInfo.start_question_number; j < unitInfo.end_question_number; j++) {
                                    questionNumberList.push(j);
                                }
                                const unitName = unitInfo.unit_name.split(")")[1];
                                const message = {
                                    id: storageData.id,
                                    request_type: "get",
                                    question_number: questionNumberList
                                };
                                chrome.runtime.sendMessage(message, response => {
                                    console.debug(JSON.stringify(response));
                                    if (response != undefined) {
                                        const newScorePerMode = {
                                            ...storageData.score_per_mode
                                        };
                                        newScorePerMode[unitName] = unitInfo.start_question_number;
                                        let updatedScorePerMode = newScorePerMode;
                                        let newStorageData = {
                                            start_question_number: unitInfo.start_question_number,
                                            start_time: Date.now(),
                                            correct_answer_times: 0,
                                            incorrect_answer_times: 0,
                                            wrong_question_queue: storageData.set_wrong_question,
                                            score_per_mode: updatedScorePerMode
                                        };
                                        response.content.forEach((questionData, index) => {
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
            let learningTimeParts = [];
            for (let i = 1; i < 4; i++) {
                learningTimeParts.push(document.querySelector("body > div > main > section.stats-pannel.portfolio > div.body > div:nth-child(4) > div > span:nth-child(" + i + ")").innerText);
            }
            const learningResultSummary = {
                score: Number(document.getElementsByClassName("xl")[0]),
                challenge_times: Number(document.getElementsByClassName("portfolio-number")[2].innerText.slice(0, -2)),
                learning_time: Number(learningTimeParts[0]) * 60 * 60 + Number(learningTimeParts[1]) * 60 + Number(learningTimeParts[2])
            };
            chrome.storage.local.set(learningResultSummary, function () {
                const portfolioMessage = {
                    id: storageData.id,
                    request_type: "portfolio_record",
                    score: learningResultSummary.score,
                    rank: storageData.rank,
                    challenge_times: learningResultSummary.challenge_times,
                    learning_time: learningResultSummary.learning_time
                };
                chrome.runtime.sendMessage(portfolioMessage, response => {
                    console.debug(JSON.stringify(response));
                    if (storageData.set_score > 0) {
                        if (ALLOW_PAGE_TRANSLATION) {
                            document.querySelector("#spmenu-nav > a:nth-child(1)").click();
                        }
                    } else if (storageData.set_score == 0) {
                        performLogout();
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
                messageDiv.innerHTML = "<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>" + storageData.set_late / 1000 + "秒後に不正解になります。</div>";
                if (storageData.wrong_question_queue.includes(currentScore + 1)) {
                    document.getElementById("tabindex1").value = generateRandomString();
                    document.getElementById("under_area").before(messageDiv);
                    submitAnswer();
                } else {
                    key = "a" + String(questionNumber);
                    if ([key] in storageData && storageData[key][2] != null && storageData[key][2] != "") {
                        document.getElementById("tabindex1").value = storageData[key][2];
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
            console.debug("location:" + currentPage);
            key = "a" + String(questionNumber);
            answerText1 = document.querySelector("#question_area > div.qu03 > input[type=text]").value.trim();
            answerData = key in storageData ? [storageData[key][0], storageData[key][1], answerText1, storageData[key][3], storageData[key][4]] : [null, null, answerText1, null, null];
            const dataToSet = {
                [key]: answerData
            };
            chrome.storage.local.set(dataToSet, function () {
                if (storageData.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
                    document.getElementsByClassName("button button-success button-next-problem")[0].click();
                }
            });
            break;
        case "空所補充-正解後の画面":
        case "空所補充-全問題終了画面":
            console.debug("location:" + currentPage);
            if (storageData.set_score > -2) {
                function proceedToNextStep() {
                    console.log("this_question_info", thisQuestionInfo);
                    if (ALLOW_PAGE_TRANSLATION) {
                        if (currentPage === "空所補充-正解後の画面") {
                            document.getElementsByClassName("button button-success button-next-problem")[0].click();
                        } else if (currentPage === "空所補充-全問題終了画面") {
                            sendResultData();
                        }
                    }
                }
                let thisQuestionInfo = {
                    question_number: questionNumber,
                    question_type: questionType,
                    question_answer_1: document.querySelector("#drill_form > b").innerText.slice(1, -1),
                    question_answer_2: null
                };
                if ("GAS_set_queue" in storageData) {
                    if (storageData.GAS_set_queue.length > 3) {
                        chrome.storage.local.set({
                            GAS_set_queue: [],
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            let newQueue = storageData.GAS_set_queue;
                            newQueue.push(thisQuestionInfo);
                            const message = {
                                id: storageData.id,
                                request_type: "set",
                                content: newQueue
                            };
                            chrome.runtime.sendMessage(message, response => {
                                console.debug(JSON.stringify(response));
                            });
                            proceedToNextStep();
                        });
                    } else {
                        let newQueue = storageData.GAS_set_queue;
                        newQueue.push(thisQuestionInfo);
                        chrome.storage.local.set({
                            GAS_set_queue: newQueue,
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            proceedToNextStep();
                        });
                    }
                } else {
                    chrome.storage.local.set({
                        GAS_set_queue: [thisQuestionInfo],
                        correct_answer_times: storageData.correct_answer_times + 1
                    }, function () {
                        proceedToNextStep();
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
                    let checkedIndex = 0;
                    if (!storageData.wrong_question_queue.includes(currentScore + 1)) {
                        key = "a" + String(questionNumber);
                        if (storageData[key] && storageData[key][1]) {
                            let answerOptions = Array.from({
                                length: 5
                            }, (v, i) => document.getElementById("answer_0_" + i).value);
                            let correctIndex = answerOptions.indexOf(storageData[key][1]);
                            if (correctIndex !== -1) {
                                checkedIndex = correctIndex;
                                messageDiv.innerHTML = "<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>" + storageData.set_late / 1000 + "秒後に正解します。</div>";
                            }
                        }
                    }
                    document.getElementById("answer_0_" + checkedIndex).checked = true;
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
            key = "a" + String(questionNumber);
            answerText1 = document.getElementById("qu02").innerText;
            answerText2 = document.getElementById("drill_form").innerText.slice(3, -2);
            answerData = key in storageData ? [answerText1, answerText2, storageData[key][2], storageData[key][3], storageData[key][4]] : [answerText1, answerText2, null, null, null];
            const dataToSet2 = {
                [key]: answerData
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
                function proceedToNextStep2() {
                    console.log("this_question_info", thisQuestionInfo2);
                    if (ALLOW_PAGE_TRANSLATION) {
                        if (currentPage === "単語の意味-正解後の画面") {
                            document.getElementsByClassName("button button-success button-next-problem")[0].click();
                        } else if (currentPage === "単語の意味-全問題終了画面") {
                            sendResultData();
                        }
                    }
                }
                let thisQuestionInfo2 = {
                    question_number: questionNumber,
                    question_type: questionType,
                    question_answer_1: document.getElementById("qu02").innerText,
                    question_answer_2: document.getElementById("drill_form").innerText.slice(4, -2)
                };
                if ("GAS_set_queue" in storageData) {
                    if (storageData.GAS_set_queue.length > 7) {
                        chrome.storage.local.set({
                            GAS_set_queue: [],
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            let newQueue = storageData.GAS_set_queue;
                            newQueue.push(thisQuestionInfo2);
                            const message = {
                                id: storageData.id,
                                request_type: "set",
                                content: newQueue
                            };
                            chrome.runtime.sendMessage(message, response => {
                                console.debug(JSON.stringify(response));
                            });
                            proceedToNextStep2();
                        });
                    } else {
                        let newQueue = storageData.GAS_set_queue;
                        newQueue.push(thisQuestionInfo2);
                        chrome.storage.local.set({
                            GAS_set_queue: newQueue,
                            correct_answer_times: storageData.correct_answer_times + 1
                        }, function () {
                            proceedToNextStep2();
                        });
                    }
                } else {
                    chrome.storage.local.set({
                        GAS_set_queue: [thisQuestionInfo2],
                        correct_answer_times: storageData.correct_answer_times + 1
                    }, function () {
                        proceedToNextStep2();
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
            const persistentKeys = Object.freeze(["id", "password", "set_score", "set_late", "set_wrong_question", "set_run_unit", "score", "rank", "challenge_times", "learning_time", "wrong_question_queue", "score_per_mode"]);
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
        chrome.runtime.sendMessage({
            id: storageData.id,
            request_type: "result_setting_record",
            version: chrome.runtime.getManifest().version,
            set_score: storageData.set_score,
            set_late: storageData.set_late / 1000,
            set_wrong_question: storageData["set_wrong_question.length"],
            set_run_unit: storageData.set_run_unit.join(),
            run_unit: questionType,
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
                    console.error("エラー");
                }
            }
        });
    }
});